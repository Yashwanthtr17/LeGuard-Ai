import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import db from '@/lib/db';
import { generateId } from '@/lib/auth';
import { getUserFromRequest } from '@/lib/supabase';
import { parseDocument } from '@/lib/document-parser';
import { analyzeDocument } from '@/lib/ai';
import { scanDocumentSchema } from '@/lib/schemas';
import { validateFile } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limiter';

const UPLOAD_DIR = join(process.cwd(), '.uploads');
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['.pdf', '.docx', '.doc', '.txt'];

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`scan:${user.id}`, 5);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: true, message: 'Too many requests. Please wait before scanning again.' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: true, message: 'No file provided.' }, { status: 400 });
    }

    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: true, message: fileValidation.error }, { status: 400 });
    }

    const metadata = scanDocumentSchema.safeParse({
      jurisdiction: formData.get('jurisdiction') as string,
      document_type: formData.get('document_type') as string,
      focus_areas: formData.get('focus_areas') as string,
    });

    if (!metadata.success) {
      return NextResponse.json({ error: true, message: 'Invalid form data.' }, { status: 400 });
    }

    const { jurisdiction, document_type: docType, focus_areas: focusAreas } = metadata.data;

    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseDocument(buffer, file.name);

    if (!parsed.text || parsed.text.trim().length < 10) {
      return NextResponse.json({ error: true, message: 'The document appears to be empty or unreadable.' }, { status: 400 });
    }

    const reportId = generateId();
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const fileName = `${reportId}${ext}`;
    const filePath = join(UPLOAD_DIR, fileName);
    await writeFile(filePath, buffer);

    const analysis = await analyzeDocument(parsed.text, jurisdiction, focusAreas);

    const fullAnalysis = JSON.stringify(analysis);
    const riskLevel = analysis.overall_score >= 7 ? 'HIGH' : analysis.overall_score >= 4 ? 'MEDIUM' : analysis.overall_score >= 1 ? 'LOW' : 'NONE';

    db.prepare(`
      INSERT INTO reports (id, user_id, document_name, document_type, country, overall_score, risk_level, verdict, executive_summary, full_analysis, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reportId,
      user.id,
      file.name,
      docType,
      jurisdiction,
      analysis.overall_score,
      riskLevel,
      analysis.verdict || '',
      analysis.executive_summary || '',
      fullAnalysis,
      filePath
    );

    return NextResponse.json({ id: reportId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
    console.error('[scan] Error:', message);
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const reports = db.prepare(
      'SELECT id, document_name, document_type, country, overall_score, risk_level, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC'
    ).all(user.id) as Array<{
      id: string;
      document_name: string;
      document_type: string;
      country: string;
      overall_score: number;
      risk_level: string;
      created_at: string;
    }>;

    return NextResponse.json(reports.map((r) => ({
      id: r.id,
      fileName: r.document_name,
      documentType: r.document_type,
      jurisdiction: r.country,
      riskScore: r.overall_score,
      riskLevel: r.risk_level,
      createdAt: r.created_at,
    })));
  } catch (err: unknown) {
    console.error('[scan:get] Error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json({ error: true, message: 'Failed to fetch reports.' }, { status: 500 });
  }
}
