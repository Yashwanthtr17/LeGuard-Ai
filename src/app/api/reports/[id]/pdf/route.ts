import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne } from '@/lib/db-pool';
import { getReport, logActivity } from '@/lib/services/database';
import { getReportPdfUrl } from '@/lib/services/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const reportData = await getReport(id);
    if (!reportData) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    const report = reportData as unknown as Record<string, unknown>;
    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Access denied.' }, { status: 403 });
    }

    const pdfStoragePath = report.pdf_storage_path as string | null;

    if (pdfStoragePath) {
      try {
        const signedUrl = await getReportPdfUrl(pdfStoragePath);

        logActivity(user.id, 'report_download', 'reports', id, {
          source: 'storage',
        }).catch(() => {});

        return NextResponse.redirect(signedUrl);
      } catch {
        // Fall through to on-the-fly generation if storage retrieval fails
      }
    }

    // On-the-fly generation fallback (matching existing behavior)
    const analysis = report.analysis as Record<string, unknown> | undefined;

    const doc = await queryOne<{ original_name: string }>(
      'SELECT original_name FROM public.documents WHERE id = $1',
      [report.document_id as string]
    );

    const documentName = doc?.original_name || (report.title as string) || 'Untitled';

    const { jsPDF } = await import('jspdf');

    const pdfDoc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    let y = 20;

    function addPage() {
      pdfDoc.addPage();
      y = 20;
    }

    function wrapText(text: string, maxWidth: number): string[] {
      return pdfDoc.splitTextToSize(text || '', maxWidth);
    }

    // Cover Page
    pdfDoc.setFillColor(30, 41, 59);
    pdfDoc.rect(0, 0, pageWidth, 297, 'F');
    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFontSize(28);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.text('LeGuard-AI', 20, 60);
    pdfDoc.setFontSize(12);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.text('Legal Document Risk Analysis Report', 20, 72);
    pdfDoc.setFontSize(10);
    pdfDoc.text(`Document: ${documentName}`, 20, 95);
    pdfDoc.text(`Report ID: ${id}`, 20, 103);
    pdfDoc.text(`Date: ${report.created_at ? new Date(report.created_at as string).toLocaleDateString() : new Date().toLocaleDateString()}`, 20, 111);
    const score = (analysis?.overall_score as number) ?? 0;
    const level = (analysis?.risk_level as string) || 'LOW';
    pdfDoc.text(`Risk Score: ${score.toFixed(1)}/10 - ${level}`, 20, 119);
    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(148, 163, 184);
    pdfDoc.text('This report is AI-generated and does not constitute legal advice.', 20, 270);
    pdfDoc.text('Consult a qualified lawyer for legal decisions.', 20, 276);

    // Executive Summary
    addPage();
    pdfDoc.setTextColor(30, 41, 59);
    pdfDoc.setFontSize(18);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.text('Executive Summary', 20, y);
    y += 12;

    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(10);
    pdfDoc.setTextColor(71, 85, 105);
    const execSummary = (analysis?.executive_summary as string) || (analysis?.verdict as string) || 'Analysis complete.';
    const summaryLines = wrapText(execSummary, pageWidth - 40);
    for (const line of summaryLines) {
      if (y > 275) addPage();
      pdfDoc.text(line, 20, y);
      y += 5;
    }

    // Risk Score
    y += 6;
    if (y > 240) addPage();
    pdfDoc.setTextColor(30, 41, 59);
    pdfDoc.setFontSize(18);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.text('Risk Score', 20, y);
    y += 12;

    const rColor = score >= 7 ? [239, 68, 68] : score >= 4 ? [245, 158, 11] : [16, 185, 129];
    pdfDoc.setFontSize(36);
    pdfDoc.setTextColor(rColor[0], rColor[1], rColor[2]);
    pdfDoc.text(`${score.toFixed(1)}/10`, 20, y);
    y += 14;

    pdfDoc.setFontSize(10);
    pdfDoc.setTextColor(71, 85, 105);
    const verdict = (analysis?.verdict as string) || '';
    if (verdict) {
      const vLines = wrapText(verdict, pageWidth - 40);
      for (const line of vLines) {
        if (y > 275) addPage();
        pdfDoc.text(line, 20, y);
        y += 5;
      }
      y += 4;
    }

    // Top Findings
    const clauses = (analysis?.clauses as Record<string, unknown>[]) || [];
    const topClauses = clauses.sort((a, b) => (b.risk_score as number) - (a.risk_score as number)).filter(c => (c.risk_score as number) >= 4).slice(0, 10);

    if (topClauses.length > 0) {
      if (y > 220) addPage();
      pdfDoc.setTextColor(30, 41, 59);
      pdfDoc.setFontSize(16);
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Top Items to Review', 20, y);
      y += 10;

      for (const clause of topClauses) {
        if (y > 250) addPage();
        const cScore = (clause.risk_score as number) || 5;
        const cColor = cScore >= 7 ? [239, 68, 68] : cScore >= 4 ? [245, 158, 11] : [16, 185, 129];
        pdfDoc.setFillColor(cColor[0], cColor[1], cColor[2]);
        pdfDoc.rect(20, y - 1, 4, 14, 'F');
        pdfDoc.setTextColor(30, 32, 44);
        pdfDoc.setFontSize(10);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.text(`${clause.name as string}`, 28, y + 4);
        pdfDoc.setTextColor(cColor[0], cColor[1], cColor[2]);
        pdfDoc.setFontSize(8);
        pdfDoc.text(`Risk: ${cScore.toFixed(1)}/10`, pageWidth - 50, y + 4);
        y += 12;
        pdfDoc.setTextColor(71, 85, 105);
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setFontSize(9);
        const why = (clause.why_it_matters as string) || (clause.plain_english as string) || '';
        const whyLines = wrapText(why, pageWidth - 56);
        for (const line of whyLines) {
          if (y > 275) addPage();
          pdfDoc.text(line, 28, y);
          y += 4;
        }
        y += 4;
      }
    }

    // Detailed Analysis
    if (clauses.length > 0) {
      addPage();
      y = 20;
      pdfDoc.setTextColor(30, 41, 59);
      pdfDoc.setFontSize(16);
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Detailed Clause Analysis', 20, y);
      y += 12;

      for (const clause of clauses) {
        if (y > 240) addPage();
        const cScore = (clause.risk_score as number) || 5;
        pdfDoc.setFillColor(248, 250, 252);
        pdfDoc.roundedRect(20, y - 2, pageWidth - 40, 6, 2, 2, 'F');
        pdfDoc.setTextColor(30, 32, 44);
        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(10);
        pdfDoc.text(clause.name as string, 24, y + 3);
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(
          cScore >= 7 ? 239 : cScore >= 4 ? 245 : 16,
          cScore >= 7 ? 68 : cScore >= 4 ? 158 : 185,
          cScore >= 7 ? 68 : cScore >= 4 ? 46 : 129
        );
        pdfDoc.text(`Risk: ${cScore.toFixed(1)}/10`, pageWidth - 50, y + 3);
        y += 14;

        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(22, 163, 74);
        pdfDoc.text('What it says:', 24, y);
        y += 5;
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setTextColor(71, 85, 105);
        const plainLines = wrapText((clause.plain_english as string) || '', pageWidth - 48);
        for (const l of plainLines) {
          if (y > 275) addPage();
          pdfDoc.text(l, 28, y);
          y += 4;
        }
        y += 2;

        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setTextColor(217, 119, 6);
        pdfDoc.text('Why it matters:', 24, y);
        y += 5;
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setTextColor(71, 85, 105);
        const whyLines = wrapText((clause.why_it_matters as string) || '', pageWidth - 48);
        for (const l of whyLines) {
          if (y > 275) addPage();
          pdfDoc.text(l, 28, y);
          y += 4;
        }
        y += 2;

        pdfDoc.setFont('helvetica', 'bold');
        pdfDoc.setTextColor(37, 99, 235);
        pdfDoc.text('Recommendation:', 24, y);
        y += 5;
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setTextColor(71, 85, 105);
        const recLines = wrapText((clause.recommendation as string) || '', pageWidth - 48);
        for (const l of recLines) {
          if (y > 275) addPage();
          pdfDoc.text(l, 28, y);
          y += 4;
        }

        if (clause.location) {
          pdfDoc.setFont('helvetica', 'italic');
          pdfDoc.setTextColor(148, 163, 184);
          pdfDoc.text(`Found in: ${clause.location as string}`, 24, y + 2);
          y += 4;
        }
        y += 6;
      }
    }

    // Recommendations
    const recommendations: string[] = [];
    for (const c of clauses) {
      if (c.recommendation) recommendations.push(c.recommendation as string);
    }
    if (recommendations.length > 0) {
      addPage();
      y = 20;
      pdfDoc.setTextColor(30, 41, 59);
      pdfDoc.setFontSize(16);
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Recommendations', 20, y);
      y += 12;

      for (const rec of recommendations) {
        if (y > 260) addPage();
        pdfDoc.setFontSize(9);
        pdfDoc.setFont('helvetica', 'normal');
        pdfDoc.setTextColor(71, 85, 105);
        const recLines = wrapText(`• ${rec}`, pageWidth - 44);
        for (const l of recLines) {
          pdfDoc.text(l, 24, y);
          y += 4;
        }
        y += 2;
      }
    }

    // Disclaimer
    if (y > 250) addPage();
    pdfDoc.setDrawColor(226, 232, 240);
    pdfDoc.line(20, y, pageWidth - 20, y);
    y += 6;
    pdfDoc.setFontSize(7);
    pdfDoc.setFont('helvetica', 'italic');
    pdfDoc.setTextColor(148, 163, 184);
    const discLines = wrapText(
      'This report is AI-generated and does not constitute legal advice. It is intended for informational and educational purposes only. Always consult a qualified lawyer for legal decisions.',
      pageWidth - 40
    );
    for (const l of discLines) {
      pdfDoc.text(l, 20, y);
      y += 3;
    }

    // Footer on all pages
    const pageCount = pdfDoc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdfDoc.setPage(i);
      pdfDoc.setFontSize(6);
      pdfDoc.setTextColor(148, 163, 184);
      pdfDoc.text('Confidential — Generated by Leguard-AI', 20, 285);
      pdfDoc.text(`${id} | Page ${i} of ${pageCount} | ${new Date().toLocaleDateString()}`, pageWidth - 70, 285);
    }

    const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

    logActivity(user.id, 'report_download', 'reports', id, {
      source: 'on_the_fly',
      size_bytes: pdfBuffer.length,
    }).catch(() => {});

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${documentName.replace(/\.[^.]+$/, '')}_report.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to download report PDF.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
