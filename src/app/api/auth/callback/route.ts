import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuth } from '@/lib/supabase';
import { logActivity } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const redirectTo = searchParams.get('redirect_to') || `${req.nextUrl.origin}/dashboard`;

    if (!code) {
      return NextResponse.redirect(new URL('/auth/login?error=no_code', req.nextUrl.origin));
    }

    const { data, error } = await getSupabaseAuth().auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error('[callback] Exchange error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=exchange_failed', req.nextUrl.origin));
    }

    const user = data.session.user;
    if (user) {
      logActivity(user.id, 'oauth_callback', 'OAuth sign-in completed');
    }

    const response = NextResponse.redirect(new URL(redirectTo, req.nextUrl.origin));

    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[callback] Error:', err);
    return NextResponse.redirect(new URL('/auth/login?error=callback_failed', req.nextUrl.origin));
  }
}
