import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const { data: notification, error: findError } = await getSupabaseAdmin()
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !notification) {
      return NextResponse.json({ error: true, message: 'Notification not found.' }, { status: 404 });
    }

    const { error } = await getSupabaseAdmin()
      .from('notifications')
      .update({ is_read: true } as never)
      .eq('id', id);

    if (error) throw error;

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

    const { data: notification, error: findError } = await getSupabaseAdmin()
      .from('notifications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (findError || !notification) {
      return NextResponse.json({ error: true, message: 'Notification not found.' }, { status: 404 });
    }

    const { error } = await getSupabaseAdmin()
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[notification:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to delete notification.' }, { status: 500 });
  }
}
