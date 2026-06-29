import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { title, body: messageBody, type } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: true, message: 'Notification title is required.' }, { status: 400 });
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id');

    if (profileError) throw profileError;

    const userIds = ((profiles || []) as { id: string }[]).map(p => p.id);

    if (userIds.length === 0) {
      return NextResponse.json({ error: true, message: 'No users to notify.' }, { status: 404 });
    }

    const notifications = userIds.map(uid => ({
      user_id: uid,
      type: type || 'system',
      title: title.trim(),
      body: messageBody || null,
      data: { created_by: user.id },
      is_read: false,
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications as never);

    if (insertError) throw insertError;

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
