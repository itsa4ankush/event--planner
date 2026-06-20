/**
 * EventPilot AI - Orchestrator/Intake Agent
 * Phase 3: Conversational intake with text + voice support
 * Uses rule-based pattern matching (no external LLM needed)
 */

import { BaseAgent, AgentResult } from './base-agent';
import { Event, EventBriefAnswer, KpiCategory, isValidEventType } from '@/lib/db/schema';
import { db } from '@/lib/db/store';

export interface IntakeInput {
  message: string;
  inputMode: 'text' | 'voice';
  eventId?: string;
  organizerId: string;
}

export interface IntakeOutput {
  response: string;
  eventBrief?: Partial<Event>;
  categories?: KpiCategory[];
  isComplete: boolean;
  nextQuestion?: string;
  eventId?: string;
}

interface ConversationState {
  eventId?: string;
  collectedData: Partial<Event>;
  currentQuestion?: string;
}

export class OrchestratorAgent extends BaseAgent {
  private conversationStates: Map<string, ConversationState> = new Map();

  constructor() {
    super({
      name: 'Orchestrator',
      description: 'Handles event intake Q&A and coordinates other agents',
      enabled: true,
    });
  }

  async execute(input: IntakeInput): Promise<AgentResult<IntakeOutput>> {
    this.log(`Processing ${input.inputMode} input: "${input.message}"`);

    try {
      // Get or create conversation state
      const stateKey = input.eventId || input.organizerId;
      let state = this.conversationStates.get(stateKey) || {
        collectedData: { organizer_id: input.organizerId, status: 'draft' as const },
      };

      // Extract information from the message using pattern matching
      const extraction = this.extractEventDetails(input.message, state.currentQuestion);
      
      // Merge extracted data
      state.collectedData = { ...state.collectedData, ...extraction };
      
      // Save the answer if we have an event
      if (input.eventId) {
        db.eventBriefAnswers.create({
          event_id: input.eventId,
          question_key: state.currentQuestion || 'general',
          answer_value: input.message,
          input_mode: input.inputMode,
        });
      }

      // Check if we have enough information
      const missingFields = this.getMissingFields(state.collectedData);
      const isComplete = missingFields.length === 0;

      let response: string;
      let nextQuestion: string | undefined;
      let eventId = state.eventId;
      let categories: KpiCategory[] | undefined;

      if (isComplete) {
        // Create or update the event
        if (!eventId) {
          const event = db.events.create({
            organizer_id: input.organizerId,
            title: state.collectedData.title || 'Untitled Event',
            event_type: state.collectedData.event_type || 'other',
            date: state.collectedData.date || new Date(),
            time: state.collectedData.time || '18:00',
            location_text: state.collectedData.location_text || '',
            lat: state.collectedData.lat,
            lng: state.collectedData.lng,
            guest_count: state.collectedData.guest_count || 0,
            budget_total: state.collectedData.budget_total,
            status: 'planning',
          });
          eventId = event.id;
          state.eventId = eventId;
          console.log('[Orchestrator] Created event:', eventId);
          console.log('[Orchestrator] Event details:', event);
          console.log('[Orchestrator] All events in store:', db.events.findAll());
        }

        // Infer and create KPI categories
        const categoryNames = this.inferCategories(state.collectedData.event_type || 'other');
        categories = categoryNames.map(name =>
          db.kpiCategories.create({
            event_id: eventId!,
            name,
            status: 'not_started',
          })
        );

        response = `Perfect! I have all the information I need. Your ${state.collectedData.event_type?.replace('_', ' ')} event "${state.collectedData.title}" is set for ${new Date(state.collectedData.date!).toLocaleDateString()} with ${state.collectedData.guest_count} guests at ${state.collectedData.location_text}. I've identified ${categories.length} key categories to help you plan. Let's start finding vendors!`;
        
        // Clear state
        this.conversationStates.delete(stateKey);
      } else {
        // Ask for the next missing field
        const nextField = missingFields[0];
        nextQuestion = this.generateFollowUpQuestion(nextField, state.collectedData);
        response = nextQuestion;
        state.currentQuestion = nextField;
        
        // Update state
        this.conversationStates.set(stateKey, state);
      }

      return this.createSuccessResult({
        response,
        eventBrief: state.collectedData,
        categories,
        isComplete,
        nextQuestion,
        eventId,
      });
    } catch (error) {
      this.log(`Intake failed: ${error}`, 'error');
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private extractEventDetails(message: string, currentQuestion?: string): Partial<Event> {
    const data: Partial<Event> = {};
    const lowerMessage = message.toLowerCase();

    // Extract based on what question we just asked
    if (currentQuestion === 'title') {
      data.title = message.trim();
    } else if (currentQuestion === 'event_type') {
      data.event_type = this.detectEventType(lowerMessage);
    } else if (currentQuestion === 'date') {
      data.date = this.parseDate(message);
    } else if (currentQuestion === 'time') {
      data.time = this.parseTime(message);
    } else if (currentQuestion === 'location_text') {
      data.location_text = message.trim();
    } else if (currentQuestion === 'guest_count') {
      data.guest_count = this.extractNumber(message);
    } else if (currentQuestion === 'budget_total') {
      data.budget_total = this.extractNumber(message);
    } else {
      // First message - try to extract everything
      data.event_type = this.detectEventType(lowerMessage);
      
      const guestMatch = message.match(/(\d+)\s*(people|guests|attendees|persons)/i);
      if (guestMatch) data.guest_count = parseInt(guestMatch[1]);
      
      const budgetMatch = message.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
      if (budgetMatch) data.budget_total = parseFloat(budgetMatch[1].replace(/,/g, ''));
      
      // Try to extract location - look for "in [location]" or "at [location]"
      const locationPatterns = [
        /\bin\s+(?:my\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:home|backyard|office|venue))?)/,
        /\bat\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
        /\bnear\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
      ];
      
      for (const pattern of locationPatterns) {
        const match = message.match(pattern);
        if (match) {
          data.location_text = match[1].trim();
          break;
        }
      }
    }

    return data;
  }

  private detectEventType(message: string): Event['event_type'] | undefined {
    const typePatterns: Record<Event['event_type'], string[]> = {
      sports_viewing: ['watch party', 'viewing party', 'game', 'match', 'fifa', 'world cup', 'super bowl', 'sports'],
      corporate: ['corporate', 'company', 'business', 'meeting', 'offsite', 'team building', 'conference'],
      birthday: ['birthday', 'bday', 'b-day', 'anniversary'],
      wedding: ['wedding', 'marriage', 'reception'],
      conference: ['conference', 'summit', 'symposium', 'convention'],
      other: [],
    };

    for (const [type, patterns] of Object.entries(typePatterns)) {
      if (patterns.some(pattern => message.includes(pattern))) {
        return type as Event['event_type'];
      }
    }

    return undefined;
  }

  private parseDate(message: string): Date | undefined {
    // Try ISO format first (YYYY-MM-DD)
    const isoMatch = message.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
    }

    // Try DD-MM-YYYY format (European)
    const euroMatch = message.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (euroMatch) {
      const [, day, month, year] = euroMatch;
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
    }

    // Try MM/DD/YYYY format (US)
    const usMatch = message.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (usMatch) {
      const [, month, day, year] = usMatch;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
    }

    // Try DD/MM/YYYY format (European with slash)
    const euroSlashMatch = message.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (euroSlashMatch) {
      const [, day, month, year] = euroSlashMatch;
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`);
    }

    // Try relative dates
    if (message.match(/tomorrow/i)) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      return tomorrow;
    }

    if (message.match(/next week/i)) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(12, 0, 0, 0);
      return nextWeek;
    }

    return undefined;
  }

  private parseTime(message: string): string | undefined {
    // Match HH:MM format
    const timeMatch = message.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (timeMatch) {
      let [, hours, minutes, period] = timeMatch;
      let hour = parseInt(hours);
      
      if (period) {
        if (period.toLowerCase() === 'pm' && hour < 12) hour += 12;
        if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:${minutes}`;
    }

    // Match "3pm" or "3 pm" format
    const simpleTimeMatch = message.match(/(\d{1,2})\s*(am|pm)/i);
    if (simpleTimeMatch) {
      let [, hours, period] = simpleTimeMatch;
      let hour = parseInt(hours);
      
      if (period.toLowerCase() === 'pm' && hour < 12) hour += 12;
      if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:00`;
    }

    return undefined;
  }

  private extractNumber(message: string): number | undefined {
    const numberMatch = message.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (numberMatch) {
      return parseFloat(numberMatch[1].replace(/,/g, ''));
    }
    return undefined;
  }

  private getMissingFields(data: Partial<Event>): string[] {
    const required = ['title', 'event_type', 'date', 'location_text', 'guest_count'];
    return required.filter(field => !data[field as keyof Event]);
  }

  private generateFollowUpQuestion(missingField: string, currentData: Partial<Event>): string {
    const questions: Record<string, string> = {
      title: "What would you like to call this event?",
      event_type: "What type of event is this? (e.g., corporate meeting, sports viewing party, birthday, wedding, conference)",
      date: "When is the event? Please provide a date (e.g., 2026-07-15 or 07/15/2026).",
      time: "What time will the event start? (e.g., 6:00 PM or 18:00)",
      location_text: "Where will the event take place? Please provide the location or address.",
      guest_count: "How many guests are you expecting?",
      budget_total: "Do you have a budget in mind for this event? (Optional - you can skip this)",
    };

    return questions[missingField] || "Can you tell me more about your event?";
  }

  private inferCategories(eventType: string): KpiCategory['name'][] {
    const categoryMap: Record<string, KpiCategory['name'][]> = {
      sports_viewing: ['food_drinks', 'av_equipment', 'merch', 'decor'],
      corporate: ['venue', 'food_drinks', 'av_equipment', 'photography'],
      birthday: ['venue', 'food_drinks', 'decor', 'entertainment'],
      wedding: ['venue', 'food_drinks', 'decor', 'photography', 'entertainment'],
      conference: ['venue', 'food_drinks', 'av_equipment', 'photography'],
      other: ['venue', 'food_drinks'],
    };
    return categoryMap[eventType] || ['venue', 'food_drinks'];
  }
}

// Made with Bob
