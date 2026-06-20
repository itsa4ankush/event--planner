/**
 * Anthea - Invite Generation API
 * Triggers Invite/RSVP agent with PixVerse
 */

import { NextRequest, NextResponse } from 'next/server';
import { InviteRsvpAgent } from '@/agents/invite-rsvp-agent';
import { db } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const { eventId, messageText, style } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Get event
    const event = db.events.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Run invite generation agent
    const agent = new InviteRsvpAgent();
    const result = await agent.execute({ 
      event, 
      messageText,
      style: style || 'modern'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invite generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invite: result.data?.invite,
      assets: result.data?.generatedAssets,
    });
  } catch (error) {
    console.error('Invite generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
