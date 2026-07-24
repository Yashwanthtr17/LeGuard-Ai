import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { query, queryOne, execute } from '@/lib/db-pool';
import {
  createAnalysis,
  getUserReports,
  logActivity,
  logAiUsage,
  createNotification,
} from '@/lib/services/database';
import { uploadDocument } from '@/lib/services/storage';
import { parseDocument } from '@/lib/document-parser';
import { analyzeDocument } from '@/lib/ai';
import { scanDocumentSchema } from '@/lib/schemas';
import { validateFile } from '@/lib/validators';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const rateLimit = checkRateLimit(`scan:${user.id}`, 5);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: 'Too many requests. Please wait before scanning again.' },
        { status: 429 }
      );
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const parsed = await parseDocument(buffer, file.name);

    if (!parsed.text || parsed.text.trim().length < 10) {
      return NextResponse.json(
        { error: true, message: 'The document appears to be empty or unreadable.' },
        { status: 400 }
      );
    }

    const storagePath = await uploadDocument(buffer, user.id, file.name);

    const document = await queryOne<{ id: string }>(
      `INSERT INTO public.documents (user_id, original_name, file_type, file_size, storage_path, mime_type, status, page_count, text_content)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [user.id, file.name, docType, file.size, storagePath, file.type || null, 'processing', parsed.pages, parsed.text]
    );

    if (!document) throw new Error('Failed to create document.');
    const documentId = document.id;

    const analysisResult = await analyzeDocument(parsed.text, jurisdiction, focusAreas);

    const processingTime = Date.now() - startTime;

    const riskLevel =
      analysisResult.overall_score >= 7
        ? 'HIGH'
        : analysisResult.overall_score >= 4
          ? 'MEDIUM'
          : analysisResult.overall_score >= 1
            ? 'LOW'
            : 'NONE';

    const analysis = await createAnalysis({
      document_id: documentId,
      user_id: user.id,
      status: 'completed',
      overall_score: analysisResult.overall_score,
      risk_level: riskLevel,
      verdict: analysisResult.verdict || null,
      executive_summary: analysisResult.executive_summary || null,
      plain_english_summary: analysisResult.plain_english_summary || null,
      country_applied: jurisdiction,
      document_type_detected: analysisResult.document_type_detected || null,
      governing_law: analysisResult.governing_law || null,
      arbitration: analysisResult.arbitration || null,
      jurisdiction: analysisResult.jurisdiction || null,
      confidence_score: analysisResult.confidence_score ?? 85,
      full_result: analysisResult as never,
      processing_time_ms: processingTime,
      completed_at: new Date().toISOString(),
    });

    if (analysisResult.clauses?.length) {
      const clauseInserts = analysisResult.clauses.map((c, i) => ({
        analysis_id: analysis.id,
        name: c.name,
        risk_score: c.risk_score,
        risk_level: c.risk_level || (c.risk_score >= 7 ? 'HIGH' : c.risk_score >= 4 ? 'MEDIUM' : 'LOW'),
        plain_english: c.plain_english || null,
        why_it_matters: c.why_it_matters || null,
        recommendation: c.recommendation || null,
        location: c.location || null,
        sort_order: i,
      }));

      for (const clause of clauseInserts) {
        await execute(
          `INSERT INTO public.clauses (analysis_id, name, risk_score, risk_level, plain_english, why_it_matters, recommendation, location, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [clause.analysis_id, clause.name, clause.risk_score, clause.risk_level, clause.plain_english, clause.why_it_matters, clause.recommendation, clause.location, clause.sort_order]
        );
      }
    }

    if (analysisResult.country_compliance?.length) {
      const complianceInserts = analysisResult.country_compliance.map((c) => ({
        analysis_id: analysis.id,
        law: c.law,
        status: c.status,
        note: c.note || null,
      }));

      for (const item of complianceInserts) {
        await execute(
          'INSERT INTO public.country_compliance (analysis_id, law, status, note) VALUES ($1, $2, $3, $4)',
          [item.analysis_id, item.law, item.status, item.note]
        );
      }
    }

    const riskCategories: Record<string, string[]> = {
      red_flags: analysisResult.red_flags || [],
      positive_aspects: analysisResult.positive_aspects || [],
      dangerous_clauses: analysisResult.dangerous_clauses || [],
      unfair_clauses: analysisResult.unfair_clauses || [],
      financial_risks: analysisResult.financial_risks || [],
      legal_risks: analysisResult.legal_risks || [],
      penalties: analysisResult.penalties || [],
      termination_conditions: analysisResult.termination_conditions || [],
      renewal_conditions: analysisResult.renewal_conditions || [],
      privacy_risks: analysisResult.privacy_risks || [],
      liability_risks: analysisResult.liability_risks || [],
      ai_suggestions: analysisResult.ai_suggestions || [],
      negotiation_tips: analysisResult.negotiation_tips || [],
    };

    const riskInserts: { analysis_id: string; category: string; content: string; sort_order: number }[] = [];
    let sortOrder = 0;
    for (const [category, items] of Object.entries(riskCategories)) {
      for (const content of items) {
        riskInserts.push({
          analysis_id: analysis.id,
          category,
          content,
          sort_order: sortOrder++,
        });
      }
    }

    if (riskInserts.length) {
      for (const item of riskInserts) {
        await execute(
          'INSERT INTO public.risk_items (analysis_id, category, content, sort_order) VALUES ($1, $2, $3, $4)',
          [item.analysis_id, item.category, item.content, item.sort_order]
        );
      }
    }

    if (analysisResult.timeline?.length) {
      const timelineInserts = analysisResult.timeline.map((t, i) => ({
        analysis_id: analysis.id,
        event: t.event,
        event_date: t.date || null,
        sort_order: i,
      }));

      for (const event of timelineInserts) {
        await execute(
          'INSERT INTO public.timeline_events (analysis_id, event, event_date, sort_order) VALUES ($1, $2, $3, $4)',
          [event.analysis_id, event.event, event.event_date, event.sort_order]
        );
      }
    }

    if (analysisResult.obligations?.length) {
      const obligationInserts = analysisResult.obligations.map((o, i) => ({
        analysis_id: analysis.id,
        party: o.party,
        obligation: o.obligation,
        sort_order: i,
      }));

      for (const ob of obligationInserts) {
        await execute(
          'INSERT INTO public.obligations (analysis_id, party, obligation, sort_order) VALUES ($1, $2, $3, $4)',
          [ob.analysis_id, ob.party, ob.obligation, ob.sort_order]
        );
      }
    }

    const report = await queryOne<{ id: string }>(
      `INSERT INTO public.reports (analysis_id, user_id, document_id, title)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [analysis.id, user.id, documentId, file.name.replace(/\.[^.]+$/, '')]
    );

    if (!report) throw new Error('Failed to create report.');

    await execute(
      'UPDATE public.documents SET status = $1, updated_at = $2 WHERE id = $3',
      ['completed', new Date().toISOString(), documentId]
    );

    await createNotification(
      user.id,
      'analysis_complete',
      'Document Analysis Complete',
      `Analysis for "${file.name}" is ready. Risk score: ${analysisResult.overall_score}/10 - ${riskLevel}`,
      { report_id: report.id, analysis_id: analysis.id, risk_level: riskLevel }
    );

    await logActivity(user.id, 'scan_complete', 'analyses', analysis.id, {
      document_id: documentId,
      file_name: file.name,
      risk_level: riskLevel,
      overall_score: analysisResult.overall_score,
      processing_time_ms: processingTime,
    });

    await logAiUsage(
      user.id,
      'ai',
      'default',
      Math.ceil(parsed.text.length / 4),
      JSON.stringify(analysisResult).length / 4,
      processingTime,
      true
    );

    return NextResponse.json({
      id: report.id,
      analysisId: analysis.id,
      documentId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const search = searchParams.get('search') || undefined;
    const isFavorite = searchParams.has('favorite')
      ? searchParams.get('favorite') === 'true'
      : undefined;
    const isArchived = searchParams.has('archived')
      ? searchParams.get('archived') === 'true'
      : undefined;
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';

    const result = await getUserReports(user.id, {
      page,
      limit,
      search,
      isFavorite,
      isArchived,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      data: result.data,
      total: result.total,
      page,
      total_pages: Math.ceil(result.total / limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reports.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
