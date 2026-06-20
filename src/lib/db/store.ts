/**
 * EventPilot AI - In-Memory Data Store
 * Phase 2: Simple in-memory database for MVP (can be replaced with real DB later)
 */

import {
  Organizer,
  Event,
  EventBriefAnswer,
  KpiCategory,
  Vendor,
  VendorQuote,
  Invite,
  Guest,
  WeatherLegalReport,
  Order
} from './schema';

// Singleton in-memory storage - shared across all imports
let storeInstance: {
  organizers: Map<string, Organizer>;
  events: Map<string, Event>;
  eventBriefAnswers: Map<string, EventBriefAnswer>;
  kpiCategories: Map<string, KpiCategory>;
  vendors: Map<string, Vendor>;
  vendorQuotes: Map<string, VendorQuote>;
  invites: Map<string, Invite>;
  guests: Map<string, Guest>;
  weatherLegalReports: Map<string, WeatherLegalReport>;
  orders: Map<string, Order>;
} | null = null;

function getStore() {
  if (!storeInstance) {
    storeInstance = {
      organizers: new Map<string, Organizer>(),
      events: new Map<string, Event>(),
      eventBriefAnswers: new Map<string, EventBriefAnswer>(),
      kpiCategories: new Map<string, KpiCategory>(),
      vendors: new Map<string, Vendor>(),
      vendorQuotes: new Map<string, VendorQuote>(),
      invites: new Map<string, Invite>(),
      guests: new Map<string, Guest>(),
      weatherLegalReports: new Map<string, WeatherLegalReport>(),
      orders: new Map<string, Order>(),
    };
  }
  return storeInstance;
}

const store = getStore();

// Helper to generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// CRUD operations for each entity
export const db = {
  // Organizers
  organizers: {
    create: (data: Omit<Organizer, 'id' | 'created_at'>): Organizer => {
      const organizer: Organizer = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.organizers.set(organizer.id, organizer);
      return organizer;
    },
    findById: (id: string): Organizer | undefined => store.organizers.get(id),
    findAll: (): Organizer[] => Array.from(store.organizers.values()),
  },

  // Events
  events: {
    create: (data: Omit<Event, 'id' | 'created_at'>): Event => {
      const event: Event = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.events.set(event.id, event);
      return event;
    },
    findById: (id: string): Event | undefined => store.events.get(id),
    findAll: (): Event[] => Array.from(store.events.values()),
    findByOrganizer: (organizerId: string): Event[] =>
      Array.from(store.events.values()).filter(e => e.organizer_id === organizerId),
    update: (id: string, data: Partial<Event>): Event | undefined => {
      const event = store.events.get(id);
      if (!event) return undefined;
      const updated = { ...event, ...data };
      store.events.set(id, updated);
      return updated;
    },
  },

  // Event Brief Answers
  eventBriefAnswers: {
    create: (data: Omit<EventBriefAnswer, 'id' | 'created_at'>): EventBriefAnswer => {
      const answer: EventBriefAnswer = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.eventBriefAnswers.set(answer.id, answer);
      return answer;
    },
    findByEvent: (eventId: string): EventBriefAnswer[] =>
      Array.from(store.eventBriefAnswers.values()).filter(a => a.event_id === eventId),
  },

  // KPI Categories
  kpiCategories: {
    create: (data: Omit<KpiCategory, 'id' | 'created_at'>): KpiCategory => {
      const category: KpiCategory = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.kpiCategories.set(category.id, category);
      return category;
    },
    findById: (id: string): KpiCategory | undefined => store.kpiCategories.get(id),
    findByEvent: (eventId: string): KpiCategory[] =>
      Array.from(store.kpiCategories.values()).filter(c => c.event_id === eventId),
    update: (id: string, data: Partial<KpiCategory>): KpiCategory | undefined => {
      const category = store.kpiCategories.get(id);
      if (!category) return undefined;
      const updated = { ...category, ...data };
      store.kpiCategories.set(id, updated);
      return updated;
    },
  },

  // Vendors
  vendors: {
    create: (data: Omit<Vendor, 'id' | 'created_at'>): Vendor => {
      const vendor: Vendor = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.vendors.set(vendor.id, vendor);
      return vendor;
    },
    findById: (id: string): Vendor | undefined => store.vendors.get(id),
    findByCategory: (categoryId: string): Vendor[] =>
      Array.from(store.vendors.values()).filter(v => v.kpi_category_id === categoryId),
    update: (id: string, data: Partial<Vendor>): Vendor | undefined => {
      const vendor = store.vendors.get(id);
      if (!vendor) return undefined;
      const updated = { ...vendor, ...data };
      store.vendors.set(id, updated);
      return updated;
    },
  },

  // Vendor Quotes
  vendorQuotes: {
    create: (data: Omit<VendorQuote, 'id' | 'created_at'>): VendorQuote => {
      const quote: VendorQuote = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.vendorQuotes.set(quote.id, quote);
      return quote;
    },
    findByVendor: (vendorId: string): VendorQuote[] =>
      Array.from(store.vendorQuotes.values()).filter(q => q.vendor_id === vendorId),
  },

  // Invites
  invites: {
    create: (data: Omit<Invite, 'id' | 'created_at'>): Invite => {
      const invite: Invite = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.invites.set(invite.id, invite);
      return invite;
    },
    findById: (id: string): Invite | undefined => store.invites.get(id),
    findByEvent: (eventId: string): Invite | undefined =>
      Array.from(store.invites.values()).find(i => i.event_id === eventId),
  },

  // Guests
  guests: {
    create: (data: Omit<Guest, 'id' | 'created_at'>): Guest => {
      const guest: Guest = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.guests.set(guest.id, guest);
      return guest;
    },
    findByEvent: (eventId: string): Guest[] =>
      Array.from(store.guests.values()).filter(g => g.event_id === eventId),
    findByInvite: (inviteId: string): Guest[] =>
      Array.from(store.guests.values()).filter(g => g.invite_id === inviteId),
  },

  // Weather Legal Reports
  weatherLegalReports: {
    create: (data: Omit<WeatherLegalReport, 'id' | 'generated_at'>): WeatherLegalReport => {
      const report: WeatherLegalReport = {
        ...data,
        id: generateId(),
        generated_at: new Date(),
      };
      store.weatherLegalReports.set(report.id, report);
      return report;
    },
    findByEvent: (eventId: string): WeatherLegalReport | undefined =>
      Array.from(store.weatherLegalReports.values()).find(r => r.event_id === eventId),
  },

  // Orders
  orders: {
    create: (data: Omit<Order, 'id' | 'created_at'>): Order => {
      const order: Order = {
        ...data,
        id: generateId(),
        created_at: new Date(),
      };
      store.orders.set(order.id, order);
      return order;
    },
    findByEvent: (eventId: string): Order[] =>
      Array.from(store.orders.values()).filter(o => o.event_id === eventId),
    update: (id: string, data: Partial<Order>): Order | undefined => {
      const order = store.orders.get(id);
      if (!order) return undefined;
      const updated = { ...order, ...data };
      store.orders.set(id, updated);
      return updated;
    },
  },

  // Utility: Clear all data (for testing)
  clearAll: () => {
    store.organizers.clear();
    store.events.clear();
    store.eventBriefAnswers.clear();
    store.kpiCategories.clear();
    store.vendors.clear();
    store.vendorQuotes.clear();
    store.invites.clear();
    store.guests.clear();
    store.weatherLegalReports.clear();
    store.orders.clear();
  },
};

// Made with Bob
