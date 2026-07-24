import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query } from '@/lib/db-pool';
import { getUserProfile, getUserDocuments, getUserReports, getUserAnalyses, getUserSubscription } from '@/lib/services/database';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const [profile, documentsData, reportsData, analysesData, subscription] = await Promise.all([
      getUserProfile(user.id).catch(() => null),
      getUserDocuments(user.id, { limit: 1000 }).catch(() => ({ data: [], total: 0 })),
      getUserReports(user.id, { limit: 1000 }).catch(() => ({ data: [], total: 0 })),
      getUserAnalyses(user.id, { limit: 1000 }).catch(() => ({ data: [], total: 0 })),
      getUserSubscription(user.id).catch(() => null),
    ]);

    const payments = await query('SELECT * FROM public.payments WHERE user_id = $1 ORDER BY created_at DESC', [user.id]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      profile,
      documents: documentsData.data,
      reports: reportsData.data,
      analyses: analysesData.data,
      subscription,
      payments: payments || [],
    };

    return NextResponse.json(exportData);
  } catch (err) {
    console.error('[export:get] Error:', err);
    return NextResponse.json({ error: true, message: 'Failed to export data.' }, { status: 500 });
  }
}
