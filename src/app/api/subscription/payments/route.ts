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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const [payments, countResult] = await Promise.all([
      query('SELECT * FROM public.payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.payments WHERE user_id = $1', [user.id]),
    ]);

    const total = parseInt(countResult?.count || '0', 10);

    return NextResponse.json({
      payments: payments || [],
      total,
      page,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[payments:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch payment history.' }, { status: 500 });
  }
}
