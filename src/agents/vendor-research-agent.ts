/**
 * EventPilot AI - Vendor Research Agent
 * Phase 4: Web search + ranking for vendor shortlisting
 */

import { BaseAgent, AgentResult } from './base-agent';
import { Vendor, KpiCategory } from '@/lib/db/schema';
import { db } from '@/lib/db/store';
import { getMockVendorsForCategory } from '@/lib/mock-data/vendors';

export interface VendorSearchInput {
  categoryId: string;
  categoryName: KpiCategory['name'];
  location: string;
  eventDate: Date;
}

export interface VendorSearchOutput {
  vendors: Vendor[];
  searchQuery: string;
  usedFallback: boolean;
}

interface ScoredVendor {
  vendor: Omit<Vendor, 'id' | 'kpi_category_id' | 'created_at'>;
  score: number;
}

export class VendorResearchAgent extends BaseAgent {
  constructor() {
    super({
      name: 'VendorResearch',
      description: 'Searches and ranks vendors by reviews',
      enabled: true,
    });
  }

  async execute(input: VendorSearchInput): Promise<AgentResult<VendorSearchOutput>> {
    this.log(`Searching vendors for ${input.categoryName} near ${input.location}`);

    try {
      const searchQuery = this.buildSearchQuery(input.categoryName, input.location);
      let vendorData: Omit<Vendor, 'id' | 'kpi_category_id' | 'created_at'>[] = [];
      let usedFallback = false;

      // Try web search first (placeholder for now)
      try {
        vendorData = await this.searchVendors(searchQuery, input.categoryName);
        if (vendorData.length === 0) {
          throw new Error('No results from search');
        }
      } catch (searchError) {
        this.log(`Web search failed, using fallback data: ${searchError}`, 'warn');
        vendorData = getMockVendorsForCategory(input.categoryName);
        usedFallback = true;
      }

      // Rank vendors by composite score
      const rankedVendors = this.rankVendors(vendorData, input.eventDate);

      // Create vendor records in database
      const vendors = rankedVendors.map(({ vendor }) =>
        db.vendors.create({
          kpi_category_id: input.categoryId,
          name: vendor.name,
          contact_email: vendor.contact_email,
          contact_phone: vendor.contact_phone,
          source: vendor.source,
          rating: vendor.rating,
          review_count: vendor.review_count,
          price_estimate: vendor.price_estimate,
          available_date: vendor.available_date,
          profile_url: vendor.profile_url,
          status: 'shortlisted',
        })
      );

      this.log(`Found and ranked ${vendors.length} vendors for ${input.categoryName}`);

      return this.createSuccessResult({
        vendors,
        searchQuery,
        usedFallback,
      }, usedFallback);
    } catch (error) {
      this.log(`Vendor search failed: ${error}`, 'error');
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private buildSearchQuery(categoryName: KpiCategory['name'], location: string): string {
    const categoryQueries: Record<KpiCategory['name'], string> = {
      food_drinks: 'catering food beverage service',
      av_equipment: 'audio visual equipment rental projector screen',
      merch: 'custom merchandise promotional items',
      decor: 'event decoration party styling',
      venue: 'event venue space rental',
      photography: 'event photographer videographer',
      entertainment: 'entertainment DJ band performer',
    };

    const categoryQuery = categoryQueries[categoryName] || categoryName.replace('_', ' ');
    return `${categoryQuery} near ${location}`;
  }

  private async searchVendors(
    query: string,
    categoryName: KpiCategory['name']
  ): Promise<Omit<Vendor, 'id' | 'kpi_category_id' | 'created_at'>[]> {
    // TODO: Implement real web search (Google Custom Search API, SerpAPI, etc.)
    // For MVP, we'll use fallback data
    this.log('Web search not implemented yet, using fallback', 'warn');
    throw new Error('Web search not implemented');
  }

  private rankVendors(
    vendors: Omit<Vendor, 'id' | 'kpi_category_id' | 'created_at'>[],
    eventDate: Date
  ): ScoredVendor[] {
    const scored = vendors.map(vendor => ({
      vendor,
      score: this.calculateVendorScore(vendor, eventDate),
    }));

    // Sort by score descending (highest first)
    scored.sort((a, b) => b.score - a.score);

    // Return top 5 vendors
    return scored.slice(0, 5);
  }

  private calculateVendorScore(
    vendor: Omit<Vendor, 'id' | 'kpi_category_id' | 'created_at'>,
    eventDate: Date
  ): number {
    // Composite scoring algorithm (as per PRD: rating-driven sort)
    let score = 0;

    // Rating weight: 50% (most important)
    // Normalize rating to 0-50 scale
    score += (vendor.rating / 5.0) * 50;

    // Review count weight: 30%
    // Logarithmic scale to prevent huge review counts from dominating
    // Cap at 1000 reviews for normalization
    const normalizedReviewCount = Math.min(vendor.review_count, 1000) / 1000;
    score += normalizedReviewCount * 30;

    // Availability weight: 10%
    if (vendor.available_date) {
      const daysUntilEvent = Math.floor(
        (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysUntilAvailable = Math.floor(
        (vendor.available_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilAvailable <= daysUntilEvent) {
        score += 10; // Available in time
      } else {
        score += 5; // Might be available
      }
    } else {
      score += 7; // Unknown availability (neutral)
    }

    // Price competitiveness weight: 10%
    // Lower price = higher score (within reason)
    if (vendor.price_estimate) {
      // Normalize: assume $500-$5000 range
      const normalizedPrice = Math.max(0, Math.min(1, 1 - (vendor.price_estimate - 500) / 4500));
      score += normalizedPrice * 10;
    } else {
      score += 5; // Unknown price (neutral)
    }

    return score;
  }

  // Helper method to manually trigger vendor search for a category
  async searchForCategory(
    categoryId: string,
    categoryName: KpiCategory['name'],
    location: string,
    eventDate: Date
  ): Promise<Vendor[]> {
    const result = await this.execute({
      categoryId,
      categoryName,
      location,
      eventDate,
    });

    if (result.success && result.data) {
      return result.data.vendors;
    }

    return [];
  }
}

// Made with Bob
