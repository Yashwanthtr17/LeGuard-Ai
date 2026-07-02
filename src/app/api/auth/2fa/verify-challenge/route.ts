import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'otplib';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  getTwoFactorChallenge,
  getTwoFactorSecret,
  markChallengeUsed,
} from '@/lib/services/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge_token, code } = body;

    if (!challenge_token || !code) {
      return NextResponse.json({ error: true, message: 'Challenge token and verification code are required.' }, { status: 400 });
    }

    const challenge = await getTwoFactorChallenge(challenge_token);
    if (!challenge) {
      return NextResponse.json({ error: true, message: 'Invalid challenge token.' }, { status: 400 });
    }

    if (challenge.used) {
      return NextResponse.json({ error: true, message: 'Challenge already used. Please log in again.' }, { status: 400 });
    }

    if (new Date(challenge.expires_at) < new Date()) {
      return NextResponse.json({ error: true, message: 'Challenge expired. Please log in again.' }, { status: 400 });
    }

    const secret = await getTwoFactorSecret(challenge.user_id);
    if (!secret) {
      return NextResponse.json({ error: true, message: '2FA not configured.' }, { status: 400 });
    }

    const isValid = verify({ token: code.replace(/\s/g, ''), secret });
    if (!isValid) {
      return NextResponse.json({ error: true, message: 'Invalid verification code.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(challenge.user_id);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: true, message: 'User not found.' }, { status: 404 });
    }

    const meta = userData.user.user_metadata ?? {};

    await markChallengeUsed(challenge_token);

    return NextResponse.json({
      token: challenge.access_token,
      refresh_token: challenge.refresh_token,
      user: {
        id: challenge.user_id,
        email: userData.user.email,
        full_name: meta.full_name || '',
        avatar_url: meta.avatar_url || '',
        default_country: meta.default_country || 'United States',
        risk_sensitivity: meta.risk_sensitivity || 'standard',
        theme: meta.theme || 'system',
        onboarding_complete: !!meta.onboarding_complete,
      },
    });
  } catch (err) {
    console.error('[2fa/verify-challenge] Error:', err);
    return NextResponse.json({ error: true, message: 'Verification failed.' }, { status: 500 });
  }
}
