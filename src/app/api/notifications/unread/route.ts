import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne } from '@/lib/db-pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.notifications WHERE user_id = $1 AND is_read = FALSE', [user.id]);

    return NextResponse.json({ count: parseInt(result?.count || '0', 10) });
  } catch (err) {
    console.error('[notifications:unread] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch unread count.' }, { status: 500 });
  }
}
