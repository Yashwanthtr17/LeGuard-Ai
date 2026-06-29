export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      sessions: {
        Row: Session
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      two_factor: {
        Row: TwoFactor
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      documents: {
        Row: Document
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      analyses: {
        Row: Analysis
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      reports: {
        Row: Report
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      clauses: {
        Row: Clause
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      country_compliance: {
        Row: CountryCompliance
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      risk_items: {
        Row: RiskItem
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      timeline_events: {
        Row: TimelineEvent
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      obligations: {
        Row: Obligation
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      subscriptions: {
        Row: Subscription
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      payments: {
        Row: Payment
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      notifications: {
        Row: Notification
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      activity_logs: {
        Row: ActivityLog
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      ai_usage_logs: {
        Row: AiUsageLog
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      support_tickets: {
        Row: SupportTicket
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      feedback: {
        Row: Feedback
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      country_laws: {
        Row: CountryLaw
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_admin_stats: {
        Args: Record<string, never>
        Returns: Json
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  default_country: string
  risk_sensitivity: string
  language: string
  theme: string
  onboarding_complete: boolean
  email_notifications: boolean
  marketing_emails: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  device: string | null
  ip_address: string | null
  user_agent: string | null
  last_active_at: string
  created_at: string
}

export interface TwoFactor {
  id: string
  user_id: string
  secret: string | null
  enabled: boolean
  backup_codes: string[] | null
  created_at: string
}

export interface Document {
  id: string
  user_id: string
  original_name: string
  file_type: string
  file_size: number
  storage_path: string
  mime_type: string | null
  status: string
  page_count: number
  text_content: string | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  document_id: string
  user_id: string
  status: string
  ai_provider: string | null
  model_used: string | null
  confidence_score: number
  overall_score: number
  risk_level: string | null
  verdict: string | null
  executive_summary: string | null
  plain_english_summary: string | null
  country_applied: string | null
  document_type_detected: string | null
  governing_law: string | null
  arbitration: string | null
  jurisdiction: string | null
  full_result: Json | null
  processing_time_ms: number | null
  tokens_used: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Report {
  id: string
  analysis_id: string
  user_id: string
  document_id: string
  title: string
  pdf_url: string | null
  is_favorite: boolean
  is_archived: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Clause {
  id: string
  analysis_id: string
  name: string
  type: string | null
  risk_score: number
  risk_level: string | null
  plain_english: string | null
  why_it_matters: string | null
  recommendation: string | null
  location: string | null
  sort_order: number
}

export interface CountryCompliance {
  id: string
  analysis_id: string
  law: string
  status: string
  note: string | null
}

export interface RiskItem {
  id: string
  analysis_id: string
  category: string
  content: string
  sort_order: number
}

export interface TimelineEvent {
  id: string
  analysis_id: string
  event: string
  event_date: string | null
  sort_order: number
}

export interface Obligation {
  id: string
  analysis_id: string
  party: string
  obligation: string
  sort_order: number
}

export interface Subscription {
  id: string
  user_id: string
  plan: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  payment_provider: string | null
  payment_provider_id: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  subscription_id: string | null
  amount: number
  currency: string
  status: string
  payment_provider: string | null
  payment_provider_id: string | null
  description: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: Json | null
  is_read: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  resource: string | null
  resource_id: string | null
  details: Json | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AiUsageLog {
  id: string
  user_id: string | null
  provider: string
  model: string
  tokens_in: number
  tokens_out: number
  duration_ms: number
  document_size: number
  success: boolean
  error_message: string | null
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  priority: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  user_id: string
  rating: number | null
  message: string | null
  category: string | null
  created_at: string
}

export interface CountryLaw {
  id: string
  country: string
  category: string
  law_name: string
  description: string | null
  risk_rules: Json | null
  created_at: string
}
