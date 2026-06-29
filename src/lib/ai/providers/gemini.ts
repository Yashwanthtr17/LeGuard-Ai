import type { AIProvider, AnalysisInput, AnalysisResult } from '../types';
import { parseAnalysisResponse } from '../index';

export class GeminiProvider implements AIProvider {
  name = 'gemini';

  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    if (!this.apiKey) {
      throw new Error('Google API key not configured. Set GOOGLE_API_KEY.');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input.text }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      let message = `Gemini analysis failed (${response.status})`;
      if (response.status === 403) message = 'Gemini returned 403. Your API key may be invalid or expired.';
      else if (response.status === 429) message = 'Gemini rate limit exceeded. Please wait and try again.';
      else if (response.status === 400) message = 'Gemini rejected the request. The document may be too long or malformed.';
      throw new Error(message);
    }

    const data = await response.json();
    const content: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('Gemini could not analyze this document. Try a different document.');

    return parseAnalysisResponse(content);
  }
}
