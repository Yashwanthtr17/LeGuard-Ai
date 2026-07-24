import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query } from '@/lib/db-pool';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [documentsRaw, analysesRaw, profilesRaw, riskResult, countriesResult, typesResult] = await Promise.all([
      query<{ created_at: string }>('SELECT created_at FROM public.documents WHERE created_at >= $1', [thirtyDaysAgo]),
      query<{ created_at: string }>('SELECT created_at FROM public.analyses WHERE created_at >= $1', [thirtyDaysAgo]),
      query<{ created_at: string }>('SELECT created_at FROM public.profiles WHERE created_at >= $1', [thirtyDaysAgo]),
      query<{ risk_level: string | null }>('SELECT risk_level FROM public.analyses WHERE status = $1', ['completed']),
      query<{ country_applied: string | null }>('SELECT country_applied FROM public.analyses'),
      query<{ document_type: string | null }>('SELECT document_type FROM public.reports'),
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

    const documentsOverTime = dayBuckets(documentsRaw);
    const analysesOverTime = dayBuckets(analysesRaw);
    const registrationsOverTime = dayBuckets(profilesRaw);

    const riskDistribution: Record<string, number> = {};
    riskResult.forEach(r => {
      const level = r.risk_level || 'UNKNOWN';
      riskDistribution[level] = (riskDistribution[level] || 0) + 1;
    });

    const topCountries: Record<string, number> = {};
    countriesResult.forEach(r => {
      const country = r.country_applied || 'Unknown';
      topCountries[country] = (topCountries[country] || 0) + 1;
    });

    const documentTypes: Record<string, number> = {};
    typesResult.forEach(r => {
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
