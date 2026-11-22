import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { transaction } from '@/lib/db-pool';

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    await transaction(async (client) => {
      // These audit rows reference users without ON DELETE CASCADE.
      await client.query('DELETE FROM public.activity_logs WHERE user_id = $1', [user.id]);
      await client.query('DELETE FROM public.ai_usage_logs WHERE user_id = $1', [user.id]);

      // Tickets assigned to this user may belong to other accounts.
      await client.query(
        'UPDATE public.support_tickets SET assigned_to = NULL WHERE assigned_to = $1',
        [user.id]
      );

      // All remaining user-owned tables cascade from users or their documents.
      await client.query('DELETE FROM public.users WHERE id = $1', [user.id]);
    });

    return NextResponse.json({ success: true, message: 'Account and all associated data have been deleted.' });
  } catch (err) {
    console.error('[delete:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to delete account.' }, { status: 500 });
  }
}
