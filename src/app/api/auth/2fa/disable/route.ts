import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAuth } from '@/lib/supabase';
import { disableTwoFactor } from '@/lib/services/database';
import { logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: true, message: 'Current password is required to disable 2FA.' }, { status: 400 });
    }

    const { error: authError } = await getSupabaseAuth().auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: true, message: 'Invalid password.' }, { status: 401 });
    }

    await disableTwoFactor(user.id);
    await logActivity(user.id, '2fa_disabled', 'Two-factor authentication disabled');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[2fa/disable] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to disable 2FA.' }, { status: 500 });
  }
}
