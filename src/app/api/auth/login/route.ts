import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuth } from '@/lib/supabase';
import { loginSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: true, message: 'Email and password are required.' }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const { data, error } = await getSupabaseAuth().auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: true, message: 'Invalid email or password. Please try again.' }, { status: 401 });
    }

    const user = data.user;
    const meta = user?.user_metadata ?? {};

    return NextResponse.json({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: user!.id,
        email: user!.email,
        full_name: meta.full_name || '',
        default_country: meta.default_country || 'United States',
        risk_sensitivity: meta.risk_sensitivity || 'standard',
        onboarding_complete: !!meta.onboarding_complete,
      },
    });
  } catch (err) {
    console.error('[login] Error:', err);
    return NextResponse.json({ error: true, message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
