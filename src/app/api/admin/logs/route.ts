import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne } from '@/lib/db-pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20'), 1), 100);
    const offset = (page - 1) * limit;
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('user_id') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIdx = 1;

    if (action) {
      conditions.push(`action = $${paramIdx++}`);
      params.push(action);
    }
    if (userId) {
      conditions.push(`user_id = $${paramIdx++}`);
      params.push(userId);
    }
    if (dateFrom) {
      conditions.push(`created_at >= $${paramIdx++}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`created_at <= $${paramIdx++}`);
      params.push(dateTo);
    }

    const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM public.activity_logs${where}`,
      params
    );
    const total = parseInt(countResult?.count || '0', 10);

    const logs = await query<Record<string, unknown>>(
      `SELECT * FROM public.activity_logs${where} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    const userIds = [...new Set(logs.map(l => l.user_id as string).filter(Boolean))];

    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const profiles = await query<Record<string, unknown>>(
        'SELECT id, email, full_name FROM public.profiles WHERE id = ANY($1::uuid[])',
        [userIds]
      );
      userMap = Object.fromEntries(
        profiles.map(p => [p.id as string, (p.email as string) || (p.full_name as string) || ''])
      );
    }

    const result = logs.map(l => ({
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
