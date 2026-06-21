/**
 * Anthea - RSVP Submission API
 * Handles guest responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const { eventId, name, contact, response, comments } = await request.json();

    if (!eventId || !name || !contact || !response) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = db.events.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get invite for this event
    const existingInvite = db.invites.findByEvent(eventId);
    const inviteId = existingInvite?.id || 'direct-rsvp';
    
    // Create guest RSVP
    const guest = db.guests.create({
      event_id: eventId,
      invite_id: inviteId,
      name,
      contact,
      response,
      comments,
      responded_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      guest,
    });
  } catch (error) {
    console.error('RSVP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
