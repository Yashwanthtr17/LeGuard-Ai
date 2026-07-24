import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne } from '@/lib/db-pool';
import { getReport, logActivity } from '@/lib/services/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const reportData = await getReport(id);
    if (!reportData) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    const report = reportData as unknown as Record<string, unknown>;
    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Access denied.' }, { status: 403 });
    }

    const analysis = report.analysis as Record<string, unknown> | undefined;
    const clauses = (analysis?.clauses as Record<string, unknown>[]) || [];
    const clausesByType: Record<string, Record<string, unknown>[]> = {};
    for (const c of clauses) {
      const type = (c.type as string) || 'regular';
      if (!clausesByType[type]) clausesByType[type] = [];
      clausesByType[type].push(c);
    }

    const riskItems = (analysis?.risk_items as { category: string; content: string; sort_order: number }[]) || [];
    const byCategory: Record<string, string[]> = {};
    for (const item of riskItems) {
      const cat = item.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item.content);
    }

    const documentId = report.document_id as string;
    let documentName = report.title as string || 'Untitled';

    const doc = await queryOne<{ original_name: string }>(
      'SELECT original_name FROM public.documents WHERE id = $1',
      [documentId]
    );
    if (doc) documentName = doc.original_name || documentName;

    logActivity(user.id, 'report_view', 'reports', id, {
      report_title: report.title,
    }).catch(() => {});

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        created_at: report.created_at,
        updated_at: report.updated_at,
        pdf_storage_path: report.pdf_storage_path,
        generation_status: report.generation_status,
        generated_at: report.generated_at,
      },
      document: {
        original_name: documentName,
      },
      analysis: {
        id: analysis?.id,
        overall_score: analysis?.overall_score ?? 0,
        risk_level: analysis?.risk_level || 'LOW',
        verdict: analysis?.verdict || null,
        executive_summary: analysis?.executive_summary || null,
        plain_english_summary: analysis?.plain_english_summary || null,
        country_applied: analysis?.country_applied || null,
        document_type_detected: analysis?.document_type_detected || null,
        governing_law: analysis?.governing_law || null,
        arbitration: analysis?.arbitration || null,
        jurisdiction: analysis?.jurisdiction || null,
        confidence_score: analysis?.confidence_score ?? null,
        created_at: analysis?.created_at || null,
      },
      clauses,
      clauses_by_type: clausesByType,
      compliance: (analysis?.country_compliance as Record<string, unknown>[]) || [],
      risk_items: riskItems,
      timeline: (analysis?.timeline_events as Record<string, unknown>[]) || [],
      obligations: (analysis?.obligations as Record<string, unknown>[]) || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch report.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;
    const { deleteReport, logActivity } = await import('@/lib/services/database');

    const reportData = await getReport(id);
    if (!reportData) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    const report = reportData as unknown as Record<string, unknown>;
    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Access denied.' }, { status: 403 });
    }

    await deleteReport(id);

    logActivity(user.id, 'report_delete', 'reports', id, {}).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete report.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
