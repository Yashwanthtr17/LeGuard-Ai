import { NextRequest, NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { getUserFromRequest } from '@/lib/supabase';
import { upsertTwoFactorSecret } from '@/lib/services/database';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 401 });
    }

    const secret = generateSecret();
    const uri = generateURI({
      strategy: 'totp',
      issuer: 'LeGuard-AI',
      label: user.email,
      secret,
    });

    const qrCode = await QRCode.toDataURL(uri);

    await upsertTwoFactorSecret(user.id, secret);

    return NextResponse.json({ secret, qrCode, uri });
  } catch (err) {
    console.error('[2fa/setup] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to set up 2FA.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
