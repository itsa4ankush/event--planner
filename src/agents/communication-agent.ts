/**
 * Anthea - Communication Agent
 * Phase 7: Vapi voice AI for vendor outreach and live demo calls
 */

import { BaseAgent, AgentResult } from './base-agent';
import { VendorQuote, Event, Vendor } from '@/lib/db/schema';
import { db } from '@/lib/db/store';

export interface CallInput {
  vendor: Vendor;
  event: Event;
  mode?: 'outbound' | 'demo';
}

export interface CallOutput {
  quote: VendorQuote;
  callDuration: number;
  callId?: string;
  recordingUrl?: string;
}

interface VapiCallResponse {
  id: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  duration?: number;
  transcript?: string;
  recording_url?: string;
}

export class CommunicationAgent extends BaseAgent {
  private vapiApiKey: string;
  private vapiPhoneNumber: string;

  constructor() {
    super({
      name: 'Communication',
      description: 'AI-powered voice calls to vendors using Vapi',
      enabled: true,
    });
    this.vapiApiKey = process.env.VAPI_API_KEY || '';
    this.vapiPhoneNumber = process.env.VAPI_PHONE_NUMBER || '+1234567890';
  }

  async execute(input: CallInput): Promise<AgentResult<CallOutput>> {
    const { vendor, event, mode = 'demo' } = input;
    
    this.log(`Initiating ${mode} call to ${vendor.name} for ${event.title}`);

    try {
      // Generate call script based on event and vendor
      const callScript = this.generateCallScript(event, vendor);
      
      // For demo mode, simulate a call
      if (mode === 'demo' || !this.vapiApiKey) {
        return await this.simulateDemoCall(vendor, event, callScript);
      }

      // Real Vapi outbound call
      const callResult = await this.initiateVapiCall(vendor, event, callScript);
      
      // Create vendor quote from call result
      const quote = db.vendorQuotes.create({
        vendor_id: vendor.id,
        channel: 'voice_call',
        transcript_or_notes: callResult.transcript || callScript,
        quoted_price: this.extractPriceFromTranscript(callResult.transcript || ''),
        delivery_timeline: this.extractTimelineFromTranscript(callResult.transcript || ''),
        outcome: callResult.status === 'completed' ? 'accepted' : 'pending',
      });

      this.log(`Call completed: ${callResult.duration}s, Quote ID: ${quote.id}`);

      return this.createSuccessResult({
        quote,
        callDuration: callResult.duration || 0,
        callId: callResult.id,
        recordingUrl: callResult.recording_url,
      }, true);
    } catch (error) {
      this.log(`Call failed: ${error}`, 'error');
      
      // Create fallback quote
      const fallbackQuote = db.vendorQuotes.create({
        vendor_id: vendor.id,
        channel: 'simulated_email',
        transcript_or_notes: `Automated quote request sent to ${vendor.name}. Awaiting response.`,
        outcome: 'pending',
      });

      return this.createSuccessResult({
        quote: fallbackQuote,
        callDuration: 0,
      }, false);
    }
  }

  private generateCallScript(event: Event, vendor: Vendor): string {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return `Hello, this is Anthea AI calling on behalf of ${event.title} organizer.

We're planning a ${event.event_type.replace('_', ' ')} event on ${eventDate} at ${event.location_text} for approximately ${event.guest_count} guests.

We found your business, ${vendor.name}, and are interested in your services. Could you provide:
1. Your availability for ${eventDate}
2. A quote for ${event.guest_count} guests
3. What's included in your standard package
4. Your payment terms and deposit requirements

We're looking to finalize vendors within the next few days. Would you be able to help with this event?`;
  }

  private async simulateDemoCall(
    vendor: Vendor,
    event: Event,
    script: string
  ): Promise<AgentResult<CallOutput>> {
    this.log('Running demo call simulation');

    // Simulate call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic vendor response
    const response = this.generateVendorResponse(vendor, event);
    const transcript = `${script}\n\n[Vendor Response]\n${response}`;

    // Create quote with simulated data
    const quote = db.vendorQuotes.create({
      vendor_id: vendor.id,
      channel: 'voice_call',
      transcript_or_notes: transcript,
      quoted_price: vendor.price_estimate,
      delivery_timeline: `Available for ${new Date(event.date).toLocaleDateString()}`,
      outcome: 'accepted',
    });

    return this.createSuccessResult({
      quote,
      callDuration: 45, // Simulated 45 second call
      callId: `demo-${Date.now()}`,
    }, true);
  }

  private generateVendorResponse(vendor: Vendor, event: Event): string {
    const responses = [
      `Thank you for reaching out! Yes, we're available on ${new Date(event.date).toLocaleDateString()}. For ${event.guest_count} guests, our standard package is $${vendor.price_estimate} which includes setup, service, and cleanup. We require a 30% deposit to secure the date. I can send over our full proposal today.`,
      
      `Hi! We'd love to work with you on this event. We have availability and can accommodate ${event.guest_count} guests. Our quote would be around $${vendor.price_estimate}, and that covers everything you need. We typically need a 50% deposit upfront. When would you like to finalize the details?`,
      
      `Great timing! We just had a cancellation for that date. For your ${event.event_type.replace('_', ' ')} with ${event.guest_count} guests, we can offer our premium package at $${vendor.price_estimate}. This includes all equipment, staff, and our signature service. We'll need a deposit within 48 hours to hold the date.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async initiateVapiCall(
    vendor: Vendor,
    event: Event,
    script: string
  ): Promise<VapiCallResponse> {
    try {
      this.log('Initiating Vapi outbound call');

      const response = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vapiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: this.vapiPhoneNumber,
          customer: {
            number: vendor.contact_phone || '+1234567890',
            name: vendor.name,
          },
          assistant: {
            firstMessage: script,
            model: {
              provider: 'openai',
              model: 'gpt-4',
              temperature: 0.7,
            },
            voice: {
              provider: 'elevenlabs',
              voiceId: 'professional-female',
            },
          },
          maxDurationSeconds: 300, // 5 minute max
        }),
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.status}`);
      }

      const data: VapiCallResponse = await response.json();
      
      // Poll for call completion (simplified for MVP)
      if (data.status === 'queued' || data.status === 'ringing') {
        this.log('Call queued, would poll for completion in production');
      }

      return data;
    } catch (error) {
      this.log(`Vapi call failed: ${error}`, 'error');
      throw error;
    }
  }

  private extractPriceFromTranscript(transcript: string): number | undefined {
    // Extract price from transcript using regex
    const priceMatch = transcript.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/,/g, ''));
    }
    return undefined;
  }

  private extractTimelineFromTranscript(transcript: string): string | undefined {
    // Extract timeline mentions
    if (transcript.match(/available|can do|works for us/i)) {
      return 'Available as discussed';
    }
    if (transcript.match(/not available|booked|unavailable/i)) {
      return 'Not available';
    }
    return undefined;
  }
}

// Made with Bob
