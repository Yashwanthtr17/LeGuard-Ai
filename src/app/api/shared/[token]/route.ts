import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db-pool';
import { getReportPdfUrl } from '@/lib/services/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const share = await queryOne<{ report_id: string; expires_at: string; created_by: string }>(
      'SELECT * FROM public.report_shares WHERE token = $1',
      [token]
    );

    if (!share) {
      return NextResponse.json({ error: true, message: 'Invalid share link.' }, { status: 404 });
    }

    if (new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: true, message: 'This share link has expired.' }, { status: 410 });
    }

    const report = await queryOne<{ pdf_storage_path: string | null; title: string; generated_at: string | null }>(
      'SELECT pdf_storage_path, title, generated_at FROM public.reports WHERE id = $1',
      [share.report_id]
    );

    if (!report) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    if (!report.pdf_storage_path) {
      return NextResponse.json({ error: true, message: 'Report PDF has not been generated.' }, { status: 400 });
    }

    const signedUrl = await getReportPdfUrl(report.pdf_storage_path);

    return NextResponse.json({
      success: true,
      pdf_url: signedUrl,
      title: report.title,
      generated_at: report.generated_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load shared report.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
