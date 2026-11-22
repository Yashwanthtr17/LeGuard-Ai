import { query, queryOne, execute } from '@/lib/db-pool';
import type {
  Profile, Document, Analysis, Report, Clause, CountryCompliance,
  RiskItem, TimelineEvent, Obligation, Subscription, Notification, ReportShare, TwoFactor, TwoFactorChallenge,
} from '@/types/supabase';

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<Profile | null> {
  return queryOne<Profile>(
    'SELECT * FROM public.profiles WHERE id = $1',
    [userId]
  );
}

export async function updateUserProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
  const keys = Object.keys(data).filter(k => k !== 'id');
  const sets = keys.map((k, i) => `${k} = $${i + 2}`);
  const values = keys.map(k => (data as Record<string, unknown>)[k]);
  const rows = await query<Profile>(
    `UPDATE public.profiles SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [userId, ...values]
  );
  return rows[0];
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

  const conditions = ['user_id = $1'];
  const params: unknown[] = [userId];
  let paramIdx = 2;

  if (status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(status);
  }

  const where = conditions.join(' AND ');
  const countRows = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM public.documents WHERE ${where}`,
    params
  );
  const total = parseInt(countRows?.count || '0', 10);

  const data = await query<Document>(
    `SELECT * FROM public.documents WHERE ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...params, limit, offset]
  );

  return { data, total };
}

export async function getDocument(documentId: string): Promise<Document | null> {
  return queryOne<Document>('SELECT * FROM public.documents WHERE id = $1', [documentId]);
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
  const keys = Object.keys(data).filter(k => k !== 'id');
  const values = keys.map(k => (data as Record<string, unknown>)[k]);
  const placeholders = keys.map((_, i) => `$${i + 1}`);
  const rows = await query<Analysis>(
    `INSERT INTO public.analyses (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values
  );
  return rows[0];
}

export async function getAnalysis(analysisId: string): Promise<AnalysisWithRelations | null> {
  const analysis = await queryOne<Analysis>(
    'SELECT * FROM public.analyses WHERE id = $1',
    [analysisId]
  );
  if (!analysis) return null;

  const [clauses, country_compliance, risk_items, timeline_events, obligations] = await Promise.all([
    query<Clause>('SELECT * FROM public.clauses WHERE analysis_id = $1 ORDER BY sort_order', [analysisId]),
    query<CountryCompliance>('SELECT * FROM public.country_compliance WHERE analysis_id = $1', [analysisId]),
    query<RiskItem>('SELECT * FROM public.risk_items WHERE analysis_id = $1 ORDER BY sort_order', [analysisId]),
    query<TimelineEvent>('SELECT * FROM public.timeline_events WHERE analysis_id = $1 ORDER BY sort_order', [analysisId]),
    query<Obligation>('SELECT * FROM public.obligations WHERE analysis_id = $1 ORDER BY sort_order', [analysisId]),
  ]);

  return { ...analysis, clauses, country_compliance, risk_items, timeline_events, obligations };
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

  const conditions = ['user_id = $1'];
  const params: unknown[] = [userId];
  let paramIdx = 2;

  if (status) {
    conditions.push(`status = $${paramIdx++}`);
    params.push(status);
  }

  const where = conditions.join(' AND ');
  const countRows = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM public.analyses WHERE ${where}`,
    params
  );
  const total = parseInt(countRows?.count || '0', 10);

  const data = await query<Analysis>(
    `SELECT * FROM public.analyses WHERE ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...params, limit, offset]
  );

  return { data, total };
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

  const conditions = ['user_id = $1', 'deleted_at IS NULL'];
  const params: unknown[] = [userId];
  let paramIdx = 2;

  if (search) {
    conditions.push(`title ILIKE $${paramIdx++}`);
    params.push(`%${search}%`);
  }
  if (isFavorite !== undefined) {
    conditions.push(`is_favorite = $${paramIdx++}`);
    params.push(isFavorite);
  }
  if (isArchived !== undefined) {
    conditions.push(`is_archived = $${paramIdx++}`);
    params.push(isArchived);
  }

  const where = conditions.join(' AND ');
  const countRows = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM public.reports WHERE ${where}`,
    params
  );
  const total = parseInt(countRows?.count || '0', 10);

  const data = await query<Report>(
    `SELECT * FROM public.reports WHERE ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...params, limit, offset]
  );

  return { data, total };
}

export async function getReport(reportId: string): Promise<Report | null> {
  const report = await queryOne<Report>('SELECT * FROM public.reports WHERE id = $1', [reportId]);
  if (!report) return null;

  const analysis = await getAnalysis(report.analysis_id);
  return { ...report, analysis } as unknown as Report;
}

export async function deleteReport(reportId: string): Promise<void> {
  await execute(
    'UPDATE public.reports SET deleted_at = $1, updated_at = $1 WHERE id = $2',
    [new Date().toISOString(), reportId]
  );
}

export async function favoriteReport(reportId: string, isFavorite: boolean): Promise<void> {
  await execute(
    'UPDATE public.reports SET is_favorite = $1, updated_at = NOW() WHERE id = $2',
    [isFavorite, reportId]
  );
}

export async function updateReportPdfPath(reportId: string, pdfStoragePath: string): Promise<void> {
  await execute(
    'UPDATE public.reports SET pdf_storage_path = $1, updated_at = NOW() WHERE id = $2',
    [pdfStoragePath, reportId]
  );
}

export async function getReportPdfPath(reportId: string): Promise<string | null> {
  const row = await queryOne<{ pdf_storage_path: string | null }>(
    'SELECT pdf_storage_path FROM public.reports WHERE id = $1',
    [reportId]
  );
  return row?.pdf_storage_path ?? null;
}

export async function createShareLink(
  reportId: string,
  userId: string,
  expiresAt: string
): Promise<ReportShare> {
  const rows = await query<ReportShare>(
    `INSERT INTO public.report_shares (report_id, created_by, expires_at)
     VALUES ($1, $2, $3) RETURNING *`,
    [reportId, userId, expiresAt]
  );
  return rows[0];
}

export async function getShareLink(token: string): Promise<ReportShare | null> {
  return queryOne<ReportShare>('SELECT * FROM public.report_shares WHERE token = $1', [token]);
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
  const [analyses, highRisk, avgScore, reports, recent] = await Promise.all([
    queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.analyses WHERE user_id = $1', [userId]),
    queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.analyses WHERE user_id = $1 AND risk_level = $2', [userId, 'HIGH']),
    query<{ overall_score: number }>('SELECT overall_score FROM public.analyses WHERE user_id = $1 AND status = $2', [userId, 'completed']),
    queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.reports WHERE user_id = $1 AND deleted_at IS NULL', [userId]),
    query<Report>('SELECT * FROM public.reports WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5', [userId]),
  ]);

  const scores = avgScore.map(r => r.overall_score);
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    total_analyses: parseInt(analyses?.count || '0', 10),
    avg_risk_score: avg,
    high_risk_docs: parseInt(highRisk?.count || '0', 10),
    reports_saved: parseInt(reports?.count || '0', 10),
    recent_reports: recent,
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
  const row = await queryOne<{ get_admin_stats: string }>(
    'SELECT public.get_admin_stats() as get_admin_stats'
  );
  if (!row?.get_admin_stats) {
    throw new Error('Failed to get admin stats');
  }
  return JSON.parse(row.get_admin_stats) as AdminStats;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  data?: Record<string, unknown>
): Promise<Notification> {
  const rows = await query<Notification>(
    `INSERT INTO public.notifications (user_id, type, title, body, data)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, title, body || null, data || null]
  );
  return rows[0];
}

export async function getUserNotifications(
  userId: string,
  limit = 20
): Promise<Notification[]> {
  return query<Notification>(
    'SELECT * FROM public.notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await execute(
    'UPDATE public.notifications SET is_read = TRUE WHERE id = $1',
    [notificationId]
  );
}

// ─── Activity Logging ────────────────────────────────────────────────────────

export async function logActivity(
  userId: string,
  action: string,
  resource?: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await execute(
    `INSERT INTO public.activity_logs
       (user_id, action, resource, resource_id, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      action,
      resource || null,
      resourceId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || null,
      userAgent || null,
    ]
  );
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
  await execute(
    `INSERT INTO public.ai_usage_logs (user_id, provider, model, tokens_in, tokens_out, duration_ms, success, error_message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, provider, model, tokensIn, tokensOut, durationMs, success, error || null]
  );
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export async function getSubscriptions(): Promise<Subscription[]> {
  return query<Subscription>(
    'SELECT * FROM public.subscriptions ORDER BY created_at DESC'
  );
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  return queryOne<Subscription>(
    'SELECT * FROM public.subscriptions WHERE user_id = $1',
    [userId]
  );
}

// ─── 2FA ─────────────────────────────────────────────────────────────────────

export async function getTwoFactorStatus(userId: string): Promise<Pick<TwoFactor, 'enabled' | 'created_at'> | null> {
  return queryOne<Pick<TwoFactor, 'enabled' | 'created_at'>>(
    'SELECT enabled, created_at FROM public.two_factor WHERE user_id = $1',
    [userId]
  );
}

export async function getTwoFactorSecret(userId: string): Promise<string | null> {
  const row = await queryOne<{ secret: string | null }>(
    'SELECT secret FROM public.two_factor WHERE user_id = $1',
    [userId]
  );
  return row?.secret ?? null;
}

export async function upsertTwoFactorSecret(userId: string, secret: string): Promise<void> {
  await execute(
    `INSERT INTO public.two_factor (user_id, secret, enabled)
     VALUES ($1, $2, FALSE)
     ON CONFLICT (user_id)
     DO UPDATE SET secret = $2, enabled = FALSE`,
    [userId, secret]
  );
}

export async function enableTwoFactor(userId: string, backupCodes: string[]): Promise<void> {
  await execute(
    'UPDATE public.two_factor SET enabled = TRUE, backup_codes = $1 WHERE user_id = $2',
    [backupCodes, userId]
  );
}

export async function disableTwoFactor(userId: string): Promise<void> {
  await execute(
    'UPDATE public.two_factor SET secret = NULL, enabled = FALSE, backup_codes = NULL WHERE user_id = $1',
    [userId]
  );
}

export async function clearTwoFactorSecret(userId: string): Promise<void> {
  await execute(
    'UPDATE public.two_factor SET secret = NULL WHERE user_id = $1',
    [userId]
  );
}

export async function createTwoFactorChallenge(
  userId: string,
  challengeToken: string,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await execute(
    `INSERT INTO public.two_factor_challenges (user_id, challenge_token, access_token, refresh_token, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '5 minutes')`,
    [userId, challengeToken, accessToken, refreshToken]
  );
}

export async function getTwoFactorChallenge(challengeToken: string): Promise<TwoFactorChallenge | null> {
  return queryOne<TwoFactorChallenge>(
    'SELECT * FROM public.two_factor_challenges WHERE challenge_token = $1',
    [challengeToken]
  );
}

export async function markChallengeUsed(challengeToken: string): Promise<void> {
  await execute(
    'UPDATE public.two_factor_challenges SET used = TRUE WHERE challenge_token = $1',
    [challengeToken]
  );
}

export async function getBackupCodes(userId: string): Promise<string[] | null> {
  const row = await queryOne<{ backup_codes: string[] | null }>(
    'SELECT backup_codes FROM public.two_factor WHERE user_id = $1',
    [userId]
  );
  return row?.backup_codes ?? null;
}

export async function updateBackupCodes(userId: string, backupCodes: string[]): Promise<void> {
  await execute(
    'UPDATE public.two_factor SET backup_codes = $1 WHERE user_id = $2',
    [backupCodes, userId]
  );
}
