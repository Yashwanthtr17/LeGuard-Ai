import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { signInWithPassword } from '@/lib/supabase';
import { loginSchema } from '@/lib/schemas';
import { recordActivity } from '@/lib/services/activity';
import { createTwoFactorChallenge } from '@/lib/services/database';
import { query } from '@/lib/db-pool';

interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  default_country?: string;
  risk_sensitivity?: string;
  theme?: string;
  onboarding_complete?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid input.';
      return NextResponse.json({ error: true, message }, { status: 400 });
    }

    const { email, password, remember_me } = parsed.data;

    const { data, error } = await signInWithPassword(email.toLowerCase(), password);

    if (error || !data?.session || !data.user) {
      return NextResponse.json({ error: true, message: 'Invalid email or password.' }, { status: 401 });
    }

    const session = data.session;
    const user = data.user;

    const twoFactorRows = await query<{ enabled: boolean }>(
      'SELECT enabled FROM public.two_factor WHERE user_id = $1',
      [user.id]
    );
    const twoFactor = twoFactorRows[0];

    if (twoFactor?.enabled) {
      const challengeToken = crypto.randomUUID();
      await createTwoFactorChallenge(
        user.id,
        challengeToken,
        session.access_token,
        session.refresh_token,
      );

      return NextResponse.json({
        requires_2fa: true,
        challenge_token: challengeToken,
        email: user.email,
      });
    }

    const meta = (user.user_metadata ?? {}) as UserMetadata;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    await recordActivity(user.id, 'login', 'User logged in', ip);

    return NextResponse.json({
      token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: remember_me ? 2592000 : 604800,
      user: {
        id: user.id,
        email: user.email,
        full_name: meta.full_name || '',
        avatar_url: meta.avatar_url || '',
        default_country: meta.default_country || 'United States',
        risk_sensitivity: meta.risk_sensitivity || 'standard',
        theme: meta.theme || 'system',
        onboarding_complete: !!meta.onboarding_complete,
      },
    });
  } catch (err) {
    console.error('[login] Error:', err);
    return NextResponse.json({ error: true, message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
