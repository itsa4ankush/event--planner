/**
 * Anthea - Invite & RSVP Agent
 * Phase 6: PixVerse AI generation + QR codes + shareable invites
 */

import { BaseAgent, AgentResult } from './base-agent';
import { Invite, Event } from '@/lib/db/schema';
import { db } from '@/lib/db/store';

export interface InviteGenerationInput {
  event: Event;
  messageText?: string;
  style?: 'elegant' | 'modern' | 'playful' | 'professional';
}

export interface InviteGenerationOutput {
  invite: Invite;
  generatedAssets: {
    imageUrl?: string;
    videoUrl?: string;
    qrCodeUrl: string;
  };
}

interface PixVerseResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_url?: string;
  video_url?: string;
}

export class InviteRsvpAgent extends BaseAgent {
  private pixverseApiKey: string;
  private appUrl: string;

  constructor(baseUrl?: string) {
    super({
      name: 'InviteRSVP',
      description: 'Generates AI-powered invites with PixVerse and manages RSVPs',
      enabled: true,
    });
    this.pixverseApiKey = process.env.PIXVERSE_API_KEY || '';
    this.appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  async execute(input: InviteGenerationInput): Promise<AgentResult<InviteGenerationOutput>> {
    this.log(`Generating invite for event: ${input.event.title}`);

    try {
      // Generate invite prompt based on event details
      const prompt = this.generateInvitePrompt(input.event, input.style || 'modern');
      
      // Try PixVerse generation (with fallback)
      const assets = await this.generateInviteAssets(prompt, input.event);
      
      // Generate QR code for RSVP
      const qrCodeUrl = await this.generateQRCode(input.event.id);
      
      // Create default message if not provided
      const messageText = input.messageText || this.generateDefaultMessage(input.event);
      
      // Create and store the invite
      const invite = db.invites.create({
        event_id: input.event.id,
        image_url: assets.imageUrl,
        video_url: assets.videoUrl,
        qr_code_url: qrCodeUrl,
        share_url: `${this.appUrl}/rsvp/${input.event.id}`,
        message_text: messageText,
      });

      this.log(`Invite created: ${invite.id}`);

      return this.createSuccessResult({
        invite,
        generatedAssets: {
          imageUrl: assets.imageUrl,
          videoUrl: assets.videoUrl,
          qrCodeUrl,
        },
      }, true);
    } catch (error) {
      this.log(`Invite generation failed: ${error}`, 'error');
      
      // Create fallback invite
      const fallbackInvite = db.invites.create({
        event_id: input.event.id,
        share_url: `${this.appUrl}/rsvp/${input.event.id}`,
        message_text: input.messageText || this.generateDefaultMessage(input.event),
        qr_code_url: await this.generateQRCode(input.event.id),
      });

      return this.createSuccessResult({
        invite: fallbackInvite,
        generatedAssets: {
          qrCodeUrl: fallbackInvite.qr_code_url || '',
        },
      }, false);
    }
  }

  private generateInvitePrompt(event: Event, style: string): string {
    const styleDescriptions = {
      elegant: 'elegant, sophisticated, gold accents, formal typography',
      modern: 'modern, minimalist, clean lines, contemporary design',
      playful: 'playful, colorful, fun illustrations, casual vibe',
      professional: 'professional, corporate, sleek design, business aesthetic',
    };

    const eventTypeThemes = {
      wedding: 'romantic, flowers, celebration',
      birthday: 'festive, balloons, cake, celebration',
      corporate: 'professional, business, networking',
      conference: 'educational, technology, innovation',
      sports_viewing: 'energetic, sports themed, team colors, stadium atmosphere',
      other: 'celebratory, welcoming',
    };

    const styleDesc = styleDescriptions[style as keyof typeof styleDescriptions] || styleDescriptions.modern;
    const themeDesc = eventTypeThemes[event.event_type as keyof typeof eventTypeThemes] || eventTypeThemes.other;
    
    const dateStr = new Date(event.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Create detailed prompt with all event information
    return `Event invitation design: "${event.title}" - ${themeDesc}, ${styleDesc}. Date: ${dateStr} at ${event.time}. Venue: ${event.location_text}. ${event.guest_count} guests expected. Cinematic, high quality, professional event invitation, 4K, detailed, vibrant colors`;
  }

  private async generateInviteAssets(prompt: string, event: Event): Promise<{ imageUrl?: string; videoUrl?: string }> {
    if (!this.pixverseApiKey) {
      this.log('PixVerse API key not configured, using fallback', 'warn');
      return this.generateFallbackAssets(event);
    }

    try {
      this.log(`Calling PixVerse API for image generation with prompt: ${prompt.substring(0, 100)}...`);
      
      // Generate unique trace ID for this request
      const traceId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // PixVerse API call for image generation (text-to-image)
      // Note: Using video endpoint but will extract first frame/thumbnail as image
      const imageResponse = await fetch('https://app-api.pixverse.ai/openapi/v2/video/text/generate', {
        method: 'POST',
        headers: {
          'API-KEY': this.pixverseApiKey,
          'Ai-trace-id': traceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt}. Static image, single frame, poster design`,
          model: 'v6',
          duration: 1, // Minimal duration for image extraction
          quality: '720p',
          aspect_ratio: '16:9',
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        this.log(`PixVerse API error ${imageResponse.status}: ${errorText}`, 'warn');
        throw new Error(`PixVerse API error ${imageResponse.status}: ${errorText}`);
      }

      const imageData = await imageResponse.json();
      this.log(`PixVerse response: ${JSON.stringify(imageData)}`);
      
      // Check for error in response
      if (imageData.ErrCode && imageData.ErrCode !== 0) {
        throw new Error(`PixVerse error: ${imageData.ErrMsg}`);
      }
      
      // PixVerse returns a video_id that we need to poll
      let imageUrl: string | undefined;
      
      if (imageData.data && imageData.data.video_id) {
        const videoId = imageData.data.video_id;
        this.log(`Image generation task created: ${videoId}`);
        
        // Poll for completion (try up to 5 times with 3 second delays)
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          try {
            const resultResponse = await fetch(`https://app-api.pixverse.ai/openapi/v2/video/result/${videoId}`, {
              headers: {
                'API-KEY': this.pixverseApiKey,
              },
            });
            
            if (resultResponse.ok) {
              const resultData = await resultResponse.json();
              this.log(`Poll ${i + 1} result status: ${resultData.data?.status}`);
              
              // Status 1 = completed
              if (resultData.data && resultData.data.status === 1) {
                // Use cover/thumbnail as the invite image
                imageUrl = resultData.data.cover_url || resultData.data.video_url;
                this.log(`Image ready: ${imageUrl}`);
                break;
              }
            }
          } catch (pollError) {
            this.log(`Poll ${i + 1} failed: ${pollError}`, 'warn');
          }
        }
      }

      // If no results after polling, use fallback
      if (!imageUrl) {
        this.log('Image generation timed out, using fallback assets');
        return this.generateFallbackAssets(event);
      }

      return { imageUrl, videoUrl: undefined };
    } catch (error) {
      this.log(`PixVerse API failed: ${error}`, 'warn');
      return this.generateFallbackAssets(event);
    }
  }

  private generateFallbackAssets(event: Event): { imageUrl?: string; videoUrl?: string } {
    // Generate a data URL for a simple SVG invite
    const svg = this.generateSVGInvite(event);
    const imageUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
    return { imageUrl };
  }

  private generateSVGInvite(event: Event): string {
    const date = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="800" height="1000" fill="#0a0a0a"/>
        <rect x="40" y="40" width="720" height="920" fill="url(#grad)" opacity="0.1" rx="20"/>
        <text x="400" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="url(#grad)" text-anchor="middle">
          You're Invited!
        </text>
        <text x="400" y="350" font-family="Arial, sans-serif" font-size="36" fill="#ffffff" text-anchor="middle">
          ${event.title}
        </text>
        <text x="400" y="450" font-family="Arial, sans-serif" font-size="24" fill="#a0a0a0" text-anchor="middle">
          📅 ${date}
        </text>
        <text x="400" y="500" font-family="Arial, sans-serif" font-size="24" fill="#a0a0a0" text-anchor="middle">
          🕐 ${event.time || 'TBD'}
        </text>
        <text x="400" y="550" font-family="Arial, sans-serif" font-size="24" fill="#a0a0a0" text-anchor="middle">
          📍 ${event.location_text.substring(0, 40)}${event.location_text.length > 40 ? '...' : ''}
        </text>
        <text x="400" y="700" font-family="Arial, sans-serif" font-size="20" fill="#8b5cf6" text-anchor="middle">
          Scan QR code or visit link to RSVP
        </text>
        <text x="400" y="850" font-family="Arial, sans-serif" font-size="18" fill="#666666" text-anchor="middle">
          Powered by Anthea AI
        </text>
      </svg>
    `;
  }

  private async generateQRCode(eventId: string): Promise<string> {
    try {
      // Use QR code generation API (free service)
      const rsvpUrl = `${this.appUrl}/rsvp/${eventId}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(rsvpUrl)}`;
      
      this.log(`Generated QR code for: ${rsvpUrl}`);
      return qrApiUrl;
    } catch (error) {
      this.log(`QR code generation failed: ${error}`, 'error');
      return '';
    }
  }

  private generateDefaultMessage(event: Event): string {
    const date = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return `You're invited to ${event.title}!

📅 ${date}
🕐 ${event.time || 'Time TBD'}
📍 ${event.location_text}

Please RSVP to let us know if you can make it. We look forward to seeing you there!`;
  }
  /**
   * Generate video invite on-demand (separate from initial image generation)
   */
  async generateVideoInvite(event: Event, inviteId: string): Promise<{ videoUrl?: string; taskId?: string }> {
    if (!this.pixverseApiKey) {
      this.log('PixVerse API key not configured', 'warn');
      return {};
    }

    try {
      const prompt = this.generateInvitePrompt(event, 'modern');
      this.log(`Generating video invite for: ${event.title}`);
      
      const traceId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const videoResponse = await fetch('https://app-api.pixverse.ai/openapi/v2/video/text/generate', {
        method: 'POST',
        headers: {
          'API-KEY': this.pixverseApiKey,
          'Ai-trace-id': traceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt}. Animated invitation, smooth transitions, cinematic`,
          model: 'v6',
          duration: 5,
          quality: '720p',
          aspect_ratio: '16:9',
        }),
      });

      if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        throw new Error(`PixVerse API error ${videoResponse.status}: ${errorText}`);
      }

      const videoData = await videoResponse.json();
      
      if (videoData.ErrCode && videoData.ErrCode !== 0) {
        throw new Error(`PixVerse error: ${videoData.ErrMsg}`);
      }
      
      if (videoData.data && videoData.data.video_id) {
        const taskId = videoData.data.video_id;
        this.log(`Video generation task created: ${taskId}`);
        
        // Return task ID for polling by client
        return { taskId };
      }

      return {};
    } catch (error) {
      this.log(`Video generation failed: ${error}`, 'error');
      return {};
    }
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(taskId: string): Promise<{ status: string; videoUrl?: string; progress?: number }> {
    if (!this.pixverseApiKey) {
      return { status: 'error' };
    }

    try {
      const resultResponse = await fetch(`https://app-api.pixverse.ai/openapi/v2/video/result/${taskId}`, {
        headers: {
          'API-KEY': this.pixverseApiKey,
        },
      });
      
      if (!resultResponse.ok) {
        return { status: 'error' };
      }

      const resultData = await resultResponse.json();
      
      if (resultData.data) {
        const status = resultData.data.status;
        
        // Status: 0 = pending, 1 = completed, 2 = failed
        if (status === 1) {
          return {
            status: 'completed',
            videoUrl: resultData.data.video_url,
          };
        } else if (status === 2) {
          return { status: 'failed' };
        } else {
          return {
            status: 'processing',
            progress: resultData.data.progress || 0,
          };
        }
      }

      return { status: 'pending' };
    } catch (error) {
      this.log(`Status check failed: ${error}`, 'error');
      return { status: 'error' };
    }
  }
}

// Made with Bob
