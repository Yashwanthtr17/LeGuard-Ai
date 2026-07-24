import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne, execute } from '@/lib/db-pool';
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

    const ticket = await queryOne(
      `INSERT INTO public.support_tickets (id, user_id, subject, message, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [generateId(), user.id, subject, message, 'open', priority || 'normal']
    );

    return NextResponse.json(ticket, { status: 201 });
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

    const conditions = ['user_id = $1'];
    const params: unknown[] = [user.id];
    let paramIdx = 2;

    if (status) {
      conditions.push(`status = $${paramIdx++}`);
      params.push(status);
    }

    const where = conditions.join(' AND ');

    const [tickets, countResult] = await Promise.all([
      query(`SELECT * FROM public.support_tickets WHERE ${where} ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`, [...params, limit, offset]),
      queryOne<{ count: string }>(`SELECT COUNT(*) as count FROM public.support_tickets WHERE ${where}`, params),
    ]);

    const total = parseInt(countResult?.count || '0', 10);

    return NextResponse.json({
      tickets: tickets || [],
      total,
      page,
      total_pages: Math.ceil(total / limit),
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

    const ticket = await queryOne('SELECT * FROM public.support_tickets WHERE id = $1 AND user_id = $2', [ticket_id, user.id]);

    if (!ticket) {
      return NextResponse.json({ error: true, message: 'Support ticket not found.' }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (message) {
      await execute('UPDATE public.support_tickets SET status = $1, message = $2, updated_at = $3 WHERE id = $4', [status, message, now, ticket_id]);
    } else {
      await execute('UPDATE public.support_tickets SET status = $1, updated_at = $2 WHERE id = $3', [status, now, ticket_id]);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[support:patch] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to update ticket.' }, { status: 500 });
  }
}
