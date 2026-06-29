import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getSupabaseAuth } from '@/lib/supabase';
import { registerSchema } from '@/lib/schemas';
import { logActivity, upsertProfile } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid input.';
      return NextResponse.json({ error: true, message }, { status: 400 });
    }

    const { full_name, email, password, default_country } = parsed.data;

    const { data, error } = await getSupabaseAdmin().auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        default_country: default_country || 'United States',
        risk_sensitivity: 'standard',
        theme: 'system',
        onboarding_complete: false,
      },
    });

    if (error) {
      const msg = (error.message || '').toLowerCase();
      const status = (error as unknown as Record<string, unknown>)?.status as number | undefined;
      if (
        msg.includes('already') ||
        msg.includes('registered') ||
        msg.includes('duplicate') ||
        msg.includes('exists') ||
        status === 409 ||
        status === 422
      ) {
        return NextResponse.json({ error: true, message: 'This email is already registered. Please sign in instead.' }, { status: 409 });
      }
      return NextResponse.json({ error: true, message: error.message || 'Registration failed.' }, { status: 400 });
    }

    const { data: signInData, error: signInError } = await getSupabaseAuth().auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (signInError || !signInData.session) {
      return NextResponse.json({ error: true, message: 'Account created. Please sign in.' });
    }

    const createdUser = data.user!;

    upsertProfile(createdUser.id, {
      full_name,
      email: email.toLowerCase(),
      default_country: default_country || 'United States',
      risk_sensitivity: 'standard',
      theme: 'system',
      onboarding_complete: 0,
    });

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    logActivity(createdUser.id, 'register', 'User registered', ip);

    const meta = createdUser.user_metadata ?? {};

    return NextResponse.json({
      token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        full_name: meta.full_name || full_name,
        avatar_url: meta.avatar_url || '',
        default_country: meta.default_country || 'United States',
        risk_sensitivity: meta.risk_sensitivity || 'standard',
        theme: meta.theme || 'system',
        onboarding_complete: !!meta.onboarding_complete,
      },
    });
  } catch (err) {
    console.error('[register] Error:', err);
    return NextResponse.json({ error: true, message: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
