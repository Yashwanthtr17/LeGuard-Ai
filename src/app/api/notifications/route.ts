import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/services/database';

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

    const { data, error, count } = await getSupabaseAdmin()
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      notifications: data || [],
      total: count || 0,
      page,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('[notifications:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch notifications.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { type, title, body: messageBody } = body;

    if (!type || !title) {
      return NextResponse.json({ error: true, message: 'Type and title are required.' }, { status: 400 });
    }

    const notification = await createNotification(user.id, type, title, messageBody || '');

    return NextResponse.json(notification, { status: 201 });
  } catch (err) {
    console.error('[notifications:post] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to create notification.' }, { status: 500 });
  }
}
