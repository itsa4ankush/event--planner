/**
 * EventPilot AI - Base Agent Class
 * Phase 2: Foundation for all specialist agents
 */

export interface AgentConfig {
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
  timestamp: Date;
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.name}]`;
    
    switch (level) {
      case 'info':
        console.log(`${prefix} ℹ️  ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️  ${message}`);
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        break;
    }
  }

  protected createSuccessResult<T>(data: T, fallbackUsed = false): AgentResult<T> {
    return {
      success: true,
      data,
      fallbackUsed,
      timestamp: new Date(),
    };
  }

  protected createErrorResult(error: string): AgentResult {
    return {
      success: false,
      error,
      timestamp: new Date(),
    };
  }

  abstract execute(...args: any[]): Promise<AgentResult>;
}

// Made with Bob
