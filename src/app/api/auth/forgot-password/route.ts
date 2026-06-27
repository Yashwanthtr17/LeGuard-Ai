import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: true, message: 'Email is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: true, message: 'Invalid email format.' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(
      email.toLowerCase(),
      { redirectTo: `${req.nextUrl.origin}/reset-password` }
    );

    if (error) {
      console.error('Forgot password error:', error);
      return NextResponse.json({ error: true, message: 'Something went wrong. Please try again.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive a password reset link.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: true, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
