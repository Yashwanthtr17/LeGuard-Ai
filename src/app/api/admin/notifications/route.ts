import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, execute } from '@/lib/db-pool';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, body: messageBody, type } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: true, message: 'Notification title is required.' }, { status: 400 });
    }

    const profiles = await query<{ id: string }>('SELECT id FROM public.profiles');

    const userIds = profiles.map(p => p.id);

    if (userIds.length === 0) {
      return NextResponse.json({ error: true, message: 'No users to notify.' }, { status: 404 });
    }

    const notificationType = type || 'system';
    const notificationTitle = title.trim();
    const notificationBody = messageBody || null;
    const notificationData = JSON.stringify({ created_by: user.id });

    await execute(
      `INSERT INTO public.notifications (user_id, type, title, body, data, is_read)
       SELECT unnest($1::uuid[]), $2, $3, $4, $5::jsonb, FALSE`,
      [userIds, notificationType, notificationTitle, notificationBody, notificationData]
    );

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${userIds.length} user(s).`,
      users_notified: userIds.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send notification.';
    console.error('[admin/notifications] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
