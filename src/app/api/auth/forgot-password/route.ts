import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { forgotPasswordSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid input.';
      return NextResponse.json({ error: true, message }, { status: 400 });
    }

    const { email } = parsed.data;

    const { error } = await getSupabaseAdmin().auth.resetPasswordForEmail(
      email.toLowerCase(),
      { redirectTo: `${req.nextUrl.origin}/auth/reset-password` }
    );

    if (error) {
      console.error('[forgot-password] Error:', error);
      return NextResponse.json({ error: true, message: 'Something went wrong. Please try again.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, you will receive a password reset link.',
    });
  } catch (err) {
    console.error('[forgot-password] Error:', err);
    return NextResponse.json({ error: true, message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
