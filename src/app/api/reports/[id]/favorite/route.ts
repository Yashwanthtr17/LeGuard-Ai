import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { getReport, favoriteReport, logActivity } from '@/lib/services/database';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await req.json().catch(() => ({}));
    const isFavorited = body.favorited !== undefined ? !!body.favorited : !report.is_favorite;

    await favoriteReport(id, isFavorited);

    logActivity(user.id, 'report_favorite', 'reports', id, { favorited: isFavorited }).catch(() => {});

    return NextResponse.json({ success: true, favorited: isFavorited });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to toggle favorite.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
