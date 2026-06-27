import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const reports = db.prepare('SELECT overall_score, risk_level FROM reports WHERE user_id = ?').all(user.id) as any[];

  const totalAnalyses = reports.length;
  const avgRiskScore = totalAnalyses > 0
    ? (reports.reduce((sum, r) => sum + (r.overall_score || 0), 0) / totalAnalyses)
    : 0;
  const highRiskDocs = reports.filter(r => r.risk_level === 'HIGH' || (r.overall_score && r.overall_score >= 7)).length;
  const totalSaved = reports.length;

  const scoreDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  reports.forEach(r => {
    const score = Math.round(r.overall_score || 0);
    if (score >= 0 && score <= 10) scoreDistribution[score]++;
  });

  const recentReports = db.prepare(
    'SELECT id, document_name, document_type, country, overall_score, risk_level, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 5'
  ).all(user.id);

  return NextResponse.json({
    total_analyses: totalAnalyses,
    avg_risk_score: Math.round(avgRiskScore * 10) / 10,
    high_risk_docs: highRiskDocs,
    reports_saved: totalSaved,
    score_distribution: scoreDistribution,
    recent_reports: recentReports,
  });
}
