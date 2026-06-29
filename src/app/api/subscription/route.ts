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
      cancel_at_period_end: false,
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
          status: plan === 'free' ? 'canceled' : 'active',
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
          status: plan === 'free' ? 'canceled' : 'active',
          current_period_start: new Date().toISOString(),
          cancel_at_period_end: false,
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const existing = await getUserSubscription(user.id);
    if (!existing) {
      return NextResponse.json({ error: true, message: 'No active subscription to cancel.' }, { status: 404 });
    }

    const { error } = await getSupabaseAdmin()
      .from('subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() } as never)
      .eq('id', existing.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Subscription will be canceled at the end of the billing period.' });
  } catch (err) {
    console.error('[subscription:delete] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to cancel subscription.' }, { status: 500 });
  }
}
