import type { Clause, CountryCompliance } from '@/types';

export interface AnalysisInput {
  text: string;
  country: string;
  focusAreas?: string;
  documentType?: string;
  sensitivity?: string;
}

export interface ClauseResult {
  name: string;
  risk_score: number;
  risk_level: string;
  plain_english: string;
  why_it_matters: string;
  recommendation: string;
  location: string;
}

export interface ComplianceResult {
  law: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'FLAGGED';
  note: string;
}

export interface TimelineEvent {
  event: string;
  date: string;
}

export interface Obligation {
  party: string;
  obligation: string;
}

export interface AnalysisResult {
  overall_score: number;
  risk_level: string;
  verdict: string;
  executive_summary: string;
  plain_english_summary: string;
  document_type_detected: string;
  country_applied: string;
  confidence_score: number;
  clauses: ClauseResult[];
  country_compliance: ComplianceResult[];
  red_flags: string[];
  positive_aspects: string[];
  hidden_clauses: ClauseResult[];
  missing_clauses: ClauseResult[];
  dangerous_clauses: string[];
  unfair_clauses: string[];
  financial_risks: string[];
  legal_risks: string[];
  timeline: TimelineEvent[];
  obligations: Obligation[];
  penalties: string[];
  termination_conditions: string[];
  renewal_conditions: string[];
  privacy_risks: string[];
  liability_risks: string[];
  governing_law: string;
  arbitration: string;
  jurisdiction: string;
  ai_suggestions: string[];
  negotiation_tips: string[];
}

export interface AIProvider {
  name: string;
  analyze(input: AnalysisInput): Promise<AnalysisResult>;
  isAvailable(): boolean;
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

export type { Clause, CountryCompliance };
