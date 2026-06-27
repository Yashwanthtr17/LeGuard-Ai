import { ScanResult } from './store';

const SYSTEM_PROMPT = `You are LeGuard AI, an expert legal document analyst. Your role is to analyze legal documents and provide comprehensive risk assessments.

RULES:
1. Identify which country's laws govern the document based on its content
2. Analyze the document against the SELECTED JURISDICTION country's specific laws, regulations, and legal framework
3. Rate the overall risk score on a scale of 0 to 10 (0 = no risk, 10 = extremely high risk)
4. Identify ALL risky clauses, consequences, and obligations with their approximate page numbers
5. Find hidden threats, buried risks, ambiguous language, missing protections, and unfavorable terms
6. Explain everything in simple, plain language that non-lawyers can easily understand
7. Generate specific questions that the reader should ask the document provider (company, lawyer, or counterparty) about each risk found
8. Be thorough - don't miss anything

For page numbers: estimate based on document structure. If the document has headers/section markers, use those. Otherwise estimate based on approximate position.

CATEGORIES:
- statutory: Legal compliance, jurisdictional issues, regulatory risks, governing law problems
- commercial: Payment terms, financial obligations, dates, liabilities, indemnification, termination
- semantic: Ambiguous language, contradictory clauses, missing definitions, vague terms, intent issues

SEVERITY LEVELS:
- critical: Could cause major financial loss, legal liability, or business failure
- high: Significant risk that needs attention
- medium: Moderate risk worth addressing
- low: Minor issue, good to be aware of`;

export async function analyzeDocument(
  documentText: string,
  selectedJurisdiction: string,
  apiKey: string
): Promise<ScanResult> {
  const maxChars = 100000;
  const truncatedText =
    documentText.length > maxChars
      ? documentText.slice(0, maxChars) +
        '\n\n[... DOCUMENT TRUNCATED FOR LENGTH ...]'
      : documentText;

  const prompt = `You are LeGuard AI, an expert legal document analyst. Analyze this legal document thoroughly and provide a complete risk assessment.

${SYSTEM_PROMPT}

SELECTED JURISDICTION FOR ANALYSIS: ${selectedJurisdiction}
The document must be analyzed specifically against ${selectedJurisdiction}'s laws, regulations, and legal framework. Apply the local statutory requirements, common law precedents (if applicable), and regulatory standards of ${selectedJurisdiction}.

DOCUMENT TEXT:
${truncatedText}

Return a valid JSON object with this exact structure (no markdown, no code blocks, raw JSON only):
{
  "detectedCountry": "The country whose laws appear to govern this document based on its content",
  "riskScore": <number between 0 and 10>,
  "riskLevel": "none|low|medium|high",
  "summary": "2-3 sentence summary of overall risk in plain English",
  "consequences": [
    {
      "pageNumber": <estimated page number where this clause appears>,
      "clause": "Short name/title of the clause or section",
      "category": "statutory|commercial|semantic",
      "severity": "low|medium|high|critical",
      "issue": "What the issue is (1-2 sentences)",
      "explanation": "Detailed explanation of why this is a risk",
      "plainEnglish": "Simple 1-2 sentence explanation that anyone can understand without legal knowledge",
      "recommendation": "What should be changed, removed, added, or watched for"
    }
  ],
  "hiddenThreats": [
    {
      "pageNumber": <estimated page number>,
      "threat": "Name of the hidden threat or buried risk",
      "explanation": "Detailed explanation of the threat",
      "plainEnglish": "Simple explanation anyone can understand",
      "severity": "low|medium|high|critical"
    }
  ],
  "questionsToAsk": [
    "Question 1 that the reader should ask the document provider about a specific risk or clause - written in plain language",
    "Question 2 about another risk or concern",
    "Question 3 - continue for all major risks found"
  ]
}

IMPORTANT RULES FOR RISK SCORE (0-10):
- 0: No risks at all, completely safe document
- 1-3: Low risk, minor issues
- 4-6: Medium risk, moderate concerns that should be addressed
- 7-8: High risk, significant problems
- 9-10: Extremely high risk, dangerous terms
- If there are NO high-severity or critical consequences, set riskLevel to "none" or "low"
- riskLevel must be "none" when riskScore is 0

IMPORTANT: Return ONLY valid JSON. No other text.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        signal: controller.signal,
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
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let message = `AI analysis failed (${response.status})`;
      if (response.status === 403) {
        message = 'AI service returned 403 Forbidden. Your API key may be invalid or the Generative Language API is not enabled for your project. Get a valid key at https://aistudio.google.com/apikey';
      } else if (response.status === 429) {
        message = 'AI service rate limit exceeded. Please wait a moment and try again.';
      } else if (response.status === 400) {
        try {
          const err = JSON.parse(errorText);
          message = `AI request error: ${err.error?.message || errorText}`;
        } catch {
          message = `AI request error: ${errorText}`;
        }
      } else {
        message += `: ${errorText}`;
      }
      throw new Error(message);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text;

    if (!content) {
      const reason = candidate?.finishReason || 'unknown';
      const blockReason = candidate?.safetyRatings
        ?.filter((r: { blocked: boolean }) => r.blocked)
        ?.map((r: { category: string }) => r.category)
        ?.join(', ');

      const detail = blockReason
        ? `Blocked by safety filters: ${blockReason}`
        : `Finish reason: ${reason}`;
      throw new Error(`AI could not analyze this document. ${detail}. Try a different document or adjust content.`);
    }

    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      id: '',
      fileName: '',
      fileType: '',
      jurisdiction: selectedJurisdiction,
      detectedCountry: parsed.detectedCountry || 'Unknown',
      riskScore: parsed.riskScore ?? 0,
      riskLevel: parsed.riskLevel || 'none',
      summary: parsed.summary || 'Analysis complete.',
      consequences: parsed.consequences || [],
      hiddenThreats: parsed.hiddenThreats || [],
      questionsToAsk: parsed.questionsToAsk || [],
      documentText: documentText.slice(0, 50000),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Analysis took too long and timed out. Try a shorter document or try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const JURISDICTIONS = [
  { value: 'auto', label: 'Auto-detect from document', country: 'auto' },
  { value: 'us', label: 'United States', country: 'United States' },
  { value: 'uk', label: 'United Kingdom', country: 'United Kingdom' },
  { value: 'india', label: 'India', country: 'India' },
  { value: 'canada', label: 'Canada', country: 'Canada' },
  { value: 'australia', label: 'Australia', country: 'Australia' },
  { value: 'germany', label: 'Germany', country: 'Germany' },
  { value: 'france', label: 'France', country: 'France' },
  { value: 'japan', label: 'Japan', country: 'Japan' },
  { value: 'china', label: 'China', country: 'China' },
  { value: 'singapore', label: 'Singapore', country: 'Singapore' },
  { value: 'uae', label: 'United Arab Emirates', country: 'UAE' },
  { value: 'saudi-arabia', label: 'Saudi Arabia', country: 'Saudi Arabia' },
  { value: 'brazil', label: 'Brazil', country: 'Brazil' },
  { value: 'south-africa', label: 'South Africa', country: 'South Africa' },
  { value: 'netherlands', label: 'Netherlands', country: 'Netherlands' },
  { value: 'switzerland', label: 'Switzerland', country: 'Switzerland' },
  { value: 'sweden', label: 'Sweden', country: 'Sweden' },
  { value: 'norway', label: 'Norway', country: 'Norway' },
  { value: 'hong-kong', label: 'Hong Kong', country: 'Hong Kong' },
  { value: 'south-korea', label: 'South Korea', country: 'South Korea' },
  { value: 'russia', label: 'Russia', country: 'Russia' },
] as const;
