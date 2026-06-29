import type { AIProvider, AnalysisInput, AnalysisResult } from '../types';
import { parseAnalysisResponse } from '../index';

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter';

  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.model = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-7b-instruct:free';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured. Set OPENROUTER_API_KEY.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://leguard-ai.app',
        'X-Title': 'LeGuard-AI',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: input.text }],
        temperature: 0.2,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      let message = `OpenRouter analysis failed (${response.status})`;
      if (response.status === 401 || response.status === 403) message = 'OpenRouter authentication failed. Check your API key.';
      else if (response.status === 429) message = 'OpenRouter rate limit exceeded. Please wait and try again.';
      throw new Error(message);
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenRouter returned empty response. Please try again.');

    return parseAnalysisResponse(content);
  }
}
