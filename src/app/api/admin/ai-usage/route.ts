import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);
    const offset = (page - 1) * limit;

    const { data: logs, error, count } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const allLogs = (logs || []) as Record<string, unknown>[];
    const totalTokens = allLogs.reduce((sum, l) => sum + ((l.tokens_in as number) || 0) + ((l.tokens_out as number) || 0), 0);
    const totalCalls = allLogs.length;
    const avgDuration = totalCalls > 0
      ? Math.round(allLogs.reduce((sum, l) => sum + ((l.duration_ms as number) || 0), 0) / totalCalls)
      : 0;
    const successCount = allLogs.filter(l => l.success === true).length;
    const successRate = totalCalls > 0 ? Math.round((successCount / totalCalls) * 100) : 0;

    const providerMap: Record<string, { calls: number; tokens: number; duration: number; success: number }> = {};
    allLogs.forEach(l => {
      const provider = (l.provider as string) || 'unknown';
      const model = (l.model as string) || 'unknown';
      const key = `${provider}/${model}`;
      if (!providerMap[key]) {
        providerMap[key] = { calls: 0, tokens: 0, duration: 0, success: 0 };
      }
      providerMap[key].calls++;
      providerMap[key].tokens += ((l.tokens_in as number) || 0) + ((l.tokens_out as number) || 0);
      providerMap[key].duration += (l.duration_ms as number) || 0;
      if (l.success === true) providerMap[key].success++;
    });

    const byProvider = Object.entries(providerMap).map(([key, val]) => {
      const [provider, model] = key.split('/');
      return {
        provider,
        model,
        calls: val.calls,
        tokens: val.tokens,
        avg_duration_ms: val.calls > 0 ? Math.round(val.duration / val.calls) : 0,
        success_rate: val.calls > 0 ? Math.round((val.success / val.calls) * 100) : 0,
      };
    });

    return NextResponse.json({
      usage: allLogs.map(l => ({
        id: l.id,
        user_id: l.user_id,
        provider: l.provider,
        model: l.model,
        tokens_in: l.tokens_in,
        tokens_out: l.tokens_out,
        duration_ms: l.duration_ms,
        success: l.success,
        error_message: l.error_message,
        created_at: l.created_at,
      })),
      total: count || 0,
      page,
      total_pages: Math.ceil((count || 0) / limit),
      summary: {
        total_tokens: totalTokens,
        total_calls: totalCalls,
        avg_duration_ms: avgDuration,
        success_rate: successRate,
      },
      by_provider: byProvider,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch AI usage.';
    console.error('[admin/ai-usage] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
