import type { AIProvider, AnalysisInput, AnalysisResult } from '../types';
import { parseAnalysisResponse } from '../index';

export class OllamaProvider implements AIProvider {
  name = 'ollama';

  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
  }

  isAvailable(): boolean {
    return true;
  }

  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: input.text }],
        stream: false,
        options: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      let message = `Ollama analysis failed (${response.status})`;
      if (response.status === 404) message = `Ollama model "${this.model}" not found. Make sure it's pulled.`;
      else if (response.status === 502) message = 'Cannot connect to Ollama. Make sure it is running.';
      throw new Error(message);
    }

    const data = await response.json();
    const content: string | undefined = data.message?.content;
    if (!content) throw new Error('Ollama returned empty response. Make sure the model is running.');

    return parseAnalysisResponse(content);
  }
}
