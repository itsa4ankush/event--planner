/**
 * Anthea - Vendor Call API
 * Triggers Communication agent for vendor outreach
 */

import { NextRequest, NextResponse } from 'next/server';
import { CommunicationAgent } from '@/agents/communication-agent';
import { db } from '@/lib/db/store';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const { eventId, mode } = await request.json();

    if (!vendorId || !eventId) {
      return NextResponse.json(
        { error: 'Vendor ID and Event ID are required' },
        { status: 400 }
      );
    }

    // Get vendor and event
    const vendor = db.vendors.findById(vendorId);
    const event = db.events.findById(eventId);

    if (!vendor || !event) {
      return NextResponse.json(
        { error: 'Vendor or Event not found' },
        { status: 404 }
      );
    }

    // Run communication agent
    const agent = new CommunicationAgent();
    const result = await agent.execute({ 
      vendor, 
      event,
      mode: mode || 'demo'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Call failed' },
        { status: 500 }
      );
    }

    // Update vendor status to contacted
    db.vendors.update(vendorId, { status: 'contacted' });

    return NextResponse.json({
      success: true,
      quote: result.data?.quote,
      callDuration: result.data?.callDuration,
      callId: result.data?.callId,
      recordingUrl: result.data?.recordingUrl,
    });
  } catch (error) {
    console.error('Vendor call API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
