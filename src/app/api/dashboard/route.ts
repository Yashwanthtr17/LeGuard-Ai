import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const [
      documentsCount,
      analysesCount,
      reportsCount,
      avgScoreResult,
      highRiskCount,
      scoreResult,
      recentReports,
      recentActivity,
      notificationsResult,
      subscriptionResult,
    ] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('deleted_at', null),
      supabase.from('analyses').select('overall_score').eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('risk_level', 'HIGH'),
      supabase.from('analyses').select('overall_score').eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('reports').select('id, title, overall_score, risk_level, created_at, document_id')
        .eq('user_id', user.id).is('deleted_at', null)
        .order('created_at', { ascending: false }).limit(5),
      supabase.from('activity_logs').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(10),
      supabase.from('notifications').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('is_read', false),
      supabase.from('subscriptions').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1),
    ]);

    const totalDocuments = documentsCount.count || 0;
    const totalAnalyses = analysesCount.count || 0;
    const reportsSaved = reportsCount.count || 0;

    const scores = ((avgScoreResult.data || []) as { overall_score: number }[]).map(r => r.overall_score);
    const avgRiskScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    const highRiskDocs = highRiskCount.count || 0;

    const allScores = ((scoreResult.data || []) as { overall_score: number }[]).map(r => r.overall_score);
    const scoreDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    allScores.forEach(s => {
      const idx = Math.min(Math.max(Math.round(s), 0), 10);
      scoreDistribution[idx]++;
    });

    const documents = await supabase.from('documents').select('file_size').eq('user_id', user.id);
    const storageUsed = ((documents.data || []) as { file_size: number }[]).reduce((sum, d) => sum + (d.file_size || 0), 0);

    const subscription = (subscriptionResult.data || [])[0] || null;

    return NextResponse.json({
      total_documents: totalDocuments,
      total_analyses: totalAnalyses,
      avg_risk_score: avgRiskScore,
      high_risk_docs: highRiskDocs,
      reports_saved: reportsSaved,
      storage_used: storageUsed,
      score_distribution: scoreDistribution,
      recent_reports: recentReports.data || [],
      recent_activity: recentActivity.data || [],
      unread_notifications: notificationsResult.count || 0,
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
