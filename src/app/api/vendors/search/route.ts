/**
 * EventPilot AI - Vendor Search API Route
 * Phase 4: Triggers vendor research for event categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { VendorResearchAgent } from '@/agents/vendor-research-agent';
import { db } from '@/lib/db/store';

const vendorAgent = new VendorResearchAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID required' },
        { status: 400 }
      );
    }

    // Get event details
    const event = db.events.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get all categories for this event
    const categories = db.kpiCategories.findByEvent(eventId);
    if (categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No categories found for event' },
        { status: 404 }
      );
    }

    // Search vendors for each category
    const results = await Promise.all(
      categories.map(async (category) => {
        const result = await vendorAgent.execute({
          categoryId: category.id,
          categoryName: category.name,
          location: event.location_text,
          eventDate: event.date,
        });

        // Update category status
        if (result.success) {
          db.kpiCategories.update(category.id, { status: 'shortlisted' });
        }

        return {
          categoryId: category.id,
          categoryName: category.name,
          success: result.success,
          vendorCount: result.data?.vendors.length || 0,
          usedFallback: result.fallbackUsed,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        results,
        totalVendors: results.reduce((sum, r) => sum + r.vendorCount, 0),
      },
    });
  } catch (error) {
    console.error('Vendor search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
