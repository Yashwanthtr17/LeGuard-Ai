import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne } from '@/lib/db-pool';
import { getAnalysis, deleteReport, logActivity } from '@/lib/services/database';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const report = await queryOne<Record<string, unknown>>(
      'SELECT * FROM public.reports WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (!report) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 403 });
    }

    const analysis = await getAnalysis(report.analysis_id as string);

    return NextResponse.json({
      report,
      analysis,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch report.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const report = await queryOne<{ id: string; user_id: string; title: string }>(
      'SELECT id, user_id, title FROM public.reports WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (!report) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 403 });
    }

    await deleteReport(id);

    await logActivity(user.id, 'report_delete', 'reports', id, {
      title: report.title,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete report.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
