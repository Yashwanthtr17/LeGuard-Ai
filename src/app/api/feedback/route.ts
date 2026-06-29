import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

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

    const { data, error } = await getSupabaseAdmin()
      .from('feedback')
      .insert({
        user_id: user.id,
        rating,
        message: message || null,
        category: category || null,
      } as never)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
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

    const { data, error, count } = await getSupabaseAdmin()
      .from('feedback')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      feedback: data || [],
      total: count || 0,
      page,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('[feedback:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch feedback.' }, { status: 500 });
  }
}
