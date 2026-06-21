/**
 * EventPilot AI - Live Demo Call API
 * Phase 7: Triggers a real Vapi outbound call to an organizer-entered phone number
 * using a scripted vendor-enquiry conversation to demo the voice capability.
 * Falls back to a simulated transcript if VAPI_API_KEY is not configured.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

function buildDemoScript(eventTitle: string, guestCount: number, eventDate: string, location: string): string {
  return `Hi! I'm calling on behalf of the organiser of "${eventTitle}," a ${guestCount}-person event on ${eventDate} in ${location}. I'm reaching out to ask about pricing and availability for catering services. Could you let me know: (1) whether you're available on that date, (2) a rough quote per head for a buffet-style setup, and (3) how much lead time you need to confirm a booking? Thanks so much!`;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, eventId } = await request.json();

    if (!phoneNumber || !eventId) {
      return NextResponse.json({ error: 'phoneNumber and eventId are required' }, { status: 400 });
    }

    // Basic phone number validation
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d{7,15}$/.test(cleaned)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    const event = db.events.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    const script = buildDemoScript(event.title, event.guest_count, eventDate, event.location_text);

    const vapiApiKey = process.env.VAPI_API_KEY;
    const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

    if (vapiApiKey && vapiPhoneNumberId) {
      // Real Vapi outbound call
      try {
        const vapiResponse = await fetch('https://api.vapi.ai/call', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vapiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumberId: vapiPhoneNumberId,
            customer: { number: cleaned },
            assistant: {
              firstMessage: script,
              model: {
                provider: 'anthropic',
                model: 'claude-sonnet-4-6',
                temperature: 0.7,
                messages: [
                  {
                    role: 'system',
                    content: `You are an AI event planning assistant calling on behalf of an event organiser. You are enquiring about vendor services in a friendly, professional manner. Keep the conversation brief (under 3 minutes). After getting pricing and availability info, thank the person and end the call.`,
                  },
                ],
              },
              voice: { provider: 'openai', voiceId: 'nova' },
              maxDurationSeconds: 180,
            },
          }),
        });

        if (!vapiResponse.ok) {
          const err = await vapiResponse.text();
          console.error('[DemoCall] Vapi API error:', err);
          // Fall through to simulation
        } else {
          const vapiData = await vapiResponse.json();
          return NextResponse.json({
            success: true,
            callId: vapiData.id,
            transcript: `[Live call initiated to ${phoneNumber}]\n\nScript used:\n${script}\n\nCall ID: ${vapiData.id}\nStatus: ${vapiData.status || 'queued'}\n\nThe call should arrive within 10–20 seconds. Transcript will be available via webhook after the call ends.`,
            duration: 0,
            live: true,
          });
        }
      } catch (vapiError) {
        console.warn('[DemoCall] Vapi call failed, falling back to simulation:', vapiError);
      }
    }

    // Simulated demo call fallback
    await new Promise(resolve => setTimeout(resolve, 2000));

    const simulatedTranscript = `[SIMULATED DEMO CALL — no real call was placed]

Script sent to ${phoneNumber}:
"${script}"

--- Simulated Vendor Response ---
"Thanks for calling! Yes, we're available on ${eventDate}. For ${event.guest_count} guests we'd quote approximately $${Math.round(event.guest_count * 35)} for a buffet setup including setup and cleanup. We typically need 2 weeks lead time to confirm. I can send a full proposal today — what email should I send it to?"

[Call duration: 48 seconds · Outcome: Quote obtained]`;

    return NextResponse.json({
      success: true,
      callId: `demo-${Date.now()}`,
      transcript: simulatedTranscript,
      duration: 48,
      live: false,
    });
  } catch (error) {
    console.error('[DemoCall] API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
