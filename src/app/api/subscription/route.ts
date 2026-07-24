import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { execute } from '@/lib/db-pool';
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

    const now = new Date().toISOString();

    if (existing) {
      await execute(
        'UPDATE public.subscriptions SET plan = $1, status = $2, current_period_start = $3, updated_at = $4 WHERE id = $5',
        [plan, 'active', now, now, existing.id]
      );
    } else {
      await execute(
        'INSERT INTO public.subscriptions (user_id, plan, status, current_period_start) VALUES ($1, $2, $3, $4)',
        [user.id, plan, 'active', now]
      );
    }

    const subscription = await getUserSubscription(user.id);
    return NextResponse.json(subscription);
  } catch (err) {
    console.error('[subscription:post] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to update subscription.' }, { status: 500 });
  }
}


