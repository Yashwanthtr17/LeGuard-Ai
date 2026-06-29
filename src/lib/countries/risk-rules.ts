import { COUNTRY_LEGAL_DATA } from './data';
import type { CountryLaw } from './types';

const DOCUMENT_RULES: Record<string, Record<string, string[]>> = {
  'United States': {
    'Employment Agreement': [
      'Verify at-will employment disclaimer presence',
      'Check for non-compete clause enforceability (state-specific, increasingly restricted)',
      'Review arbitration clause class action waiver validity',
      'Assess overtime exemption classification accuracy',
      'Verify restrictive covenant geographic and temporal reasonableness',
      'Check for implied covenant of good faith and fair dealing compliance',
    ],
    'Contract / Agreement': [
      'Verify UCC Article 2 implied warranty disclaimers (conspicuous requirement)',
      'Check statute of frauds satisfaction (writing for contracts over $500)',
      'Review battle of the forms risk under UCC Section 2-207',
      'Assess liquidated damages clause reasonableness (not a penalty)',
      'Verify choice of law and venue clause enforceability',
    ],
    'NDA (Non-Disclosure Agreement)': [
      'Verify definition of confidential information scope (not overly broad)',
      'Check exclusion for independently developed information',
      'Review trade secret protection under DTSA/state law',
      'Assess duration of confidentiality obligations reasonableness',
      'Verify return or destruction of materials clause clarity',
    ],
    'Lease / Rental Agreement': [
      'Verify security deposit limit compliance (state-specific)',
      'Check implied warranty of habitability waiver prohibition',
      'Review eviction notice and cure period requirements',
      'Assess rent control ordinance compliance (local jurisdiction)',
      'Verify landlord entry notice requirements',
    ],
    'Privacy Policy / Terms of Service': [
      'Verify CCPA/CPRA consumer rights disclosure compliance',
      'Check data collection and sharing disclosure completeness',
      'Review opt-out and deletion request mechanism availability',
      'Assess COPPA compliance if services target under-13 users',
      'Verify GDPR applicability for EU user data',
    ],
  },
  'United Kingdom': {
    'Employment Agreement': [
      'Verify written statement of employment particulars completeness',
      'Check unfair dismissal qualifying period (2 years continuous service)',
      'Review non-compete clause enforceability (legitimate business interest test)',
      'Assess collective redundancy consultation obligation trigger (20+ employees)',
      'Verify zero-hours contract exclusivity clause ban compliance',
      'Check statutory redundancy payment calculation accuracy',
    ],
    'Contract / Agreement': [
      'Verify unfair contract terms under Consumer Rights Act 2015',
      'Check exclusion clause reasonableness under UCTA 1977',
      'Review penalty clause enforceability (compensatory not punitive)',
      'Assess force majeure clause completeness (no implied term)',
      'Verify entire agreement clause effectiveness',
    ],
    'NDA (Non-Disclosure Agreement)': [
      'Verify definition of confidential information not overly broad',
      'Check public interest disclosure protection (whistleblowing)',
      'Review permitted disclosure to professional advisers scope',
      'Assess duration of obligations (must be reasonable)',
      'Verify return/destruction of information provisions',
    ],
    'Privacy Policy / Terms of Service': [
      'Verify UK GDPR lawful basis for processing identification',
      'Check international data transfer mechanism adequacy (UK Addendum)',
      'Review data subject rights procedures (SAR, erasure, portability)',
      'Assess cookie consent mechanism compliance (PECR)',
      'Verify ICO registration (data protection fee payment)',
    ],
  },
  India: {
    'Employment Agreement': [
      'Verify compliance with Industrial Disputes Act for workmen classification',
      'Check notice period requirement under employment standing orders',
      'Review fixed-term employment contract entitlement (same benefits as permanent)',
      'Assess non-compete clause enforceability (unenforceable post-termination)',
      'Verify provident fund (PF) and ESI registration compliance',
    ],
    'Contract / Agreement': [
      'Verify free consent absence of coercion/undue influence under ICA 1872',
      'Check stamp duty payment adequacy on agreement',
      'Review arbitration clause validity under Arbitration Act 1996',
      'Assess liquidated damages clause (genuine pre-estimate, not penalty)',
      'Verify jurisdiction clause compliance (Indian courts exclusive)',
    ],
    'NDA (Non-Disclosure Agreement)': [
      'Verify definition of confidential information completeness',
      'Check exclusions for publicly known information scope',
      'Review governing law clause implications for enforceability',
      'Assess remedy for breach adequacy (injunction availability)',
      'Verify term of confidentiality obligation reasonableness',
    ],
    'Lease / Rental Agreement': [
      'Verify stamp duty and registration under Registration Act 1908',
      'Check Model Tenancy Act 2021 compliance (applicable states)',
      'Review security deposit maximum (2 months under Model Tenancy Act)',
      'Assess rent escalation clause and cap frequency',
      'Verify eviction grounds and notice period compliance',
    ],
    'Privacy Policy / Terms of Service': [
      'Verify compliance with DPDP Act 2023 consent requirements',
      'Check data fiduciary obligations and accountability measures',
      'Review cross-border data transfer restrictions (notified countries only)',
      'Assess data breach notification requirements and timeline',
      'Verify grievance officer appointment and contact disclosure',
    ],
  },
};

const DEFAULT_DOCUMENT_RULES: string[] = [
  'Verify governing law and jurisdiction clause compatibility',
  'Check for forum selection and dispute resolution clarity',
  'Review force majeure clause completeness and allocation of risk',
  'Assess entire agreement and severability clause effectiveness',
  'Verify notice and service of process requirements',
  'Check amendment and waiver clause conditions',
  'Review assignment and delegation restrictions',
  'Assess indemnification scope and cap reasonableness',
];

export function getRiskRules(country: string, documentType: string): string[] {
  const countryRules = DOCUMENT_RULES[country];
  if (!countryRules) {
    const laws = COUNTRY_LEGAL_DATA[country];
    if (!laws) return DEFAULT_DOCUMENT_RULES;
    const riskRules = laws.flatMap((l: CountryLaw) => l.riskRules);
    return riskRules.length > 0 ? riskRules : DEFAULT_DOCUMENT_RULES;
  }

  const documentSpecificRules = countryRules[documentType];
  if (!documentSpecificRules) return countryRules[Object.keys(countryRules)[0]] || DEFAULT_DOCUMENT_RULES;

  return [...new Set([...documentSpecificRules, ...DEFAULT_DOCUMENT_RULES])];
}

export function getDocumentRiskRules(country: string, documentType: string): string[] {
  return getRiskRules(country, documentType);
}
