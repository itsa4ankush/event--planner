/**
 * EventPilot AI - Event Data API Route
 * Phase 4: Fetch complete event data for dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    console.log('[API] Looking for event:', eventId);
    console.log('[API] All events:', db.events.findAll().map(e => ({ id: e.id, title: e.title })));

    const event = db.events.findById(eventId);
    if (!event) {
      console.log('[API] Event not found:', eventId);
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }
    console.log('[API] Event found:', event.title);

    // Get all related data
    const categories = db.kpiCategories.findByEvent(eventId);
    const allVendors = categories.flatMap(cat => db.vendors.findByCategory(cat.id));
    const guests = db.guests.findByEvent(eventId);
    const invite = db.invites.findByEvent(eventId);
    const weatherReport = db.weatherLegalReports.findByEvent(eventId);
    const orders = db.orders.findByEvent(eventId);

    return NextResponse.json({
      success: true,
      data: {
        event,
        categories,
        vendors: allVendors,
        guests,
        invite,
        weatherReport,
        orders,
      },
    });
  } catch (error) {
    console.error('Event data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
