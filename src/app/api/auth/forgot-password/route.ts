import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth';
import { queryOne } from '@/lib/db-pool';
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

    const user = await queryOne<{ id: string; full_name: string }>(
      'SELECT id, full_name FROM public.users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (user) {
      const resetToken = generateToken({ id: user.id, email, full_name: user.full_name });
      // In production, send email with reset link containing this token
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
