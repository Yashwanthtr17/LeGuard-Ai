import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne } from '@/lib/db-pool';
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

    const [notifications, countResult] = await Promise.all([
      query('SELECT * FROM public.notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.notifications WHERE user_id = $1', [user.id]),
    ]);

    const total = parseInt(countResult?.count || '0', 10);

    return NextResponse.json({
      notifications: notifications || [],
      total,
      page,
      total_pages: Math.ceil(total / limit),
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
