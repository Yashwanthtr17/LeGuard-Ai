import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne, execute } from '@/lib/db-pool';
import { getReport, updateReportPdfPath, logActivity } from '@/lib/services/database';
import { uploadReportPdf } from '@/lib/services/storage';
import { renderReportHtml, type TemplateData } from '@/lib/report-template';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const rateLimit = checkRateLimit(`report_generate:${user.id}`, 3);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: true, message: 'Too many requests. Please wait before generating another report.' },
        { status: 429 }
      );
    }

    const reportData = await getReport(id);
    if (!reportData) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    const report = reportData as unknown as Record<string, unknown>;
    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Access denied.' }, { status: 403 });
    }

    const analysis = report.analysis as Record<string, unknown> | undefined;
    if (!analysis) {
      return NextResponse.json({ error: true, message: 'No analysis data found for this report.' }, { status: 400 });
    }

    const doc = await queryOne<{ original_name: string }>(
      'SELECT original_name FROM public.documents WHERE id = $1',
      [report.document_id as string]
    );

    const documentName = doc?.original_name || (report.title as string) || 'Untitled';

    const clauses = (analysis.clauses as Record<string, unknown>[]) || [];
    const clausesByType: Record<string, Record<string, unknown>[]> = {};
    for (const c of clauses) {
      const type = (c.type as string) || 'regular';
      if (!clausesByType[type]) clausesByType[type] = [];
      clausesByType[type].push(c);
    }

    const riskItems = (analysis.risk_items as { category: string; content: string; sort_order: number }[]) || [];
    const byCategory: Record<string, string[]> = {};
    for (const item of riskItems) {
      const cat = item.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item.content);
    }

    const timelineData = (analysis.timeline_events as { event: string; event_date: string | null; sort_order: number }[]) || [];
    const obligationsData = (analysis.obligations as { party: string; obligation: string; sort_order: number }[]) || [];

    const recommendations: string[] = [];
    for (const c of clauses) {
      if (c.recommendation) recommendations.push(c.recommendation as string);
    }

    const now = new Date();
    const templateData: TemplateData = {
      reportId: id,
      title: (report.title as string) || 'Analysis Report',
      documentName,
      documentType: (analysis.document_type_detected as string) || '',
      jurisdiction: (analysis.country_applied as string) || '',
      analysisDate: analysis.created_at
        ? new Date(analysis.created_at as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      generatedAt: now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
      overallScore: (analysis.overall_score as number) ?? 0,
      riskLevel: (analysis.risk_level as string) || 'LOW',
      verdict: (analysis.verdict as string) || '',
      executiveSummary: (analysis.executive_summary as string) || '',
      plainEnglishSummary: (analysis.plain_english_summary as string) || '',
      governingLaw: (analysis.governing_law as string) || '',
      arbitration: (analysis.arbitration as string) || '',
      jurisdictionText: (analysis.jurisdiction as string) || '',
      confidenceScore: (analysis.confidence_score as number) ?? 0,
      clauses: clauses.map(c => ({
        name: (c.name as string) || '',
        riskScore: (c.risk_score as number) ?? 5,
        riskLevel: (c.risk_level as string) || '',
        plainEnglish: (c.plain_english as string) || '',
        whyItMatters: (c.why_it_matters as string) || '',
        recommendation: (c.recommendation as string) || '',
        location: (c.location as string) || '',
      })),
      hiddenClauses: (clausesByType['hidden'] || []).map(c => ({
        name: (c.name as string) || '', riskScore: (c.risk_score as number) ?? 5,
        riskLevel: (c.risk_level as string) || '', plainEnglish: (c.plain_english as string) || '',
        whyItMatters: (c.why_it_matters as string) || '', recommendation: (c.recommendation as string) || '',
        location: (c.location as string) || '',
      })),
      missingClauses: (clausesByType['missing'] || []).map(c => ({
        name: (c.name as string) || '', riskScore: (c.risk_score as number) ?? 5,
        riskLevel: (c.risk_level as string) || '', plainEnglish: (c.plain_english as string) || '',
        whyItMatters: (c.why_it_matters as string) || '', recommendation: (c.recommendation as string) || '',
        location: (c.location as string) || '',
      })),
      dangerousClauses: (clausesByType['dangerous'] || []).map(c => ({
        name: (c.name as string) || '', riskScore: (c.risk_score as number) ?? 9,
        riskLevel: (c.risk_level as string) || '', plainEnglish: (c.plain_english as string) || '',
        whyItMatters: (c.why_it_matters as string) || '', recommendation: (c.recommendation as string) || '',
        location: (c.location as string) || '',
      })),
      unfairClauses: (clausesByType['unfair'] || []).map(c => ({
        name: (c.name as string) || '', riskScore: (c.risk_score as number) ?? 7,
        riskLevel: (c.risk_level as string) || '', plainEnglish: (c.plain_english as string) || '',
        whyItMatters: (c.why_it_matters as string) || '', recommendation: (c.recommendation as string) || '',
        location: (c.location as string) || '',
      })),
      compliance: ((analysis.country_compliance as Record<string, unknown>[]) || []).map(c => ({
        law: (c.law as string) || '',
        status: (c.status as string) || 'FLAGGED',
        note: (c.note as string) || '',
      })),
      redFlags: byCategory['red_flag'] || [],
      positiveAspects: byCategory['positive_aspect'] || [],
      financialRisks: byCategory['financial_risk'] || [],
      legalRisks: byCategory['legal_risk'] || [],
      penalties: byCategory['penalty'] || [],
      terminationConditions: byCategory['termination_condition'] || [],
      renewalConditions: byCategory['renewal_condition'] || [],
      privacyRisks: byCategory['privacy_risk'] || [],
      liabilityRisks: byCategory['liability_risk'] || [],
      aiSuggestions: byCategory['ai_suggestion'] || [],
      negotiationTips: byCategory['negotiation_tip'] || [],
      timeline: timelineData.map(t => ({
        event: (t.event as string) || '',
        date: (t.event_date as string) || '',
      })),
      obligations: obligationsData.map(o => ({
        party: (o.party as string) || '',
        obligation: (o.obligation as string) || '',
      })),
      recommendations,
    };

    const html = renderReportHtml(templateData);

    let pdfBuffer: Buffer;
    let generationMethod = 'puppeteer';

    try {
      const browser = await (await import('puppeteer')).launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' as const });
      await page.emulateMediaType('print');

      const pdfResult = await page.pdf({
        format: 'A4',
        margin: { top: '22mm', bottom: '25mm', left: '18mm', right: '18mm' },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="width:100%;font-size:7pt;color:#94A3B8;font-family:Inter,sans-serif;
            padding:0 18mm;display:flex;justify-content:space-between;">
            <span>Confidential — Generated by Leguard-AI</span>
            <span>${id} | Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `,
      });

      pdfBuffer = Buffer.from(pdfResult);

      await browser.close();
    } catch (puppeteerErr) {
      console.warn('Puppeteer PDF generation failed, falling back to jsPDF:', puppeteerErr);
      generationMethod = 'jspdf_fallback';

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 297, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text(`Report: ${templateData.documentName}`, 20, 80);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report ID: ${id}`, 20, 100);
      doc.text(`Date: ${templateData.analysisDate}`, 20, 108);
      doc.text(`Risk Score: ${templateData.overallScore.toFixed(1)}/10 - ${templateData.riskLevel}`, 20, 116);

      doc.addPage();
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const summary = templateData.executiveSummary || templateData.verdict || 'Analysis complete.';
      const lines = doc.splitTextToSize(summary, pageWidth - 40);
      let y = 40;
      for (const line of lines) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 6;
      }

      y += 10;
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Top Findings', 20, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const topClauses = templateData.clauses.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
      for (const c of topClauses) {
        if (y > 260) { doc.addPage(); y = 20; }
        const color = c.riskScore >= 7 ? [239, 68, 68] : c.riskScore >= 4 ? [245, 158, 11] : [16, 185, 129];
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`${c.name} — ${c.riskScore.toFixed(1)}/10`, 20, y);
        y += 5;
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
        const whyLines = doc.splitTextToSize(c.whyItMatters || c.plainEnglish || '', pageWidth - 40);
        for (const l of whyLines) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(l, 20, y);
          y += 4;
        }
        y += 4;
      }

      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        doc.text(`Confidential — Generated by Leguard-AI`, 20, 285);
        doc.text(`${id} | Page ${i} of ${pageCount}`, pageWidth - 60, 285);
      }

      pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    }

    const storagePath = await uploadReportPdf(pdfBuffer, user.id, id);

    await updateReportPdfPath(id, storagePath);

    await execute(
      'UPDATE public.reports SET generation_status = $1, generated_at = $2, updated_at = $2 WHERE id = $3',
      ['completed', new Date().toISOString(), id]
    );

    logActivity(user.id, 'report_generate', 'reports', id, {
      method: generationMethod,
      size_bytes: pdfBuffer.length,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      storage_path: storagePath,
      size_bytes: pdfBuffer.length,
      method: generationMethod,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'PDF generation failed.';
    console.error('Report generation error:', err);

    try {
      const { id } = await params;
      await execute(
        'UPDATE public.reports SET generation_status = $1, generation_error = $2, updated_at = $3 WHERE id = $4',
        ['failed', message, new Date().toISOString(), id]
      );
    } catch { }

    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
