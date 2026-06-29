import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuth } from '@/lib/supabase';
import { loginSchema } from '@/lib/schemas';
import { logActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid input.';
      return NextResponse.json({ error: true, message }, { status: 400 });
    }

    const { email, password, remember_me } = parsed.data;

    const { data, error } = await getSupabaseAuth().auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: true, message: 'Invalid email or password.' }, { status: 401 });
    }

    const session = data.session;
    const user = data.user;
    const meta = user?.user_metadata ?? {};

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    logActivity(user!.id, 'login', 'User logged in', ip);

    return NextResponse.json({
      token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: remember_me ? 2592000 : 604800,
      user: {
        id: user!.id,
        email: user!.email,
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
