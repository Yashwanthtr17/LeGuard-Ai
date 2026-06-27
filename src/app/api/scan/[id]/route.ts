import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const report = db.prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?').get(id, user.id) as any;

  if (!report) {
    return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
  }

  const analysis = JSON.parse(report.full_analysis || '{}');

  return NextResponse.json({
    id: report.id,
    fileName: report.document_name,
    documentType: report.document_type,
    jurisdiction: report.country,
    overallScore: report.overall_score,
    riskLevel: report.risk_level,
    verdict: report.verdict,
    executiveSummary: report.executive_summary,
    createdAt: report.created_at,
    ...analysis,
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const result = db.prepare('DELETE FROM reports WHERE id = ? AND user_id = ?').run(id, user.id);

  if (result.changes === 0) {
    return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
