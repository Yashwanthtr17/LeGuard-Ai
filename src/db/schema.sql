-- LeGuard-AI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  default_country TEXT DEFAULT 'United States',
  risk_sensitivity TEXT DEFAULT 'standard' CHECK (risk_sensitivity IN ('standard', 'strict', 'lenient')),
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles USING hash(id);

-- ============================================================
-- SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON public.sessions(user_id);

-- ============================================================
-- TWO-FACTOR AUTH
-- ============================================================
CREATE TABLE IF NOT EXISTS public.two_factor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  secret TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.two_factor_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_token TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_2fa_challenges_token ON public.two_factor_challenges(challenge_token);
CREATE INDEX IF NOT EXISTS idx_2fa_challenges_user ON public.two_factor_challenges(user_id);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'scanning', 'ocr', 'analyzing', 'completed', 'failed')),
  page_count INTEGER DEFAULT 0,
  text_content TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_user ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_created ON public.documents(created_at DESC);

-- ============================================================
-- ANALYSIS RESULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  ai_provider TEXT,
  model_used TEXT,
  confidence_score REAL DEFAULT 0,
  overall_score REAL DEFAULT 0,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'NONE')),
  verdict TEXT,
  executive_summary TEXT,
  plain_english_summary TEXT,
  country_applied TEXT,
  document_type_detected TEXT,
  governing_law TEXT,
  arbitration TEXT,
  jurisdiction TEXT,
  full_result JSONB,
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analyses_user ON public.analyses(user_id);
CREATE INDEX idx_analyses_document ON public.analyses(document_id);
CREATE INDEX idx_analyses_score ON public.analyses(overall_score);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pdf_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_user ON public.reports(user_id);
CREATE INDEX idx_reports_favorite ON public.reports(user_id, is_favorite);
CREATE INDEX idx_reports_deleted ON public.reports(deleted_at);
CREATE INDEX idx_reports_created ON public.reports(created_at DESC);

-- ============================================================
-- CLAUSES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clauses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('regular', 'hidden', 'missing', 'dangerous', 'unfair')),
  risk_score REAL NOT NULL DEFAULT 5,
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'NONE')),
  plain_english TEXT,
  why_it_matters TEXT,
  recommendation TEXT,
  location TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_clauses_analysis ON public.clauses(analysis_id);
CREATE INDEX idx_clauses_type ON public.clauses(type);

-- ============================================================
-- COUNTRY COMPLIANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.country_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  law TEXT NOT NULL,
  status TEXT CHECK (status IN ('COMPLIANT', 'NON_COMPLIANT', 'FLAGGED')),
  note TEXT
);

CREATE INDEX idx_compliance_analysis ON public.country_compliance(analysis_id);

-- ============================================================
-- RISK ITEMS (financial, legal, privacy, liability, penalties, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.risk_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'financial_risk', 'legal_risk', 'privacy_risk', 'liability_risk',
    'penalty', 'red_flag', 'positive_aspect',
    'termination_condition', 'renewal_condition',
    'ai_suggestion', 'negotiation_tip'
  )),
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_risk_items_analysis ON public.risk_items(analysis_id);
CREATE INDEX idx_risk_items_category ON public.risk_items(category);

-- ============================================================
-- TIMELINE EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  event_date TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_timeline_analysis ON public.timeline_events(analysis_id);

-- ============================================================
-- OBLIGATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  party TEXT NOT NULL,
  obligation TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX idx_obligations_analysis ON public.obligations(analysis_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'single', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_provider TEXT,
  payment_provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_provider TEXT,
  payment_provider_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'report_ready', 'upload_complete', 'upload_failed',
    'analysis_complete', 'analysis_failed',
    'subscription_expiring', 'payment_success', 'payment_failed',
    'welcome', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_action ON public.activity_logs(action);
CREATE INDEX idx_activity_created ON public.activity_logs(created_at DESC);

-- ============================================================
-- AI USAGE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  document_size INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_created ON public.ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_provider ON public.ai_usage_logs(provider);

-- ============================================================
-- API USAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  endpoint TEXT NOT NULL,
  method TEXT,
  status_code INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_created ON public.api_usage(created_at DESC);

-- ============================================================
-- COUNTRY LAWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.country_laws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'consumer', 'employment', 'rental', 'property',
    'business', 'privacy', 'contract'
  )),
  law_name TEXT NOT NULL,
  description TEXT,
  risk_rules JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country, category, law_name)
);

CREATE INDEX idx_country_laws_country ON public.country_laws(country);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_tickets_status ON public.support_tickets(status);

-- ============================================================
-- FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, default_country, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'default_country', 'United States'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );

  INSERT INTO public.subscriptions (user_id, plan, status, current_period_start, current_period_end)
  VALUES (NEW.id, 'free', 'active', NOW(), NOW() + INTERVAL '100 years');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Documents: users can CRUD their own
CREATE POLICY "Users can CRUD own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id);

-- Analyses: users can read their own
CREATE POLICY "Users can read own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reports: users can CRUD their own
CREATE POLICY "Users can CRUD own reports"
  ON public.reports FOR ALL
  USING (auth.uid() = user_id);

-- Clauses: read via analysis ownership
CREATE POLICY "Users can read clauses via analysis"
  ON public.clauses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.analyses WHERE id = analysis_id AND user_id = auth.uid()
  ));

-- Country compliance: read via analysis
CREATE POLICY "Users can read compliance via analysis"
  ON public.country_compliance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.analyses WHERE id = analysis_id AND user_id = auth.uid()
  ));

-- Risk items: read via analysis
CREATE POLICY "Users can read risk items via analysis"
  ON public.risk_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.analyses WHERE id = analysis_id AND user_id = auth.uid()
  ));

-- Timeline: read via analysis
CREATE POLICY "Users can read timeline via analysis"
  ON public.timeline_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.analyses WHERE id = analysis_id AND user_id = auth.uid()
  ));

-- Obligations: read via analysis
CREATE POLICY "Users can read obligations via analysis"
  ON public.obligations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.analyses WHERE id = analysis_id AND user_id = auth.uid()
  ));

-- Subscriptions: users can read own
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Payments: users can read own
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Notifications: users can CRUD own
CREATE POLICY "Users can CRUD own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id);

-- Activity logs: users can read own
CREATE POLICY "Users can read own activity"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Sessions: users can CRUD own
CREATE POLICY "Users can manage own sessions"
  ON public.sessions FOR ALL
  USING (auth.uid() = user_id);

-- 2FA: users can manage own
CREATE POLICY "Users can manage own 2FA"
  ON public.two_factor FOR ALL
  USING (auth.uid() = user_id);

-- 2FA challenges: service role only (created/consumed by API)
CREATE POLICY "Service role manages challenges"
  ON public.two_factor_challenges FOR ALL
  USING (auth.role() = 'service_role');

-- Support tickets: users can CRUD own
CREATE POLICY "Users can manage own tickets"
  ON public.support_tickets FOR ALL
  USING (auth.uid() = user_id);

-- Feedback: users can insert own
CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- ADMIN FUNCTIONS (service_role bypasses RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT JSONB_BUILD_OBJECT(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_documents', (SELECT COUNT(*) FROM public.documents),
    'total_analyses', (SELECT COUNT(*) FROM public.analyses),
    'total_reports', (SELECT COUNT(*) FROM public.reports),
    'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
    'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE status = 'completed'),
    'today_users', (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE),
    'today_analyses', (SELECT COUNT(*) FROM public.analyses WHERE created_at >= CURRENT_DATE),
    'today_uploads', (SELECT COUNT(*) FROM public.documents WHERE created_at >= CURRENT_DATE),
    'storage_used', (SELECT COALESCE(SUM(file_size), 0) FROM public.documents),
    'avg_risk_score', (SELECT COALESCE(AVG(overall_score), 0) FROM public.analyses WHERE status = 'completed'),
    'open_tickets', (SELECT COUNT(*) FROM public.support_tickets WHERE status IN ('open', 'in_progress'))
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- MIGRATION: Add PDF generation fields to reports
-- ============================================================
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT NULL CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed', NULL)),
  ADD COLUMN IF NOT EXISTS generation_error TEXT,
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_reports_generation ON public.reports(generation_status);

-- ============================================================
-- REPORT SHARES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.report_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_shares_token ON public.report_shares(token);
CREATE INDEX IF NOT EXISTS idx_report_shares_report ON public.report_shares(report_id);
