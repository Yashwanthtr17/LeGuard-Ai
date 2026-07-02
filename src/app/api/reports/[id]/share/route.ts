import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { getReport, createShareLink, logActivity } from '@/lib/services/database';
import { shareReportPdf } from '@/lib/services/storage';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const rateLimit = checkRateLimit(`report_share:${user.id}`, 10);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: 'Too many share requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const expiresInHours = Math.min(Math.max(parseInt(body.expires_in_hours) || 24, 1), 168);

    const reportData = await getReport(id);
    if (!reportData) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    const report = reportData as unknown as Record<string, unknown>;
    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Access denied.' }, { status: 403 });
    }

    const pdfStoragePath = report.pdf_storage_path as string | null;
    if (!pdfStoragePath) {
      return NextResponse.json(
        { error: true, message: 'Report PDF has not been generated yet. Generate the report first.' },
        { status: 400 }
      );
    }

    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();

    const share = await createShareLink(id, user.id, expiresAt);

    const signedUrl = await shareReportPdf(pdfStoragePath, expiresInHours);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/${share.token}`;

    logActivity(user.id, 'report_share', 'reports', id, {
      share_id: share.id,
      expires_at: expiresAt,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      share_url: shareUrl,
      direct_pdf_url: signedUrl,
      expires_at: expiresAt,
      token: share.token,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create share link.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
