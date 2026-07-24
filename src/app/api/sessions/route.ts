import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne, execute } from '@/lib/db-pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const sessions = await query('SELECT * FROM public.sessions WHERE user_id = $1 ORDER BY last_active_at DESC', [user.id]);

    return NextResponse.json({ sessions: sessions || [] });
  } catch (err) {
    console.error('[sessions:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch sessions.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return NextResponse.json({ error: true, message: 'Session ID is required.' }, { status: 400 });
    }

    const session = await queryOne('SELECT * FROM public.sessions WHERE id = $1 AND user_id = $2', [session_id, user.id]);

    if (!session) {
      return NextResponse.json({ error: true, message: 'Session not found.' }, { status: 404 });
    }

    await execute('DELETE FROM public.sessions WHERE id = $1', [session_id]);

    return NextResponse.json({ success: true, message: 'Session terminated.' });
  } catch (err) {
    console.error('[sessions:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to terminate session.' }, { status: 500 });
  }
}
