import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const country = searchParams.get('country') || '';
  const riskLevel = searchParams.get('risk_level') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = 'SELECT id, document_name, document_type, country, overall_score, risk_level, created_at FROM reports WHERE user_id = ?';
  const params: any[] = [user.id];

  if (search) {
    query += ' AND document_name LIKE ?';
    params.push(`%${search}%`);
  }
  if (country) {
    query += ' AND country = ?';
    params.push(country);
  }
  if (riskLevel && riskLevel !== 'all') {
    query += ' AND risk_level = ?';
    params.push(riskLevel);
  }

  const countResult = db.prepare(query.replace('SELECT id, document_name, document_type, country, overall_score, risk_level, created_at', 'SELECT COUNT(*) as total')).get(...params) as any;
  const total = countResult?.total || 0;

  switch (sort) {
    case 'oldest': query += ' ORDER BY created_at ASC'; break;
    case 'highest': query += ' ORDER BY overall_score DESC'; break;
    case 'lowest': query += ' ORDER BY overall_score ASC'; break;
    default: query += ' ORDER BY created_at DESC';
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const reports = db.prepare(query).all(...params);

  return NextResponse.json({
    reports: reports.map((r: any) => ({
      id: r.id,
      document_name: r.document_name,
      document_type: r.document_type,
      country: r.country,
      overall_score: r.overall_score,
      risk_level: r.risk_level,
      created_at: r.created_at,
    })),
    total,
    page,
    total_pages: Math.ceil(total / limit),
  });
}
