import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'otplib';
import { getUserFromRequest } from '@/lib/supabase';
import { getTwoFactorSecret, enableTwoFactor } from '@/lib/services/database';
import { recordActivity } from '@/lib/services/activity';

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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: true, message: 'Verification code is required.' }, { status: 400 });
    }

    const secret = await getTwoFactorSecret(user.id);
    if (!secret) {
      return NextResponse.json({ error: true, message: '2FA not initialized. Run setup first.' }, { status: 400 });
    }

    const result = await verify({
      token: code.replace(/\s/g, ''),
      secret,
      epochTolerance: 30,
    });
    if (!result.valid) {
      return NextResponse.json({ error: true, message: 'Invalid verification code.' }, { status: 400 });
    }

    const backupCodes = generateBackupCodes();
    await enableTwoFactor(user.id, backupCodes);
    await recordActivity(user.id, '2fa_enabled', 'Two-factor authentication enabled');

    return NextResponse.json({ backupCodes });
  } catch (err) {
    console.error('[2fa/enable] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to enable 2FA.' }, { status: 500 });
  }
}
