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
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('user_id') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' });

    if (action) query = query.eq('action', action);
    if (userId) query = query.eq('user_id', userId);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) throw error;

    const userIds = [...new Set(((logs || []) as Record<string, unknown>[])
      .map(l => l.user_id as string)
      .filter(Boolean))];

    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      userMap = Object.fromEntries(
        ((profiles || []) as Record<string, unknown>[]).map(p => [
          p.id as string,
          (p.email as string) || (p.full_name as string) || '',
        ])
      );
    }

    const result = ((logs || []) as Record<string, unknown>[]).map(l => ({
      id: l.id,
      user_id: l.user_id,
      user_email: l.user_id ? (userMap[l.user_id as string] || null) : null,
      action: l.action,
      resource: l.resource,
      resource_id: l.resource_id,
      details: l.details,
      ip_address: l.ip_address,
      user_agent: l.user_agent,
      created_at: l.created_at,
    }));

    const total = count || 0;

    return NextResponse.json({
      logs: result,
      total,
      page,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch activity logs.';
    console.error('[admin/logs] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
