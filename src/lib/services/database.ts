import { getSupabaseAdmin } from '@/lib/supabase';
import type {
  Profile, Document, Analysis, Report, Clause, CountryCompliance,
  RiskItem, TimelineEvent, Obligation, Subscription, Notification, ReportShare, TwoFactor, TwoFactorChallenge,
} from '@/types/supabase';

function admin() {
  return getSupabaseAdmin();
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await admin()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile | null;
}

export async function updateUserProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  const { data: updated, error } = await admin()
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return updated as Profile;
}

// ─── Documents ───────────────────────────────────────────────────────────────

export interface DocumentQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getUserDocuments(
  userId: string,
  options: DocumentQueryOptions = {}
): Promise<{ data: Document[]; total: number }> {
  const { page = 1, limit = 20, status, sortBy = 'created_at', sortOrder = 'desc' } = options;
  const offset = (page - 1) * limit;

  let query = admin()
    .from('documents')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (status) query = query.eq('status', status);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as Document[], total: count || 0 };
}

export async function getDocument(documentId: string): Promise<Document | null> {
  const { data, error } = await admin()
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) throw error;
  return data as Document | null;
}

// ─── Analyses ───────────────────────────────────────────────────────────────

export interface AnalysisWithRelations extends Analysis {
  clauses: Clause[];
  country_compliance: CountryCompliance[];
  risk_items: RiskItem[];
  timeline_events: TimelineEvent[];
  obligations: Obligation[];
}

export async function createAnalysis(data: Partial<Analysis>): Promise<Analysis> {
  const { data: created, error } = await admin()
    .from('analyses')
    .insert(data as never)
    .select('*')
    .single();

  if (error) throw error;
  return created as Analysis;
}

export async function getAnalysis(analysisId: string): Promise<AnalysisWithRelations | null> {
  const { data, error } = await admin()
    .from('analyses')
    .select(`
      *,
      clauses (*),
      country_compliance (*),
      risk_items (*),
      timeline_events (*),
      obligations (*)
    `)
    .eq('id', analysisId)
    .single();

  if (error) throw error;
  return data as AnalysisWithRelations | null;
}

export interface AnalysisQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getUserAnalyses(
  userId: string,
  options: AnalysisQueryOptions = {}
): Promise<{ data: Analysis[]; total: number }> {
  const { page = 1, limit = 20, status, sortBy = 'created_at', sortOrder = 'desc' } = options;
  const offset = (page - 1) * limit;

  let query = admin()
    .from('analyses')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (status) query = query.eq('status', status);
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as Analysis[], total: count || 0 };
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface ReportQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getUserReports(
  userId: string,
  options: ReportQueryOptions = {}
): Promise<{ data: Report[]; total: number }> {
  const { page = 1, limit = 20, search, isFavorite, isArchived, sortBy = 'created_at', sortOrder = 'desc' } = options;
  const offset = (page - 1) * limit;

  let query = admin()
    .from('reports')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (search) query = query.ilike('title', `%${search}%`);
  if (isFavorite !== undefined) query = query.eq('is_favorite', isFavorite);
  if (isArchived !== undefined) query = query.eq('is_archived', isArchived);

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as Report[], total: count || 0 };
}

export async function getReport(reportId: string): Promise<Report | null> {
  const { data, error } = await admin()
    .from('reports')
    .select(`
      *,
      analysis:analysis_id (
        *,
        clauses (*),
        country_compliance (*),
        risk_items (*),
        timeline_events (*),
        obligations (*)
      )
    `)
    .eq('id', reportId)
    .single();

  if (error) throw error;
  return data as Report | null;
}

export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await admin()
    .from('reports')
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq('id', reportId);

  if (error) throw error;
}

export async function favoriteReport(reportId: string, isFavorite: boolean): Promise<void> {
  const { error } = await admin()
    .from('reports')
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() } as never)
    .eq('id', reportId);

  if (error) throw error;
}

export async function updateReportPdfPath(reportId: string, pdfStoragePath: string): Promise<void> {
  const { error } = await admin()
    .from('reports')
    .update({
      pdf_storage_path: pdfStoragePath,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', reportId);

  if (error) throw error;
}

export async function getReportPdfPath(reportId: string): Promise<string | null> {
  const { data, error } = await admin()
    .from('reports')
    .select('pdf_storage_path')
    .eq('id', reportId)
    .single();

  if (error || !data) return null;
  return (data as Record<string, unknown>).pdf_storage_path as string | null;
}

export async function createShareLink(
  reportId: string,
  userId: string,
  expiresAt: string
): Promise<ReportShare> {
  const { data, error } = await admin()
    .from('report_shares')
    .insert({
      report_id: reportId,
      created_by: userId,
      expires_at: expiresAt,
    } as never)
    .select('*')
    .single();

  if (error) throw error;
  return data as ReportShare;
}

export async function getShareLink(token: string): Promise<ReportShare | null> {
  const { data, error } = await admin()
    .from('report_shares')
    .select('*')
    .eq('token', token)
    .single();

  if (error) return null;
  return data as ReportShare;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_analyses: number;
  avg_risk_score: number;
  high_risk_docs: number;
  reports_saved: number;
  recent_reports: Report[];
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [analyses, reports] = await Promise.all([
    admin().from('analyses').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    admin()
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null),
  ]);

  const highRisk = await admin()
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('risk_level', 'HIGH');

  const avgScore = await admin()
    .from('analyses')
    .select('overall_score')
    .eq('user_id', userId)
    .eq('status', 'completed');

  const recent = await admin()
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5);

  const scores = ((avgScore.data || []) as { overall_score: number }[]).map(r => r.overall_score);
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    total_analyses: analyses.count || 0,
    avg_risk_score: avg,
    high_risk_docs: highRisk.count || 0,
    reports_saved: reports.count || 0,
    recent_reports: (recent.data || []) as Report[],
  };
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_documents: number;
  total_analyses: number;
  total_reports: number;
  active_subscriptions: number;
  total_revenue: number;
  today_users: number;
  today_analyses: number;
  today_uploads: number;
  storage_used: number;
  avg_risk_score: number;
  open_tickets: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await admin().rpc('get_admin_stats');
  if (error) throw error;
  return data as unknown as AdminStats;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  data?: Record<string, unknown>
): Promise<Notification> {
  const { data: notification, error } = await admin()
    .from('notifications')
    .insert({ user_id: userId, type, title, body: body || null, data: data || null } as never)
    .select('*')
    .single();

  if (error) throw error;
  return notification as Notification;
}

export async function getUserNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  const { data, error } = await admin()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Notification[];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await admin()
    .from('notifications')
    .update({ is_read: true } as never)
    .eq('id', notificationId);

  if (error) throw error;
}

// ─── Activity Logging ────────────────────────────────────────────────────────

export async function logActivity(
  userId: string,
  action: string,
  resource?: string,
  resourceId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { error } = await admin()
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      resource: resource || null,
      resource_id: resourceId || null,
      details: details || null,
    } as never);

  if (error) throw error;
}

// ─── AI Usage Logging ────────────────────────────────────────────────────────

export async function logAiUsage(
  userId: string,
  provider: string,
  model: string,
  tokensIn: number,
  tokensOut: number,
  durationMs: number,
  success: boolean,
  error?: string
): Promise<void> {
  const { error: err } = await admin()
    .from('ai_usage_logs')
    .insert({
      user_id: userId,
      provider,
      model,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      duration_ms: durationMs,
      success,
      error_message: error || null,
    } as never);

  if (err) throw err;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await admin()
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Subscription[];
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await admin()
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Subscription | null;
}

// ─── 2FA ─────────────────────────────────────────────────────────────────────

export async function getTwoFactorStatus(userId: string): Promise<Pick<TwoFactor, 'enabled' | 'created_at'> | null> {
  const { data, error } = await admin()
    .from('two_factor')
    .select('enabled, created_at')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Pick<TwoFactor, 'enabled' | 'created_at'> | null;
}

export async function getTwoFactorSecret(userId: string): Promise<string | null> {
  const { data, error } = await admin()
    .from('two_factor')
    .select('secret')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return (data as { secret: string | null } | null)?.secret ?? null;
}

export async function upsertTwoFactorSecret(
  userId: string,
  secret: string
): Promise<void> {
  const existing = await admin()
    .from('two_factor')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing.data?.id) {
    const { error } = await admin()
      .from('two_factor')
      .update({ secret, enabled: false } as never)
      .eq('user_id', userId);

    if (error) throw error;
  } else {
    const { error } = await admin()
      .from('two_factor')
      .insert({ user_id: userId, secret, enabled: false } as never);

    if (error) throw error;
  }
}

export async function enableTwoFactor(
  userId: string,
  backupCodes: string[]
): Promise<void> {
  const { error } = await admin()
    .from('two_factor')
    .update({
      enabled: true,
      backup_codes: backupCodes,
    } as never)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function disableTwoFactor(userId: string): Promise<void> {
  const { error } = await admin()
    .from('two_factor')
    .update({
      secret: null,
      enabled: false,
      backup_codes: null,
    } as never)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function clearTwoFactorSecret(userId: string): Promise<void> {
  const { error } = await admin()
    .from('two_factor')
    .update({ secret: null } as never)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function createTwoFactorChallenge(
  userId: string,
  challengeToken: string,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const { error } = await admin()
    .from('two_factor_challenges')
    .insert({
      user_id: userId,
      challenge_token: challengeToken,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    } as never);

  if (error) throw error;
}

export async function getTwoFactorChallenge(
  challengeToken: string
): Promise<TwoFactorChallenge | null> {
  const { data, error } = await admin()
    .from('two_factor_challenges')
    .select('*')
    .eq('challenge_token', challengeToken)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as TwoFactorChallenge | null;
}

export async function markChallengeUsed(challengeToken: string): Promise<void> {
  const { error } = await admin()
    .from('two_factor_challenges')
    .update({ used: true } as never)
    .eq('challenge_token', challengeToken);

  if (error) throw error;
}

export async function getBackupCodes(userId: string): Promise<string[] | null> {
  const { data, error } = await admin()
    .from('two_factor')
    .select('backup_codes')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return (data as { backup_codes: string[] | null } | null)?.backup_codes ?? null;
}

export async function updateBackupCodes(
  userId: string,
  backupCodes: string[]
): Promise<void> {
  const { error } = await admin()
    .from('two_factor')
    .update({ backup_codes: backupCodes } as never)
    .eq('user_id', userId);

  if (error) throw error;
}
