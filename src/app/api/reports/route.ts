import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne } from '@/lib/db-pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const riskLevel = searchParams.get('risk_level') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 10;
    const offset = (page - 1) * limit;

    let conditions = ['r.user_id = $1', 'r.deleted_at IS NULL'];
    const params: unknown[] = [user.id];
    let paramIdx = 2;

    if (search) {
      conditions.push(`r.title ILIKE $${paramIdx++}`);
      params.push(`%${search}%`);
    }

    if (country) {
      conditions.push(`r.analysis_id IN (SELECT a2.id FROM public.analyses a2 WHERE a2.country_applied = $${paramIdx++})`);
      params.push(country);
    }

    const where = conditions.join(' AND ');

    const countRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM public.reports r WHERE ${where}`,
      params
    );
    const total = parseInt(countRow?.count || '0', 10);

    const rows = await query<Record<string, unknown>>(
      `SELECT r.id, r.title, r.document_id, r.analysis_id, r.is_favorite, r.generation_status,
              r.pdf_storage_path, r.created_at, r.updated_at,
              a.overall_score as analysis_overall_score,
              a.risk_level as analysis_risk_level,
              a.document_type_detected as analysis_document_type_detected,
              a.country_applied as analysis_country_applied
       FROM public.reports r
       LEFT JOIN public.analyses a ON a.id = r.analysis_id
       WHERE ${where}
       ORDER BY r.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limit, offset]
    );

    // Enrich with document names
    const docIds = [...new Set(rows.map(r => r.document_id as string))];
    const docMap = new Map<string, string>();
    if (docIds.length > 0) {
      const docPlaceholders = docIds.map((_, i) => `$${i + 1}`).join(', ');
      const docs = await query<{ id: string; original_name: string }>(
        `SELECT id, original_name FROM public.documents WHERE id IN (${docPlaceholders})`,
        docIds
      );
      for (const d of docs) {
        docMap.set(d.id, d.original_name);
      }
    }

    let reports = rows.map((r) => ({
      id: r.id,
      document_name: docMap.get(r.document_id as string) || (r.title as string) || 'Untitled',
      document_type: (r.analysis_document_type_detected as string) || '',
      country: (r.analysis_country_applied as string) || '',
      overall_score: (r.analysis_overall_score as number) ?? 0,
      risk_level: (r.analysis_risk_level as string) || 'LOW',
      created_at: r.created_at,
      is_favorite: r.is_favorite,
      generation_status: r.generation_status || null,
    }));

    // In-memory sort by score if needed
    if (sort === 'highest') {
      reports.sort((a, b) => b.overall_score - a.overall_score);
    } else if (sort === 'lowest') {
      reports.sort((a, b) => a.overall_score - b.overall_score);
    }

    // Apply risk level filter in-memory (since it's on a joined table)
    if (riskLevel && riskLevel !== 'all') {
      reports = reports.filter(r => r.risk_level === riskLevel);
    }

    return NextResponse.json({
      reports,
      total,
      page,
      total_pages: Math.ceil(total / limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reports.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
