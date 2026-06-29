import { getCountryFlag } from './flags';
import { getLawsForCountry } from './data';
import { getRiskRules } from './risk-rules';
import type { CountryInfo } from './types';

const MAJOR_COUNTRIES = [
  'United States', 'United Kingdom', 'India', 'Canada', 'Australia',
  'Germany', 'France', 'Brazil', 'Singapore', 'United Arab Emirates',
  'Japan', 'China', 'South Korea', 'Russia', 'South Africa',
  'Mexico', 'Italy', 'Netherlands', 'Switzerland', 'Sweden',
  'New Zealand', 'Nigeria', 'Indonesia',
];

const COUNTRY_INFO: Record<string, Omit<CountryInfo, 'name' | 'flag'>> = {
  'United States': { code: 'US', region: 'North America', legalSystem: 'Common Law', language: 'English', currency: 'USD' },
  'United Kingdom': { code: 'GB', region: 'Europe', legalSystem: 'Common Law', language: 'English', currency: 'GBP' },
  India: { code: 'IN', region: 'Asia', legalSystem: 'Common Law', language: 'Hindi, English', currency: 'INR' },
  Canada: { code: 'CA', region: 'North America', legalSystem: 'Common Law / Civil Law (Quebec)', language: 'English, French', currency: 'CAD' },
  Australia: { code: 'AU', region: 'Oceania', legalSystem: 'Common Law', language: 'English', currency: 'AUD' },
  Germany: { code: 'DE', region: 'Europe', legalSystem: 'Civil Law', language: 'German', currency: 'EUR' },
  France: { code: 'FR', region: 'Europe', legalSystem: 'Civil Law', language: 'French', currency: 'EUR' },
  Brazil: { code: 'BR', region: 'South America', legalSystem: 'Civil Law', language: 'Portuguese', currency: 'BRL' },
  Singapore: { code: 'SG', region: 'Asia', legalSystem: 'Common Law', language: 'English, Malay, Mandarin, Tamil', currency: 'SGD' },
  'United Arab Emirates': { code: 'AE', region: 'Middle East', legalSystem: 'Civil Law / Sharia', language: 'Arabic', currency: 'AED' },
  Japan: { code: 'JP', region: 'Asia', legalSystem: 'Civil Law', language: 'Japanese', currency: 'JPY' },
  China: { code: 'CN', region: 'Asia', legalSystem: 'Civil Law (Socialist)', language: 'Mandarin', currency: 'CNY' },
  'South Korea': { code: 'KR', region: 'Asia', legalSystem: 'Civil Law', language: 'Korean', currency: 'KRW' },
  Russia: { code: 'RU', region: 'Europe / Asia', legalSystem: 'Civil Law', language: 'Russian', currency: 'RUB' },
  'South Africa': { code: 'ZA', region: 'Africa', legalSystem: 'Mixed (Common/Civil/Customary)', language: '11 Official Languages', currency: 'ZAR' },
  Mexico: { code: 'MX', region: 'North America', legalSystem: 'Civil Law', language: 'Spanish', currency: 'MXN' },
  Italy: { code: 'IT', region: 'Europe', legalSystem: 'Civil Law', language: 'Italian', currency: 'EUR' },
  Netherlands: { code: 'NL', region: 'Europe', legalSystem: 'Civil Law', language: 'Dutch', currency: 'EUR' },
  Switzerland: { code: 'CH', region: 'Europe', legalSystem: 'Civil Law', language: 'German, French, Italian', currency: 'CHF' },
  Sweden: { code: 'SE', region: 'Europe', legalSystem: 'Civil Law', language: 'Swedish', currency: 'SEK' },
  'New Zealand': { code: 'NZ', region: 'Oceania', legalSystem: 'Common Law', language: 'English, Māori', currency: 'NZD' },
  Nigeria: { code: 'NG', region: 'Africa', legalSystem: 'Common Law', language: 'English', currency: 'NGN' },
  Indonesia: { code: 'ID', region: 'Asia', legalSystem: 'Civil Law (Mixed)', language: 'Indonesian', currency: 'IDR' },
};

export function getCountryInfo(countryName: string): CountryInfo {
  const info = COUNTRY_INFO[countryName];
  if (!info) {
    return {
      name: countryName,
      code: '--',
      flag: getCountryFlag(countryName),
      region: 'Unknown',
      legalSystem: 'Unknown',
      language: 'Unknown',
      currency: 'Unknown',
    };
  }
  return {
    name: countryName,
    ...info,
    flag: getCountryFlag(countryName),
  };
}

export { getLawsForCountry };
export { getRiskRules };

export function getAllCountries(): string[] {
  return Object.keys(COUNTRY_INFO);
}

export function getMajorCountries(): { name: string; code: string; flag: string }[] {
  return MAJOR_COUNTRIES.map((name) => {
    const info = COUNTRY_INFO[name];
    return {
      name,
      code: info?.code || '--',
      flag: getCountryFlag(name),
    };
  });
}
