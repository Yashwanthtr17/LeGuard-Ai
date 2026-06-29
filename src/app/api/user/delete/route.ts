import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

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
    ];

    for (const table of tables) {
      const { error } = await admin
        .from(table as never)
        .delete()
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') {
        console.warn(`[delete] Failed to clear ${table}:`, error);
      }
    }

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error('[delete] Failed to delete auth user:', authDeleteError);
      return NextResponse.json({ error: true, message: 'Failed to delete account.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Account and all associated data have been deleted.' });
  } catch (err) {
    console.error('[delete:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to delete account.' }, { status: 500 });
  }
}
