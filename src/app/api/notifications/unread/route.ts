import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { count, error } = await getSupabaseAdmin()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    console.error('[notifications:unread] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch unread count.' }, { status: 500 });
  }
}
