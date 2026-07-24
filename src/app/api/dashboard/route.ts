import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne } from '@/lib/db-pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const [
      documentsCount,
      analysesCount,
      reportsCount,
      avgScoreRows,
      highRiskCount,
      scoreRows,
      recentReports,
      recentActivity,
      unreadCount,
      subscriptionRows,
      documents,
    ] = await Promise.all([
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.documents WHERE user_id = $1', [user.id]),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.analyses WHERE user_id = $1', [user.id]),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.reports WHERE user_id = $1 AND deleted_at IS NULL', [user.id]),
      query<{ overall_score: number }>('SELECT overall_score FROM public.analyses WHERE user_id = $1 AND status = $2', [user.id, 'completed']),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.analyses WHERE user_id = $1 AND risk_level = $2', [user.id, 'HIGH']),
      query<{ overall_score: number }>('SELECT overall_score FROM public.analyses WHERE user_id = $1 AND status = $2', [user.id, 'completed']),
      query('SELECT id, title, overall_score, risk_level, created_at, document_id FROM public.reports WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5', [user.id]),
      query('SELECT * FROM public.activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [user.id]),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.notifications WHERE user_id = $1 AND is_read = FALSE', [user.id]),
      query('SELECT * FROM public.subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [user.id]),
      query<{ file_size: number }>('SELECT file_size FROM public.documents WHERE user_id = $1', [user.id]),
    ]);

    const totalDocuments = parseInt(documentsCount?.count || '0', 10);
    const totalAnalyses = parseInt(analysesCount?.count || '0', 10);
    const reportsSaved = parseInt(reportsCount?.count || '0', 10);

    const scores = avgScoreRows.map(r => r.overall_score);
    const avgRiskScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    const highRiskDocs = parseInt(highRiskCount?.count || '0', 10);

    const allScores = scoreRows.map(r => r.overall_score);
    const scoreDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    allScores.forEach(s => {
      const idx = Math.min(Math.max(Math.round(s), 0), 10);
      scoreDistribution[idx]++;
    });

    const storageUsed = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);

    const subscription = subscriptionRows[0] || null;

    return NextResponse.json({
      total_documents: totalDocuments,
      total_analyses: totalAnalyses,
      avg_risk_score: avgRiskScore,
      high_risk_docs: highRiskDocs,
      reports_saved: reportsSaved,
      storage_used: storageUsed,
      score_distribution: scoreDistribution,
      recent_reports: recentReports || [],
      recent_activity: recentActivity || [],
      unread_notifications: parseInt(unreadCount?.count || '0', 10),
      subscription: subscription ? {
        plan: (subscription as Record<string, unknown>).plan,
        status: (subscription as Record<string, unknown>).status,
        current_period_end: (subscription as Record<string, unknown>).current_period_end,
      } : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dashboard data.';
    console.error('[dashboard] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
