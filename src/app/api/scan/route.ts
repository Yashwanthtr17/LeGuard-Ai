import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSupabaseAdmin } from '@/lib/supabase';
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

    const admin = getSupabaseAdmin();
    const { data: document, error: docError } = await admin
      .from('documents')
      .insert({
        user_id: user.id,
        original_name: file.name,
        file_type: docType,
        file_size: file.size,
        storage_path: storagePath,
        mime_type: file.type || null,
        status: 'processing',
        page_count: parsed.pages,
        text_content: parsed.text,
      })
      .select('id')
      .single();

    if (docError) throw docError;
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

      const { error: clauseError } = await admin.from('clauses').insert(clauseInserts as never);
      if (clauseError) throw clauseError;
    }

    if (analysisResult.country_compliance?.length) {
      const complianceInserts = analysisResult.country_compliance.map((c) => ({
        analysis_id: analysis.id,
        law: c.law,
        status: c.status,
        note: c.note || null,
      }));

      const { error: compError } = await admin.from('country_compliance').insert(complianceInserts as never);
      if (compError) throw compError;
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
      const { error: riskError } = await admin.from('risk_items').insert(riskInserts as never);
      if (riskError) throw riskError;
    }

    if (analysisResult.timeline?.length) {
      const timelineInserts = analysisResult.timeline.map((t, i) => ({
        analysis_id: analysis.id,
        event: t.event,
        event_date: t.date || null,
        sort_order: i,
      }));

      const { error: tlError } = await admin.from('timeline_events').insert(timelineInserts as never);
      if (tlError) throw tlError;
    }

    if (analysisResult.obligations?.length) {
      const obligationInserts = analysisResult.obligations.map((o, i) => ({
        analysis_id: analysis.id,
        party: o.party,
        obligation: o.obligation,
        sort_order: i,
      }));

      const { error: obError } = await admin.from('obligations').insert(obligationInserts as never);
      if (obError) throw obError;
    }

    const { data: report, error: reportError } = await admin
      .from('reports')
      .insert({
        analysis_id: analysis.id,
        user_id: user.id,
        document_id: documentId,
        title: file.name.replace(/\.[^.]+$/, ''),
      })
      .select('id')
      .single();

    if (reportError) throw reportError;

    await admin
      .from('documents')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', documentId);

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
