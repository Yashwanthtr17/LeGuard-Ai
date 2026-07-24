import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne, execute } from '@/lib/db-pool';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const notification = await queryOne('SELECT * FROM public.notifications WHERE id = $1 AND user_id = $2', [id, user.id]);

    if (!notification) {
      return NextResponse.json({ error: true, message: 'Notification not found.' }, { status: 404 });
    }

    await execute('UPDATE public.notifications SET is_read = TRUE WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notification:patch] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to update notification.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const notification = await queryOne('SELECT * FROM public.notifications WHERE id = $1 AND user_id = $2', [id, user.id]);

    if (!notification) {
      return NextResponse.json({ error: true, message: 'Notification not found.' }, { status: 404 });
    }

    await execute('DELETE FROM public.notifications WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notification:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to delete notification.' }, { status: 500 });
  }
}
