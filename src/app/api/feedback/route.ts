import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne } from '@/lib/db-pool';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { rating, message, category } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: true, message: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const feedback = await queryOne(
      'INSERT INTO public.feedback (user_id, rating, message, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.id, rating, message || null, category || null]
    );

    return NextResponse.json(feedback, { status: 201 });
  } catch (err) {
    console.error('[feedback:post] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to submit feedback.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const [feedback, countResult] = await Promise.all([
      query('SELECT * FROM public.feedback WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [user.id, limit, offset]),
      queryOne<{ count: string }>('SELECT COUNT(*) as count FROM public.feedback WHERE user_id = $1', [user.id]),
    ]);

    const total = parseInt(countResult?.count || '0', 10);

    return NextResponse.json({
      feedback: feedback || [],
      total,
      page,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[feedback:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch feedback.' }, { status: 500 });
  }
}
