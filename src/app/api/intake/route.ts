/**
 * EventPilot AI - Intake API Route
 * Phase 3: Connects frontend to Orchestrator agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { OrchestratorAgent } from '@/agents/orchestrator-agent';

const orchestrator = new OrchestratorAgent();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, inputMode, eventId, organizerId } = body;

    // Validate input
    if (!message || !inputMode || !organizerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Execute orchestrator agent
    const result = await orchestrator.execute({
      message,
      inputMode,
      eventId,
      organizerId,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Intake API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
