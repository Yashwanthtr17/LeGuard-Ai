import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getReportPdfUrl } from '@/lib/services/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const admin = getSupabaseAdmin();
    const { data: share } = await admin
      .from('report_shares')
      .select('*')
      .eq('token', token)
      .single();

    if (!share) {
      return NextResponse.json({ error: true, message: 'Invalid share link.' }, { status: 404 });
    }

    const shareData = share as { report_id: string; expires_at: string; created_by: string };

    if (new Date(shareData.expires_at) < new Date()) {
      return NextResponse.json({ error: true, message: 'This share link has expired.' }, { status: 410 });
    }

    const { data: report } = await admin
      .from('reports')
      .select('pdf_storage_path, title, generated_at')
      .eq('id', shareData.report_id)
      .single();

    if (!report) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    const reportData = report as { pdf_storage_path: string | null; title: string; generated_at: string | null };
    if (!reportData.pdf_storage_path) {
      return NextResponse.json({ error: true, message: 'Report PDF has not been generated.' }, { status: 400 });
    }

    const signedUrl = await getReportPdfUrl(reportData.pdf_storage_path);

    return NextResponse.json({
      success: true,
      pdf_url: signedUrl,
      title: reportData.title,
      generated_at: reportData.generated_at,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load shared report.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
