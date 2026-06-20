/**
 * Anthea - Payment/Order Agent (Mock)
 * Phase 8: Visual-only Mollie-branded checkout for demo
 */

import { BaseAgent, AgentResult } from './base-agent';
import { Order, Vendor, Event } from '@/lib/db/schema';
import { db } from '@/lib/db/store';

export interface OrderInput {
  event: Event;
  vendors: Vendor[];
  paymentMethod?: 'ideal' | 'creditcard' | 'bancontact' | 'paypal';
}

export interface OrderOutput {
  orders: Order[];
  totalAmount: number;
  paymentUrl?: string;
  invoiceRef: string;
}

export class PaymentOrderAgent extends BaseAgent {
  constructor() {
    super({
      name: 'PaymentOrder',
      description: 'Mock payment processing with Mollie branding (visual only)',
      enabled: true,
    });
  }

  async execute(input: OrderInput): Promise<AgentResult<OrderOutput>> {
    const { event, vendors, paymentMethod = 'ideal' } = input;
    
    this.log(`Creating orders for ${vendors.length} vendors`);

    try {
      // Calculate total
      const totalAmount = vendors.reduce((sum, v) => sum + (v.price_estimate || 0), 0);
      
      // Generate invoice reference
      const invoiceRef = `INV-${event.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
      
      // Create orders for each vendor (mock - no real payment)
      const orders: Order[] = [];
      
      for (const vendor of vendors) {
        const order = db.orders.create({
          event_id: event.id,
          vendor_id: vendor.id,
          amount: vendor.price_estimate || 0,
          payment_status: 'mock_pending',
          invoice_ref: invoiceRef,
        });
        orders.push(order);
      }

      // Simulate Mollie payment URL (mock only)
      const mockPaymentUrl = `https://www.mollie.com/checkout/${invoiceRef}`;

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Auto-complete payment (mock)
      for (const order of orders) {
        db.orders.update(order.id, {
          payment_status: 'mock_paid'
        });
      }

      this.log(`Orders created: ${orders.length}, Total: €${totalAmount}`);

      return this.createSuccessResult({
        orders,
        totalAmount,
        paymentUrl: mockPaymentUrl,
        invoiceRef,
      }, true);
    } catch (error) {
      this.log(`Order processing failed: ${error}`, 'error');
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

// Made with Bob
