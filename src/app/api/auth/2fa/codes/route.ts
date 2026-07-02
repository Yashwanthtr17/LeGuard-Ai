import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAuth } from '@/lib/supabase';
import { getBackupCodes, updateBackupCodes } from '@/lib/services/database';
import { logActivity } from '@/lib/db';

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = Array.from({ length: 10 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');
    codes.push(code.match(/.{5}/g)!.join('-'));
  }
  return codes;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 401 });
    }

    const codes = await getBackupCodes(user.id);
    return NextResponse.json({ codes: codes ?? [] });
  } catch (err) {
    console.error('[2fa/codes] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to get backup codes.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: true, message: 'Current password is required.' }, { status: 400 });
    }

    const { error: authError } = await getSupabaseAuth().auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: true, message: 'Invalid password.' }, { status: 401 });
    }

    const backupCodes = generateBackupCodes();
    await updateBackupCodes(user.id, backupCodes);
    await logActivity(user.id, '2fa_codes_regenerated', '2FA backup codes regenerated');

    return NextResponse.json({ backupCodes });
  } catch (err) {
    console.error('[2fa/codes] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to regenerate codes.' }, { status: 500 });
  }
}
