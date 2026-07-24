import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { execute, transaction } from '@/lib/db-pool';

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const tables = [
      'feedback',
      'support_tickets',
      'notifications',
      'payments',
      'subscriptions',
      'obligations',
      'timeline_events',
      'risk_items',
      'country_compliance',
      'clauses',
      'analyses',
      'reports',
      'documents',
      'sessions',
      'activity_logs',
      'ai_usage_logs',
      'two_factor',
      'profiles',
      'users',
    ];

    await transaction(async (client) => {
      for (const table of tables) {
        try {
          await client.query(`DELETE FROM public.${table} WHERE user_id = $1`, [user.id]);
        } catch (err: unknown) {
          const pgErr = err as { code?: string; message?: string };
          if (pgErr.code !== 'PGRST116' && pgErr.code !== '42P01') {
            console.warn(`[delete] Failed to clear ${table}:`, pgErr.message);
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Account and all associated data have been deleted.' });
  } catch (err) {
    console.error('[delete:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to delete account.' }, { status: 500 });
  }
}
