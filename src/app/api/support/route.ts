import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';
import { generateId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, priority } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: true, message: 'Subject and message are required.' }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from('support_tickets')
      .insert({
        id: generateId(),
        user_id: user.id,
        subject,
        message,
        status: 'open',
        priority: priority || 'normal',
      } as never)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[support:post] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to create support ticket.' }, { status: 500 });
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
    const status = searchParams.get('status') || '';

    let query = getSupabaseAdmin()
      .from('support_tickets')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      tickets: data || [],
      total: count || 0,
      page,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('[support:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to fetch support tickets.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { ticket_id, status, message } = body;

    if (!ticket_id || !status) {
      return NextResponse.json({ error: true, message: 'Ticket ID and status are required.' }, { status: 400 });
    }

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: true, message: 'Invalid status.' }, { status: 400 });
    }

    const { data: ticket, error: findError } = await getSupabaseAdmin()
      .from('support_tickets')
      .select('*')
      .eq('id', ticket_id)
      .eq('user_id', user.id)
      .single();

    if (findError || !ticket) {
      return NextResponse.json({ error: true, message: 'Support ticket not found.' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (message) {
      updates.message = message;
    }

    const { error } = await getSupabaseAdmin()
      .from('support_tickets')
      .update(updates as never)
      .eq('id', ticket_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[support:patch] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to update ticket.' }, { status: 500 });
  }
}
