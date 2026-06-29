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
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) throw error;

    const userIds = (profiles || []).map(p => (p as Record<string, unknown>).id as string);

    const [docCounts, analysisCounts, subscriptions] = await Promise.all([
      Promise.all(
        userIds.map(uid =>
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', uid)
            .then(r => ({ user_id: uid, count: r.count || 0 }))
        )
      ),
      Promise.all(
        userIds.map(uid =>
          supabase.from('analyses').select('*', { count: 'exact', head: true }).eq('user_id', uid)
            .then(r => ({ user_id: uid, count: r.count || 0 }))
        )
      ),
      Promise.all(
        userIds.map(uid =>
          supabase.from('subscriptions').select('*').eq('user_id', uid).maybeSingle()
            .then(r => ({ user_id: uid, subscription: r.data || null }))
        )
      ),
    ]);

    const docMap = Object.fromEntries(docCounts.map(d => [d.user_id, d.count]));
    const analysisMap = Object.fromEntries(analysisCounts.map(a => [a.user_id, a.count]));
    const subMap = Object.fromEntries(subscriptions.map(s => [s.user_id, s.subscription]));

    const users = (profiles || []).map(p => {
      const profile = p as Record<string, unknown>;
      const sub = subMap[profile.id as string] as Record<string, unknown> | null;
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        last_sign_in: profile.last_sign_in || null,
        document_count: docMap[profile.id as string] || 0,
        analysis_count: analysisMap[profile.id as string] || 0,
        plan: sub?.plan || 'free',
        subscription_status: sub?.status || null,
      };
    });

    const total = count || 0;

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
