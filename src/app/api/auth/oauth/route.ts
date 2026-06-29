import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAuth } from '@/lib/supabase';
import { oauthSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = oauthSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Invalid provider. Supported: google, github, azure.';
      return NextResponse.json({ error: true, message }, { status: 400 });
    }

    const { provider } = parsed.data;

    const { data, error } = await getSupabaseAuth().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${req.nextUrl.origin}/api/auth/callback`,
      },
    });

    if (error) {
      console.error('[oauth] Error:', error);
      return NextResponse.json({ error: true, message: error.message || 'OAuth initiation failed.' }, { status: 400 });
    }

    return NextResponse.json({
      url: data.url,
      provider,
    });
  } catch (err) {
    console.error('[oauth] Error:', err);
    return NextResponse.json({ error: true, message: 'OAuth login failed. Please try again.' }, { status: 500 });
  }
}
