import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getUserSubscription } from '@/lib/services/database';


export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const subscription = await getUserSubscription(user.id);

    return NextResponse.json(subscription || {
      plan: 'free',
      status: 'active',
    });
  } catch (err) {
    console.error('[subscription:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch subscription.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !['free', 'single', 'pro'].includes(plan)) {
      return NextResponse.json({ error: true, message: 'Invalid plan. Must be free, single, or pro.' }, { status: 400 });
    }

    const existing = await getUserSubscription(user.id);

    if (existing) {
      const { error } = await getSupabaseAdmin()
        .from('subscriptions')
        .update({
          plan,
          status: 'active',
          current_period_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as never)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      const { error } = await getSupabaseAdmin()
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan,
          status: 'active',
          current_period_start: new Date().toISOString(),
        } as never);

      if (error) throw error;
    }

    const subscription = await getUserSubscription(user.id);
    return NextResponse.json(subscription);
  } catch (err) {
    console.error('[subscription:post] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to update subscription.' }, { status: 500 });
  }
}


