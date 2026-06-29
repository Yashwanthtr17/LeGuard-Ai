import type { AIProvider, AnalysisInput, AnalysisResult } from '../types';
import { parseAnalysisResponse } from '../index';

export class OpenAIProvider implements AIProvider {
  name = 'openai';

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY.');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: input.text },
        ],
        temperature: 0.2,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      let message = `OpenAI analysis failed (${response.status})`;
      if (response.status === 401) message = 'OpenAI authentication failed. Check your API key.';
      else if (response.status === 429) message = 'OpenAI rate limit exceeded. Please wait and try again.';
      else if (response.status === 400) message = 'OpenAI rejected the request. The document may be too long.';
      throw new Error(message);
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenAI returned empty response. Please try again.');

    return parseAnalysisResponse(content);
  }
}
