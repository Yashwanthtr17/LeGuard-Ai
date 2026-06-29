import type { AIProvider, AnalysisInput, AnalysisResult } from '../types';
import { parseAnalysisResponse } from '../index';

export class ClaudeProvider implements AIProvider {
  name = 'claude';

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.model = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest';
    this.baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY.');
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        temperature: 0.2,
        messages: [{ role: 'user', content: input.text }],
      }),
    });

    if (!response.ok) {
      let message = `Claude analysis failed (${response.status})`;
      if (response.status === 401) message = 'Claude authentication failed. Check your ANTHROPIC_API_KEY.';
      else if (response.status === 429) message = 'Claude rate limit exceeded. Please wait and try again.';
      else if (response.status === 400) message = 'Claude rejected the request. The document may be too long.';
      throw new Error(message);
    }

    const data = await response.json();
    const content: string | undefined = data.content?.[0]?.text;
    if (!content) throw new Error('Claude returned empty response. Please try again.');

    return parseAnalysisResponse(content);
  }
}
