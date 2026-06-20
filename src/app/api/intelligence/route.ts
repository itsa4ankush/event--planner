/**
 * Anthea - Intelligence Report API
 * Triggers Cost/Weather/Legal agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { CostWeatherLegalAgent } from '@/agents/cost-weather-legal-agent';
import { db } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();

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

    // Get approved vendors for this event
    const categories = db.kpiCategories.findByEvent(eventId);
    const vendors = categories.flatMap(cat => 
      db.vendors.findByCategory(cat.id).filter(v => v.status === 'approved')
    );

    // Run intelligence agent
    const agent = new CostWeatherLegalAgent();
    const result = await agent.execute({ event, vendors });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Intelligence report generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report: result.data?.report,
      budgetEstimate: result.data?.budgetEstimate,
      costBreakdown: result.data?.costBreakdown,
    });
  } catch (error) {
    console.error('Intelligence API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
