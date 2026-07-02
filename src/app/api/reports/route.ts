import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

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

    const admin = getSupabaseAdmin();

    // Build the main query for reports with joins to analyses and documents
    let query = admin
      .from('reports')
      .select(`
        id,
        title,
        document_id,
        analysis_id,
        is_favorite,
        generation_status,
        pdf_storage_path,
        created_at,
        updated_at,
        analysis:analysis_id (
          overall_score,
          risk_level,
          document_type_detected,
          country_applied
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null);

    if (search) query = query.ilike('title', `%${search}%`);

    // Filter by country via analysis join
    if (country) {
      const admin2 = getSupabaseAdmin();
      const analysisIds = await admin2
        .from('analyses')
        .select('id')
        .eq('country_applied', country);
      const ids = (analysisIds.data || []).map(a => (a as Record<string, unknown>).id as string);
      if (ids.length > 0) query = query.in('analysis_id', ids);
      else return NextResponse.json({ reports: [], total: 0, page, total_pages: 1 });
    }

    let sortField = 'created_at';
    let sortDir: 'asc' | 'desc' = 'desc';
    switch (sort) {
      case 'oldest': sortField = 'created_at'; sortDir = 'asc'; break;
      case 'highest': sortField = 'created_at'; sortDir = 'desc'; break; // We'll sort in-memory for score
      case 'lowest': sortField = 'created_at'; sortDir = 'asc'; break;
      default: sortField = 'created_at'; sortDir = 'desc';
    }
    query = query.order(sortField, { ascending: sortDir === 'asc' }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const rows = (data || []) as Record<string, unknown>[];

    // Enrich with document names
    const docIds = [...new Set(rows.map(r => r.document_id as string))];
    const { data: docs } = await admin
      .from('documents')
      .select('id, original_name')
      .in('id', docIds);
    const docMap = new Map<string, string>();
    if (docs) {
      for (const d of docs as { id: string; original_name: string }[]) {
        docMap.set(d.id, d.original_name);
      }
    }

    let reports = rows.map((r) => {
      const analysis = r.analysis as Record<string, unknown> | undefined;
      return {
        id: r.id,
        document_name: docMap.get(r.document_id as string) || (r.title as string) || 'Untitled',
        document_type: (analysis?.document_type_detected as string) || '',
        country: (analysis?.country_applied as string) || '',
        overall_score: (analysis?.overall_score as number) ?? 0,
        risk_level: (analysis?.risk_level as string) || 'LOW',
        created_at: r.created_at,
        is_favorite: r.is_favorite,
        generation_status: r.generation_status || null,
      };
    });

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

    const total = count || reports.length;

    return NextResponse.json({
      reports,
      total,
      page,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reports.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
