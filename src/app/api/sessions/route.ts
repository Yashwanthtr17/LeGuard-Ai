import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('last_active_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ sessions: data || [] });
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

    const { data: session, error: findError } = await getSupabaseAdmin()
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (findError || !session) {
      return NextResponse.json({ error: true, message: 'Session not found.' }, { status: 404 });
    }

    const { error } = await getSupabaseAdmin()
      .from('sessions')
      .delete()
      .eq('id', session_id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Session terminated.' });
  } catch (err) {
    console.error('[sessions:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to terminate session.' }, { status: 500 });
  }
}
