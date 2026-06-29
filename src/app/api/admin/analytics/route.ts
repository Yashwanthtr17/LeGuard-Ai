import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      documentsRaw,
      analysesRaw,
      profilesRaw,
      riskResult,
      countriesResult,
      typesResult,
    ] = await Promise.all([
      supabase.from('documents').select('created_at').gte('created_at', thirtyDaysAgo),
      supabase.from('analyses').select('created_at').gte('created_at', thirtyDaysAgo),
      supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo),
      supabase.from('analyses').select('risk_level').eq('status', 'completed'),
      supabase.from('analyses').select('country_applied'),
      supabase.from('reports').select('document_type'),
    ]);

    const dayBuckets = (rows: { created_at: string }[]) => {
      const map = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        map.set(d, 0);
      }
      rows.forEach(r => {
        const date = r.created_at.slice(0, 10);
        if (map.has(date)) map.set(date, (map.get(date) || 0) + 1);
      });
      return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
    };

    const documentsOverTime = dayBuckets((documentsRaw.data || []) as { created_at: string }[]);
    const analysesOverTime = dayBuckets((analysesRaw.data || []) as { created_at: string }[]);
    const registrationsOverTime = dayBuckets((profilesRaw.data || []) as { created_at: string }[]);

    const riskDistribution: Record<string, number> = {};
    ((riskResult.data || []) as { risk_level: string | null }[]).forEach(r => {
      const level = r.risk_level || 'UNKNOWN';
      riskDistribution[level] = (riskDistribution[level] || 0) + 1;
    });

    const topCountries: Record<string, number> = {};
    ((countriesResult.data || []) as { country_applied: string | null }[]).forEach(r => {
      const country = r.country_applied || 'Unknown';
      topCountries[country] = (topCountries[country] || 0) + 1;
    });

    const documentTypes: Record<string, number> = {};
    ((typesResult.data || []) as { document_type: string | null }[]).forEach(r => {
      const type = r.document_type || 'Other';
      documentTypes[type] = (documentTypes[type] || 0) + 1;
    });

    const sortedCountries = Object.entries(topCountries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([country, count]) => ({ country, count }));

    return NextResponse.json({
      documents_over_time: documentsOverTime,
      analyses_over_time: analysesOverTime,
      registrations_over_time: registrationsOverTime,
      risk_distribution: riskDistribution,
      top_countries: sortedCountries,
      document_types: documentTypes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch analytics.';
    console.error('[admin/analytics] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
