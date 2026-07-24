import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/supabase';
import { queryOne } from '@/lib/db-pool';
import { getAnalysis } from '@/lib/services/database';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
    }

    const { id } = await params;

    const report = await queryOne<Record<string, unknown>>(
      'SELECT * FROM public.reports WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (!report) {
      return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
    }

    if (report.user_id !== user.id) {
      return NextResponse.json({ error: true, message: 'Unauthorized.' }, { status: 403 });
    }

    const analysis = await getAnalysis(report.analysis_id as string);
    if (!analysis) {
      return NextResponse.json({ error: true, message: 'Analysis not found.' }, { status: 404 });
    }

    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    function addPage() {
      doc.addPage();
      y = 20;
    }

    function wrapText(text: string, maxWidth: number): string[] {
      const lines: string[] = [];
      const words = text.split(' ');
      const fontSize = doc.getFontSize();
      const scaleFactor = doc.internal.scaleFactor;
      let line = '';
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const w = doc.getStringUnitWidth(testLine) * fontSize / scaleFactor;
        if (w > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    function addSection(title: string, body: string) {
      if (y > 250) addPage();
      doc.setTextColor(30, 32, 44);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(74, 85, 104);
      const lines = wrapText(body, pageWidth - 40);
      for (const line of lines) {
        if (y > 275) addPage();
        doc.text(line, 20, y);
        y += 5;
      }
      y += 4;
    }

    const overallScore = analysis.overall_score ?? 5;
    const riskLevel = analysis.risk_level || 'MEDIUM';
    const scoreColorR = overallScore >= 7 ? 229 : overallScore >= 4 ? 214 : 56;
    const scoreColorG = overallScore >= 7 ? 62 : overallScore >= 4 ? 158 : 161;
    const scoreColorB = overallScore >= 7 ? 62 : overallScore >= 4 ? 46 : 105;

    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 297, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('LeGuard-AI', 20, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Legal Document Risk Analysis Report', 20, 92);
    doc.setFontSize(10);
    doc.text(`Document: ${report.title || 'Untitled'}`, 20, 110);
    doc.text(`Date: ${new Date(report.created_at).toLocaleDateString()}`, 20, 118);
    doc.text(`Country: ${analysis.country_applied || 'N/A'}`, 20, 126);
    doc.text(`Risk Score: ${overallScore}/10 - ${riskLevel}`, 20, 134);
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 220);
    doc.text('This report is AI-generated and does not constitute legal advice.', 20, 270);
    doc.text('Consult a qualified lawyer for legal decisions.', 20, 276);

    addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, y);
    y += 12;
    addSection('', analysis.executive_summary || analysis.verdict || 'Analysis complete.');

    if (y > 220) addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Risk Score', 20, y);
    y += 12;
    doc.setFontSize(48);
    doc.setTextColor(scoreColorR, scoreColorG, scoreColorB);
    doc.text(`${overallScore}/10`, 20, y + 10);
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(74, 85, 104);
    const verdictLines = wrapText(analysis.verdict || '', pageWidth - 40);
    for (const line of verdictLines) {
      doc.text(line, 20, y);
      y += 5;
    }
    y += 6;

    if (analysis.clauses?.length) {
      if (y > 210) addPage();
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Clause-by-Clause Analysis', 20, y);
      y += 12;

      for (const clause of analysis.clauses) {
        if (y > 230) addPage();
        const cR = clause.risk_score >= 7 ? 254 : clause.risk_score >= 4 ? 255 : 240;
        const cG = clause.risk_score >= 7 ? 242 : clause.risk_score >= 4 ? 250 : 245;
        const cB = clause.risk_score >= 7 ? 242 : clause.risk_score >= 4 ? 240 : 240;
        doc.setFillColor(cR, cG, cB);
        doc.roundedRect(20, y - 2, pageWidth - 40, 5, 2, 2, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 32, 44);
        doc.text(clause.name || 'Clause', 24, y + 3);
        doc.setFontSize(9);
        doc.setTextColor(
          clause.risk_score >= 7 ? 229 : clause.risk_score >= 4 ? 214 : 56,
          clause.risk_score >= 7 ? 62 : clause.risk_score >= 4 ? 158 : 161,
          clause.risk_score >= 7 ? 62 : clause.risk_score >= 4 ? 46 : 105
        );
        doc.text(`Risk: ${clause.risk_score}/10`, pageWidth - 60, y + 3);
        y += 12;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(74, 85, 104);
        doc.text('What it says:', 24, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(74, 85, 104);
        const plainLines = wrapText(clause.plain_english || '', pageWidth - 48);
        for (const line of plainLines) {
          if (y > 270) addPage();
          doc.text(line, 28, y);
          y += 4;
        }
        y += 3;
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendation:', 24, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        const recLines = wrapText(clause.recommendation || '', pageWidth - 48);
        for (const line of recLines) {
          if (y > 270) addPage();
          doc.text(line, 28, y);
          y += 4;
        }
        y += 2;
        if (clause.location) {
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(160, 174, 192);
          doc.text(`Found in: ${clause.location}`, 24, y);
          y += 3;
        }
        y += 4;
      }
    }

    if (analysis.country_compliance?.length) {
      if (y > 220) addPage();
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Country-Specific Compliance', 20, y);
      y += 12;

      for (const item of analysis.country_compliance) {
        if (y > 260) addPage();
        const statusColor =
          item.status === 'COMPLIANT'
            ? [56, 161, 105]
            : item.status === 'NON_COMPLIANT'
              ? [229, 62, 62]
              : [214, 158, 46];
        const statusIcon =
          item.status === 'COMPLIANT' ? '\u2713' : item.status === 'NON_COMPLIANT' ? '\u2717' : '\u26A0';
        doc.setFontSize(10);
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.text(`${statusIcon} ${item.law}`, 24, y);
        y += 5;
        doc.setFontSize(9);
        doc.setTextColor(74, 85, 104);
        const noteLines = wrapText(item.note || '', pageWidth - 48);
        for (const line of noteLines) {
          doc.text(line, 28, y);
          y += 4;
        }
        y += 3;
      }
    }

    if (analysis.risk_items?.length) {
      if (y > 220) addPage();
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Risk Summary', 20, y);
      y += 12;

      const categoryLabels: Record<string, string> = {
        red_flags: 'Red Flags',
        positive_aspects: 'Positive Aspects',
        dangerous_clauses: 'Dangerous Clauses',
        unfair_clauses: 'Unfair Clauses',
        financial_risks: 'Financial Risks',
        legal_risks: 'Legal Risks',
        penalties: 'Penalties',
        termination_conditions: 'Termination Conditions',
        renewal_conditions: 'Renewal Conditions',
        privacy_risks: 'Privacy Risks',
        liability_risks: 'Liability Risks',
        ai_suggestions: 'AI Suggestions',
        negotiation_tips: 'Negotiation Tips',
      };

      const grouped: Record<string, string[]> = {};
      for (const item of analysis.risk_items) {
        const label = categoryLabels[item.category] || item.category;
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(item.content);
      }

      for (const [category, items] of Object.entries(grouped)) {
        if (y > 250) addPage();
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text(category, 20, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(74, 85, 104);
        for (const content of items) {
          if (y > 270) addPage();
          const itemLines = wrapText(`\u2022 ${content}`, pageWidth - 44);
          for (const line of itemLines) {
            doc.text(line, 24, y);
            y += 4;
          }
        }
        y += 3;
      }
    }

    if (analysis.timeline_events?.length) {
      if (y > 230) addPage();
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Timeline', 20, y);
      y += 12;

      for (const event of analysis.timeline_events) {
        if (y > 260) addPage();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 32, 44);
        const dateStr = event.event_date || '';
        const label = dateStr ? `${dateStr} - ${event.event}` : event.event;
        doc.text(label, 24, y);
        y += 6;
      }
    }

    if (analysis.obligations?.length) {
      if (y > 230) addPage();
      doc.setTextColor(30, 58, 95);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Obligations', 20, y);
      y += 12;

      doc.setFillColor(30, 58, 95);
      doc.rect(20, y - 2, pageWidth - 40, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Party', 24, y + 4);
      doc.text('Obligation', 70, y + 4);
      y += 10;

      for (const ob of analysis.obligations) {
        if (y > 270) addPage();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 32, 44);
        doc.text(ob.party || '', 24, y);
        const obLines = wrapText(ob.obligation || '', pageWidth - 90);
        doc.text(obLines[0] || '', 70, y);
        y += 5;
        for (let i = 1; i < obLines.length; i++) {
          if (y > 270) addPage();
          doc.text(obLines[i], 70, y);
          y += 4;
        }
        y += 2;
      }
    }

    if (y > 250) addPage();
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 6;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(160, 174, 192);
    const discLines = wrapText(
      'This report is AI-generated and does not constitute legal advice. Consult a qualified lawyer for legal decisions.',
      pageWidth - 40
    );
    for (const line of discLines) {
      doc.text(line, 20, y);
      y += 3;
    }

    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(160, 174, 192);
      if (i > 1) {
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, 285);
      }
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(report.title || 'report').replace(/[^a-zA-Z0-9-_]/g, '_')}_report.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate PDF.';
    return NextResponse.json({ error: true, message }, { status: 500 });
  }
}
