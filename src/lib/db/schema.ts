/**
 * EventPilot AI - Database Schema
 * Phase 2: Core data models for the multi-agent system
 */

export interface Organizer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  created_at: Date;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  event_type: 'corporate' | 'sports_viewing' | 'birthday' | 'wedding' | 'conference' | 'other';
  date: Date;
  time: string;
  location_text: string;
  lat?: number;
  lng?: number;
  guest_count: number;
  budget_total?: number;
  status: 'draft' | 'planning' | 'confirmed' | 'completed';
  created_at: Date;
}

export interface EventBriefAnswer {
  id: string;
  event_id: string;
  question_key: string;
  answer_value: string | Record<string, any>;
  input_mode: 'voice' | 'text';
  created_at: Date;
}

export interface KpiCategory {
  id: string;
  event_id: string;
  name: 'venue' | 'food_drinks' | 'decor' | 'photography' | 'merch' | 'entertainment' | 'av_equipment';
  status: 'not_started' | 'searching' | 'shortlisted' | 'approved' | 'ordered';
  created_at: Date;
}

export interface Vendor {
  id: string;
  kpi_category_id: string;
  category?: string; // Added for easier access to category name
  name: string;
  contact_email?: string;
  contact_phone?: string;
  source: 'google' | 'yelp' | 'amazon' | 'manual';
  rating: number;
  review_count: number;
  price_estimate?: number;
  available_date?: Date;
  profile_url?: string;
  status: 'shortlisted' | 'contacted' | 'quoted' | 'approved' | 'rejected';
  created_at: Date;
}

export interface VendorQuote {
  id: string;
  vendor_id: string;
  channel: 'voice_call' | 'simulated_email' | 'manual';
  transcript_or_notes: string;
  quoted_price?: number;
  delivery_timeline?: string;
  outcome: 'pending' | 'accepted' | 'declined' | 'negotiating';
  created_at: Date;
}

export interface Invite {
  id: string;
  event_id: string;
  image_url?: string;
  video_url?: string;
  qr_code_url?: string;
  share_url: string;
  message_text: string;
  created_at: Date;
}

export interface Guest {
  id: string;
  event_id: string;
  invite_id: string;
  name: string;
  contact: string;
  response: 'yes' | 'no' | 'maybe';
  comments?: string;
  responded_at?: Date;
  created_at: Date;
}

export interface WeatherLegalReport {
  id: string;
  event_id: string;
  forecast_temp?: number;
  forecast_condition?: string;
  forecast_precipitation?: number;
  forecast_wind_speed?: number;
  alt_date_suggestions?: string[];
  legal_notes?: string[];
  dress_code_recommendation?: string;
  cost_estimate?: number;
  generated_at: Date;
}

export interface Order {
  id: string;
  event_id: string;
  vendor_id: string;
  amount: number;
  payment_status: 'mock_pending' | 'mock_paid' | 'mock_failed';
  invoice_ref?: string;
  created_at: Date;
}

// Type guards
export function isValidEventType(type: string): type is Event['event_type'] {
  return ['corporate', 'sports_viewing', 'birthday', 'wedding', 'conference', 'other'].includes(type);
}

export function isValidKpiCategory(name: string): name is KpiCategory['name'] {
  return ['venue', 'food_drinks', 'decor', 'photography', 'merch', 'entertainment', 'av_equipment'].includes(name);
}

// Made with Bob
