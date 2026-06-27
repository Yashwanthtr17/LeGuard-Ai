import type { Clause, CountryCompliance } from '@/types';

export interface AnalysisResult {
  overall_score: number;
  risk_level: string;
  verdict: string;
  executive_summary: string;
  document_type_detected: string;
  country_applied: string;
  clauses: Clause[];
  country_compliance: CountryCompliance[];
  red_flags: string[];
  positive_aspects: string[];
}

export const DOCUMENT_TYPES = [
  'Contract / Agreement',
  'NDA (Non-Disclosure Agreement)',
  'Employment Agreement',
  'Lease / Rental Agreement',
  'Privacy Policy / Terms of Service',
  'Loan / Financial Agreement',
  'Government / Regulatory Document',
  'Other',
] as const;

export const FOCUS_AREAS = [
  { value: 'liability', label: 'Liability Clauses' },
  { value: 'termination', label: 'Termination Conditions' },
  { value: 'payment', label: 'Payment Terms' },
  { value: 'ip', label: 'Intellectual Property Rights' },
  { value: 'dispute', label: 'Dispute Resolution' },
  { value: 'privacy', label: 'Data Privacy Compliance' },
  { value: 'penalty', label: 'Penalty / Indemnity Clauses' },
] as const;

export const SENSITIVITY_LEVELS = [
  { value: 'standard', label: 'Standard', description: 'Balanced analysis of typical risks' },
  { value: 'strict', label: 'Strict', description: 'Flag even minor potential issues as risks' },
  { value: 'lenient', label: 'Lenient', description: 'Only flag significant, clearly problematic clauses' },
] as const;

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe',
] as const;

const SYSTEM_PROMPT = `You are LeGuard-AI, an expert legal document analyser. Your job is to analyse legal documents and explain them in plain, simple English that any non-lawyer can understand. You must:

1. Identify every significant legal clause in the document
2. Assign a risk score from 1-10 to each clause (1 = very safe, 10 = very risky)
3. Calculate an overall document risk score (weighted average)
4. Explain everything in simple, jargon-free language
5. Apply the legal framework of the user's selected country
6. Focus especially on the user's selected focus areas

You MUST respond in the following JSON format only, with no extra text:

{
  "overall_score": 7.2,
  "risk_level": "HIGH",
  "verdict": "One sentence plain-English summary of the overall risk",
  "executive_summary": "2-4 sentence plain English explanation of the document and main risks",
  "document_type_detected": "Contract",
  "country_applied": "India",
  "clauses": [
    {
      "name": "Termination Clause",
      "risk_score": 8,
      "risk_level": "HIGH",
      "plain_english": "What this clause says in simple terms",
      "why_it_matters": "Why this is risky under the country's law",
      "recommendation": "What the user should do or negotiate",
      "location": "Section 7, Page 3"
    }
  ],
  "country_compliance": [
    {
      "law": "Indian Contract Act 1872",
      "status": "COMPLIANT",
      "note": "Offer and acceptance clauses are valid"
    }
  ],
  "red_flags": ["Unlimited liability clause", "No dispute resolution mechanism"],
  "positive_aspects": ["Clear payment terms", "Well-defined scope of work"]
}

RISK SCORE GUIDE:
- 1-3: Low risk
- 4-6: Medium risk
- 7-10: High risk`;

const MAX_CHARS = 80000;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 60_000;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function analyzeWithGemini(prompt: string, apiKey: string): Promise<AnalysisResult> {
  const response = await fetchWithTimeout(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: 'application/json',
        },
      }),
    },
    TIMEOUT_MS
  );

  if (!response.ok) {
    const errorText = await response.text();
    let message = `AI analysis failed (${response.status})`;
    if (response.status === 403) message = 'AI service returned 403. Your API key may be invalid or expired.';
    else if (response.status === 429) message = 'Rate limit exceeded. Please wait and try again.';
    else if (response.status === 400) message = 'AI service rejected the request. The document may be too long or malformed.';
    throw new Error(message);
  }

  const data = await response.json();
  const content: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error('AI could not analyze this document. Try a different document.');

  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  return {
    overall_score: (parsed.overall_score as number) ?? 5,
    risk_level: (parsed.risk_level as string) || 'MEDIUM',
    verdict: (parsed.verdict as string) || 'Analysis complete.',
    executive_summary: (parsed.executive_summary as string) || 'Analysis complete.',
    document_type_detected: (parsed.document_type_detected as string) || 'Document',
    country_applied: (parsed.country_applied as string) || '',
    clauses: (parsed.clauses as Clause[]) || [],
    country_compliance: (parsed.country_compliance as CountryCompliance[]) || [],
    red_flags: (parsed.red_flags as string[]) || [],
    positive_aspects: (parsed.positive_aspects as string[]) || [],
  };
}

async function analyzeWithDeepSeek(prompt: string, apiKey: string): Promise<AnalysisResult> {
  const response = await fetchWithTimeout(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://leguard-ai.app',
        'X-Title': 'LeGuard-AI',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-7b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    },
    TIMEOUT_MS
  );

  if (!response.ok) {
    const errorText = await response.text();
    let message = `AI analysis failed (${response.status})`;
    if (response.status === 401 || response.status === 403) message = 'AI service authentication failed. Check your API key.';
    else if (response.status === 429) message = 'AI service rate limit exceeded. Please wait and try again.';
    throw new Error(message);
  }

  const data = await response.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI returned empty response. Please try again.');

  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  return {
    overall_score: (parsed.overall_score as number) ?? 5,
    risk_level: (parsed.risk_level as string) || 'MEDIUM',
    verdict: (parsed.verdict as string) || 'Analysis complete.',
    executive_summary: (parsed.executive_summary as string) || 'Analysis complete.',
    document_type_detected: (parsed.document_type_detected as string) || 'Document',
    country_applied: (parsed.country_applied as string) || '',
    clauses: (parsed.clauses as Clause[]) || [],
    country_compliance: (parsed.country_compliance as CountryCompliance[]) || [],
    red_flags: (parsed.red_flags as string[]) || [],
    positive_aspects: (parsed.positive_aspects as string[]) || [],
  };
}

export async function analyzeDocument(
  documentText: string,
  selectedCountry: string,
  focusAreas: string
): Promise<AnalysisResult> {
  const truncatedText = documentText.length > MAX_CHARS
    ? documentText.slice(0, MAX_CHARS) + '\n\n[... DOCUMENT TRUNCATED FOR LENGTH ...]'
    : documentText;

  const focusText = focusAreas
    ? `Focus especially on: ${focusAreas}`
    : 'Focus on all standard legal clauses.';

  const prompt = `${SYSTEM_PROMPT}

SELECTED COUNTRY: ${selectedCountry}
${focusText}

DOCUMENT TEXT:
${truncatedText}

Return ONLY valid JSON. No other text.`;

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GOOGLE_API_KEY;

  if (!openRouterKey && !geminiKey) {
    throw new Error('No AI API key configured. Set OPENROUTER_API_KEY or GOOGLE_API_KEY in your environment.');
  }

  let lastError: Error | null = null;

  if (openRouterKey) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
        return await analyzeWithDeepSeek(prompt, openRouterKey);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown AI analysis error');
        if (lastError.message.includes('authentication') || lastError.message.includes('API key')) {
          break;
        }
        console.error(`[ai] OpenRouter attempt ${attempt + 1}/${MAX_RETRIES} failed:`, lastError.message);
      }
    }
  }

  if (geminiKey) {
    console.log('[ai] Falling back to Gemini');
    return await analyzeWithGemini(prompt, geminiKey);
  }

  throw lastError || new Error('AI analysis failed. Both OpenRouter and Gemini were unavailable.');
}
