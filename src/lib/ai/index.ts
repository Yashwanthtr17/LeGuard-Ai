import type { AnalysisInput, AnalysisResult, AIProvider } from './types';
import { SYSTEM_PROMPT } from './system-prompt';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { ClaudeProvider } from './providers/claude';
import { OpenRouterProvider } from './providers/openrouter';
import { OllamaProvider } from './providers/ollama';
import type { Clause, CountryCompliance } from '@/types';

export * from './types';
export { SYSTEM_PROMPT };

const MAX_CHARS = 80000;
const MAX_RETRIES = 3;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function parseAnalysisResponse(content: string): AnalysisResult {
  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  const defaultClause = (): Clause[] => [];
  const defaultStr = (): string[] => [];

  return {
    overall_score: (parsed.overall_score as number) ?? 5,
    risk_level: (parsed.risk_level as string) || 'MEDIUM',
    verdict: (parsed.verdict as string) || 'Analysis complete.',
    executive_summary: (parsed.executive_summary as string) || 'Analysis complete.',
    plain_english_summary: (parsed.plain_english_summary as string) || '',
    document_type_detected: (parsed.document_type_detected as string) || 'Document',
    country_applied: (parsed.country_applied as string) || '',
    confidence_score: (parsed.confidence_score as number) ?? 85,
    clauses: (parsed.clauses as Clause[]) || defaultClause(),
    country_compliance: (parsed.country_compliance as CountryCompliance[]) || [],
    red_flags: (parsed.red_flags as string[]) || defaultStr(),
    positive_aspects: (parsed.positive_aspects as string[]) || defaultStr(),
    hidden_clauses: (parsed.hidden_clauses as Clause[]) || defaultClause(),
    missing_clauses: (parsed.missing_clauses as Clause[]) || defaultClause(),
    dangerous_clauses: (parsed.dangerous_clauses as string[]) || defaultStr(),
    unfair_clauses: (parsed.unfair_clauses as string[]) || defaultStr(),
    financial_risks: (parsed.financial_risks as string[]) || defaultStr(),
    legal_risks: (parsed.legal_risks as string[]) || defaultStr(),
    timeline: (parsed.timeline as { event: string; date: string }[]) || [],
    obligations: (parsed.obligations as { party: string; obligation: string }[]) || [],
    penalties: (parsed.penalties as string[]) || defaultStr(),
    termination_conditions: (parsed.termination_conditions as string[]) || defaultStr(),
    renewal_conditions: (parsed.renewal_conditions as string[]) || defaultStr(),
    privacy_risks: (parsed.privacy_risks as string[]) || defaultStr(),
    liability_risks: (parsed.liability_risks as string[]) || defaultStr(),
    governing_law: (parsed.governing_law as string) || '',
    arbitration: (parsed.arbitration as string) || '',
    jurisdiction: (parsed.jurisdiction as string) || '',
    ai_suggestions: (parsed.ai_suggestions as string[]) || defaultStr(),
    negotiation_tips: (parsed.negotiation_tips as string[]) || defaultStr(),
  };
}

function buildPrompt(input: Omit<AnalysisInput, 'text'> & { text: string }): string {
  const focusText = input.focusAreas
    ? `Focus especially on: ${input.focusAreas}`
    : 'Focus on all standard legal clauses.';

  return `${SYSTEM_PROMPT}

SELECTED COUNTRY: ${input.country}
${focusText}

DOCUMENT TEXT:
${input.text}

Return ONLY valid JSON. No other text.`;
}

function getAIProvider(): AIProvider {
  const configured = process.env.AI_PROVIDER?.toLowerCase();

  if (configured === 'openai') return new OpenAIProvider();
  if (configured === 'gemini') return new GeminiProvider();
  if (configured === 'claude') return new ClaudeProvider();
  if (configured === 'openrouter') return new OpenRouterProvider();
  if (configured === 'ollama') return new OllamaProvider();

  const providers: AIProvider[] = [
    new OpenRouterProvider(),
    new GeminiProvider(),
    new OpenAIProvider(),
  ];

  for (const provider of providers) {
    if (provider.isAvailable()) return provider;
  }

  throw new Error(
    'No AI provider configured. Set AI_PROVIDER env var or configure one of: OPENROUTER_API_KEY, GOOGLE_API_KEY, OPENAI_API_KEY.'
  );
}

async function analyzeDocument(
  documentText: string,
  selectedCountry: string,
  focusAreas: string
): Promise<AnalysisResult> {
  const truncatedText =
    documentText.length > MAX_CHARS
      ? documentText.slice(0, MAX_CHARS) + '\n\n[... DOCUMENT TRUNCATED FOR LENGTH ...]'
      : documentText;

  const prompt = buildPrompt({
    text: truncatedText,
    country: selectedCountry,
    focusAreas,
  });

  const provider = getAIProvider();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      return await provider.analyze({ text: prompt, country: selectedCountry, focusAreas });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown AI analysis error');
      if (
        lastError.message.includes('authentication') ||
        lastError.message.includes('API key') ||
        lastError.message.includes('not configured')
      ) {
        break;
      }
    }
  }

  throw lastError || new Error('AI analysis failed after all retries.');
}

export { getAIProvider, buildPrompt, parseAnalysisResponse, fetchWithTimeout, analyzeDocument, MAX_CHARS };
