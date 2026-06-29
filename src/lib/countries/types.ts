export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
  region: string;
  legalSystem: string;
  language: string;
  currency: string;
}

export interface CountryLaw {
  country: string;
  category: 'consumer' | 'employment' | 'rental' | 'property' | 'business' | 'privacy' | 'contract';
  lawName: string;
  description: string;
  riskRules: string[];
}
