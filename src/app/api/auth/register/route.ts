import { NextRequest, NextResponse } from 'next/server';
import { createUser, signInWithPassword } from '@/lib/supabase';
import { registerSchema } from '@/lib/schemas';
import { recordActivity } from '@/lib/services/activity';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid input.';
      return NextResponse.json({ error: true, message }, { status: 400 });
    }

    const { full_name, email, password, default_country } = parsed.data;

    const { data, error } = await createUser({
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

    if (error || !data?.user) {
      const msg = (error?.message || '').toLowerCase();
      if (
        msg.includes('already') ||
        msg.includes('registered') ||
        msg.includes('duplicate') ||
        msg.includes('exists')
      ) {
        return NextResponse.json(
          { error: true, message: 'This email is already registered. Please sign in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: true, message: error?.message || 'Registration failed.' },
        { status: 400 }
      );
    }

    const { data: signInData, error: signInError } = await signInWithPassword(
      email.toLowerCase(),
      password
    );

    if (signInError || !signInData?.session || !signInData.user) {
      return NextResponse.json({ error: true, message: 'Account created. Please sign in.' });
    }

    const createdUser = data.user;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    await recordActivity(createdUser.id, 'register', 'User registered', ip);

    return NextResponse.json({
      token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        full_name: createdUser.full_name || full_name,
        avatar_url: '',
        default_country: default_country || 'United States',
        risk_sensitivity: 'standard',
        theme: 'system',
        onboarding_complete: false,
      },
    });
  } catch (err) {
    console.error('[register] Error:', err);
    return NextResponse.json({ error: true, message: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
