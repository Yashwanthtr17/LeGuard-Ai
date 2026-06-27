export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';

export type AnalysisStatus = 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'complete' | 'error';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  default_country: string;
  risk_sensitivity: string;
  onboarding_complete: boolean;
}

export interface Clause {
  name: string;
  risk_score: number;
  risk_level: RiskLevel;
  plain_english: string;
  why_it_matters: string;
  recommendation: string;
  location: string;
}

export interface CountryCompliance {
  law: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'FLAGGED';
  note: string;
}

export interface RiskReport {
  id: string;
  documentName: string;
  documentType: string;
  jurisdiction: string;
  overallScore: number;
  riskLevel: RiskLevel;
  verdict: string;
  executiveSummary: string;
  clauses: Clause[];
  countryCompliance: CountryCompliance[];
  redFlags: string[];
  positiveAspects: string[];
  createdAt: string;
}

export interface ReportSummary {
  id: string;
  document_name: string;
  document_type: string;
  country: string;
  overall_score: number;
  risk_level: RiskLevel;
  created_at: string;
}

export interface DashboardStats {
  total_analyses: number;
  avg_risk_score: number;
  high_risk_docs: number;
  reports_saved: number;
  score_distribution: number[];
  recent_reports: ReportSummary[];
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
}

export interface AnalysisState {
  status: AnalysisStatus;
  progress: number;
  report: RiskReport | null;
  error: string | null;
}

export interface ApiError {
  error: boolean;
  message: string;
}

export interface ApiSuccess<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  total_pages: number;
}
