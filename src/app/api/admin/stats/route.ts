import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().slice(0, 10);

    const [
      usersCount,
      documentsCount,
      analysesCount,
      reportsCount,
      subscriptionsResult,
      paymentsResult,
      todayUsers,
      todayAnalyses,
      todayUploads,
      avgScoreResult,
      ticketsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('analyses').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('subscriptions').select('*').eq('status', 'active'),
      supabase.from('payments').select('amount').eq('status', 'succeeded'),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .gte('created_at', today),
      supabase.from('analyses').select('*', { count: 'exact', head: true })
        .gte('created_at', today),
      supabase.from('documents').select('*', { count: 'exact', head: true })
        .gte('created_at', today),
      supabase.from('analyses').select('overall_score').eq('status', 'completed'),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true })
        .neq('status', 'closed'),
    ]);

    const scores = ((avgScoreResult.data || []) as { overall_score: number }[]).map(r => r.overall_score);
    const avgRiskScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    const docs = await supabase.from('documents').select('file_size');
    const storageUsed = ((docs.data || []) as { file_size: number }[]).reduce((sum, d) => sum + (d.file_size || 0), 0);

    const totalRevenue = ((paymentsResult.data || []) as { amount: number }[])
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return NextResponse.json({
      total_users: usersCount.count || 0,
      total_documents: documentsCount.count || 0,
      total_analyses: analysesCount.count || 0,
      total_reports: reportsCount.count || 0,
      active_subscriptions: subscriptionsResult.count || 0,
      total_revenue: totalRevenue,
      today_users: todayUsers.count || 0,
      today_analyses: todayAnalyses.count || 0,
      today_uploads: todayUploads.count || 0,
      storage_used: storageUsed,
      avg_risk_score: avgRiskScore,
      open_tickets: ticketsResult.count || 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin stats.';
    console.error('[admin/stats] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
