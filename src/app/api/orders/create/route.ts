/**
 * Anthea - Order Creation API
 * Triggers Payment/Order agent (mock Mollie checkout)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentOrderAgent } from '@/agents/payment-order-agent';
import { db } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const { eventId, paymentMethod } = await request.json();

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

    // Get all approved vendors for this event
    const categories = db.kpiCategories.findByEvent(eventId);
    const vendors = categories.flatMap(cat => 
      db.vendors.findByCategory(cat.id).filter(v => v.status === 'approved')
    );

    if (vendors.length === 0) {
      return NextResponse.json(
        { error: 'No approved vendors to create orders for' },
        { status: 400 }
      );
    }

    // Run payment/order agent
    const agent = new PaymentOrderAgent();
    const result = await agent.execute({ 
      event, 
      vendors,
      paymentMethod: paymentMethod || 'ideal'
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Order creation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: result.data?.orders,
      totalAmount: result.data?.totalAmount,
      paymentUrl: result.data?.paymentUrl,
      invoiceRef: result.data?.invoiceRef,
    });
  } catch (error) {
    console.error('Order creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
