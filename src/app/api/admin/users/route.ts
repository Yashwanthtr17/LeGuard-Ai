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
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let profiles: Record<string, unknown>[];
    let total: number;

    if (search) {
      const pattern = `%${search}%`;
      const countResult = await queryOne<{ count: string }>(
        'SELECT COUNT(*) as count FROM public.profiles WHERE full_name ILIKE $1 OR email ILIKE $1',
        [pattern]
      );
      total = parseInt(countResult?.count || '0', 10);
      profiles = await query<Record<string, unknown>>(
        'SELECT * FROM public.profiles WHERE full_name ILIKE $1 OR email ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
        [pattern, limit, offset]
      );
    } else {
      const countResult = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.profiles');
      total = parseInt(countResult?.count || '0', 10);
      profiles = await query<Record<string, unknown>>(
        'SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
    }

    const userIds = profiles.map(p => p.id as string);

    const [docCounts, analysisCounts, subscriptions] = await Promise.all([
      userIds.length > 0
        ? query<{ user_id: string; count: number }>(
            'SELECT user_id, COUNT(*)::int as count FROM public.documents WHERE user_id = ANY($1::uuid[]) GROUP BY user_id',
            [userIds]
          )
        : Promise.resolve([] as { user_id: string; count: number }[]),
      userIds.length > 0
        ? query<{ user_id: string; count: number }>(
            'SELECT user_id, COUNT(*)::int as count FROM public.analyses WHERE user_id = ANY($1::uuid[]) GROUP BY user_id',
            [userIds]
          )
        : Promise.resolve([] as { user_id: string; count: number }[]),
      userIds.length > 0
        ? query<Record<string, unknown>>(
            'SELECT * FROM public.subscriptions WHERE user_id = ANY($1::uuid[])',
            [userIds]
          )
        : Promise.resolve([] as Record<string, unknown>[]),
    ]);

    const docMap = Object.fromEntries(docCounts.map(d => [d.user_id, d.count]));
    const analysisMap = Object.fromEntries(analysisCounts.map(a => [a.user_id, a.count]));
    const subMap = Object.fromEntries(subscriptions.map(s => [s.user_id as string, s]));

    const users = profiles.map(p => {
      const sub = subMap[p.id as string] as Record<string, unknown> | null;
      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        created_at: p.created_at,
        last_sign_in: p.last_sign_in || null,
        document_count: docMap[p.id as string] || 0,
        analysis_count: analysisMap[p.id as string] || 0,
        plan: sub?.plan || 'free',
        subscription_status: sub?.status || null,
      };
    });

    return NextResponse.json({
      users,
      total,
      page,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users.';
    console.error('[admin/users] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
