/**
 * Anthea - Cost/Weather/Legal Intelligence Agent
 * Phase 5: Cala + Open-Meteo weather API integration
 */

import { BaseAgent, AgentResult } from './base-agent';
import { WeatherLegalReport, Event, Vendor } from '@/lib/db/schema';
import { db } from '@/lib/db/store';

export interface IntelligenceInput {
  event: Event;
  vendors: Vendor[];
}

export interface IntelligenceOutput {
  report: WeatherLegalReport;
  budgetEstimate: number;
  costBreakdown: {
    vendors: number;
    permits: number;
    insurance: number;
    contingency: number;
  };
}

interface WeatherData {
  temperature: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
}

interface CostEstimate {
  total: number;
  breakdown: {
    vendors: number;
    permits: number;
    insurance: number;
    contingency: number;
  };
}

export class CostWeatherLegalAgent extends BaseAgent {
  private calaApiKey: string;

  constructor() {
    super({
      name: 'CostWeatherLegal',
      description: 'Provides cost estimates, weather forecasts, and legal guidance',
      enabled: true,
    });
    this.calaApiKey = process.env.CALA_API_KEY || '';
  }

  async execute(input: IntelligenceInput): Promise<AgentResult<IntelligenceOutput>> {
    this.log(`Generating intelligence report for event: ${input.event.title}`);

    try {
      // Run all intelligence gathering in parallel
      const [weatherData, costEstimate, legalNotes] = await Promise.all([
        this.getWeatherForecast(input.event),
        this.estimateCosts(input.event, input.vendors),
        this.generateLegalGuidance(input.event),
      ]);

      // Create and store the report
      const report = db.weatherLegalReports.create({
        event_id: input.event.id,
        forecast_temp: weatherData.temperature,
        forecast_condition: weatherData.condition,
        forecast_precipitation: weatherData.precipitation,
        forecast_wind_speed: weatherData.windSpeed,
        legal_notes: legalNotes,
        cost_estimate: costEstimate.total,
      });

      this.log(`Report generated: ${weatherData.condition}, ${weatherData.temperature}°C, €${costEstimate.total}`);

      return this.createSuccessResult({
        report,
        budgetEstimate: costEstimate.total,
        costBreakdown: costEstimate.breakdown,
      }, true);
    } catch (error) {
      this.log(`Intelligence report failed: ${error}`, 'error');
      
      // Return fallback data on error
      const fallbackReport = db.weatherLegalReports.create({
        event_id: input.event.id,
        forecast_temp: 20,
        forecast_condition: 'Data unavailable - check closer to event date',
        legal_notes: this.getFallbackLegalNotes(input.event),
        cost_estimate: this.calculateFallbackCost(input.vendors),
      });

      return this.createSuccessResult({
        report: fallbackReport,
        budgetEstimate: fallbackReport.cost_estimate || 0,
        costBreakdown: {
          vendors: this.calculateFallbackCost(input.vendors),
          permits: 0,
          insurance: 0,
          contingency: 0,
        },
      }, false);
    }
  }

  private async getWeatherForecast(event: Event): Promise<WeatherData> {
    try {
      // Use Open-Meteo API (free, no key required)
      const lat = event.lat || 52.3676; // Default to Amsterdam
      const lng = event.lng || 4.9041;
      const eventDate = new Date(event.date);
      
      // Check if date is valid
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid event date');
      }
      
      const dateStr = eventDate.toISOString().split('T')[0];

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;

      this.log(`Fetching weather from Open-Meteo for ${dateStr}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.daily) {
        throw new Error('No weather data available');
      }

      const tempMax = data.daily.temperature_2m_max[0];
      const tempMin = data.daily.temperature_2m_min[0];
      const avgTemp = Math.round((tempMax + tempMin) / 2);
      const precipitation = data.daily.precipitation_sum[0] || 0;
      const windSpeed = data.daily.windspeed_10m_max[0] || 0;
      const weatherCode = data.daily.weathercode[0];

      return {
        temperature: avgTemp,
        condition: this.interpretWeatherCode(weatherCode),
        precipitation,
        windSpeed,
      };
    } catch (error) {
      this.log(`Weather API failed, using seasonal average: ${error}`, 'warn');
      return this.getSeasonalAverage(event.date);
    }
  }

  private interpretWeatherCode(code: number): string {
    // WMO Weather interpretation codes
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Rain showers';
    if (code <= 86) return 'Snow showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Variable conditions';
  }

  private getSeasonalAverage(date: Date): WeatherData {
    // Handle invalid dates by using current date
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const month = validDate.getMonth();
    
    // Simple seasonal averages for Amsterdam
    if (month >= 5 && month <= 8) {
      return { temperature: 20, condition: 'Partly cloudy', precipitation: 5, windSpeed: 15 };
    } else if (month >= 2 && month <= 4) {
      return { temperature: 12, condition: 'Cloudy', precipitation: 8, windSpeed: 18 };
    } else if (month >= 9 && month <= 11) {
      return { temperature: 10, condition: 'Rainy', precipitation: 12, windSpeed: 20 };
    } else {
      return { temperature: 5, condition: 'Cold and cloudy', precipitation: 10, windSpeed: 22 };
    }
  }

  private async estimateCosts(event: Event, vendors: Vendor[]): Promise<CostEstimate> {
    try {
      // Calculate vendor costs
      const vendorCosts = vendors
        .filter(v => v.status === 'approved')
        .reduce((sum, v) => sum + (v.price_estimate || 0), 0);

      // Estimate permits based on event type and size
      const permits = this.estimatePermitCosts(event);
      
      // Estimate insurance based on guest count
      const insurance = this.estimateInsuranceCosts(event);
      
      // Add 15% contingency
      const subtotal = vendorCosts + permits + insurance;
      const contingency = Math.round(subtotal * 0.15);
      const total = subtotal + contingency;

      // Try Cala API for more accurate cost estimation (if available)
      if (this.calaApiKey) {
        try {
          const calaEstimate = await this.getCalaEstimate(event, vendors);
          if (calaEstimate) {
            this.log('Using Cala API cost estimate');
            return calaEstimate;
          }
        } catch (error) {
          this.log(`Cala API failed, using manual calculation: ${error}`, 'warn');
        }
      }

      return {
        total,
        breakdown: {
          vendors: vendorCosts,
          permits,
          insurance,
          contingency,
        },
      };
    } catch (error) {
      this.log(`Cost estimation failed: ${error}`, 'error');
      throw error;
    }
  }

  private async getCalaEstimate(event: Event, vendors: Vendor[]): Promise<CostEstimate | null> {
    try {
      // Cala API integration for cost estimation
      const response = await fetch('https://api.cala.com/v1/estimates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.calaApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: event.event_type,
          guest_count: event.guest_count,
          location: event.location_text,
          vendors: vendors.map(v => ({
            category: v.category,
            price: v.price_estimate,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Cala API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        total: data.total_estimate,
        breakdown: {
          vendors: data.vendor_costs,
          permits: data.permit_costs,
          insurance: data.insurance_costs,
          contingency: data.contingency,
        },
      };
    } catch (error) {
      this.log(`Cala API call failed: ${error}`, 'warn');
      return null;
    }
  }

  private estimatePermitCosts(event: Event): number {
    let cost = 0;
    
    // Base permit for events over 50 people
    if (event.guest_count > 50) cost += 150;
    
    // Outdoor event permits
    if (event.location_text.toLowerCase().includes('outdoor') ||
        event.location_text.toLowerCase().includes('backyard') ||
        event.location_text.toLowerCase().includes('park')) {
      cost += 200;
    }
    
    // Alcohol permit
    if (event.event_type === 'wedding' || event.event_type === 'corporate') {
      cost += 100;
    }
    
    // Music/entertainment permit
    if (event.event_type === 'sports_viewing') {
      cost += 150;
    }
    
    return cost;
  }

  private estimateInsuranceCosts(event: Event): number {
    // Base rate: €2 per guest
    let cost = event.guest_count * 2;
    
    // Higher rates for certain event types
    if (event.event_type === 'sports_viewing') {
      cost *= 1.5;
    }
    
    return Math.round(cost);
  }

  private async generateLegalGuidance(event: Event): Promise<string[]> {
    const notes: string[] = [];
    
    // Noise ordinances
    if (event.time && parseInt(event.time.split(':')[0]) >= 22) {
      notes.push('⚠️ Event after 10 PM - check local noise ordinances and consider sound permits');
    }
    
    // Outdoor events
    if (event.location_text.toLowerCase().includes('outdoor') ||
        event.location_text.toLowerCase().includes('backyard')) {
      notes.push('🏞️ Outdoor event - verify property permits and weather contingency plans');
      notes.push('🔊 Consider noise impact on neighbors and local regulations');
    }
    
    // Large gatherings
    if (event.guest_count > 100) {
      notes.push('👥 Large gathering - may require special event permit and security personnel');
      notes.push('🚑 Consider emergency medical services and evacuation plans');
    }
    
    // Alcohol
    if (event.event_type === 'wedding' || event.event_type === 'corporate' || event.event_type === 'birthday') {
      notes.push('🍷 If serving alcohol, verify liquor license requirements');
    }
    
    // Food safety
    notes.push('🍽️ Ensure all food vendors have proper health certifications');
    
    // Insurance
    notes.push('📋 Event liability insurance recommended for gatherings over 25 people');
    
    // Accessibility
    if (event.guest_count > 50) {
      notes.push('♿ Ensure venue meets accessibility requirements (ADA compliance)');
    }
    
    return notes;
  }

  private getFallbackLegalNotes(event: Event): string[] {
    return [
      '⚠️ Check local event permits and regulations',
      '📋 Event liability insurance recommended',
      '🍽️ Verify vendor licenses and certifications',
      '🔊 Consider noise ordinances for your area',
    ];
  }

  private calculateFallbackCost(vendors: Vendor[]): number {
    return vendors
      .filter(v => v.status === 'approved')
      .reduce((sum, v) => sum + (v.price_estimate || 0), 0);
  }
}

// Made with Bob
