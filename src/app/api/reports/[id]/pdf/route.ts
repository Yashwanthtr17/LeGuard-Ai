import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: true, message: 'Authentication required.' }, { status: 401 });
  }

  const { id } = await params;
  const report = db.prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?').get(id, user.id) as any;
  if (!report) {
    return NextResponse.json({ error: true, message: 'Report not found.' }, { status: 404 });
  }

  const analysis = JSON.parse(report.full_analysis || '{}');
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
      const metrics = doc.getStringUnitWidth(testLine) * fontSize / scaleFactor;
      if (metrics > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function addSection(title: string, body: string, color?: string) {
    if (y > 250) addPage();
    if (color) {
      doc.setTextColor(color === 'red' ? 229 : color === 'amber' ? 214 : color === 'green' ? 56 : 30);
    } else {
      doc.setTextColor(30, 32, 44);
    }
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

  // Cover Page
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
  doc.text(`Document: ${report.document_name}`, 20, 110);
  doc.text(`Date: ${new Date(report.created_at).toLocaleDateString()}`, 20, 118);
  doc.text(`Country: ${report.country}`, 20, 126);
  doc.text(`Risk Score: ${report.overall_score}/10 - ${report.risk_level}`, 20, 134);
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 220);
  doc.text('This report is AI-generated and does not constitute legal advice.', 20, 270);
  doc.text('Consult a qualified lawyer for legal decisions.', 20, 276);

  // Page 2 - Executive Summary
  addPage();
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, y);
  y += 12;
  addSection('', report.executive_summary || analysis.executive_summary || 'Analysis complete.');

  // Overall Risk Score
  if (y > 220) addPage();
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Risk Score', 20, y);
  y += 12;
  const scoreColor = report.overall_score >= 7 ? '#E53E3E' : report.overall_score >= 4 ? '#D69E2E' : '#38A169';
  doc.setFontSize(48);
  doc.setTextColor(
    report.overall_score >= 7 ? 229 : report.overall_score >= 4 ? 214 : 56,
    report.overall_score >= 7 ? 62 : report.overall_score >= 4 ? 158 : 161,
    report.overall_score >= 7 ? 62 : report.overall_score >= 4 ? 46 : 105
  );
  doc.text(`${report.overall_score}/10`, 20, y + 10);
  y += 20;
  doc.setFontSize(10);
  doc.setTextColor(74, 85, 104);
  const lines = wrapText(analysis.verdict || report.verdict || '', pageWidth - 40);
  for (const line of lines) {
    doc.text(line, 20, y);
    y += 5;
  }
  y += 6;

  // Clause-by-Clause
  if (analysis.clauses && analysis.clauses.length > 0) {
    if (y > 210) addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Clause-by-Clause Analysis', 20, y);
    y += 12;

    for (const clause of analysis.clauses) {
      if (y > 230) addPage();
      const cColor = clause.risk_score >= 7 ? '#E53E3E' : clause.risk_score >= 4 ? '#D69E2E' : '#38A169';
      doc.setFillColor(clause.risk_score >= 7 ? 254 : clause.risk_score >= 4 ? 255 : 240, clause.risk_score >= 7 ? 242 : clause.risk_score >= 4 ? 250 : 245, clause.risk_score >= 7 ? 242 : clause.risk_score >= 4 ? 240 : 240);
      doc.roundedRect(20, y - 2, pageWidth - 40, 5, 2, 2, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 32, 44);
      doc.text(`${clause.name}`, 24, y + 3);
      doc.setFontSize(9);
      doc.setTextColor(clause.risk_score >= 7 ? 229 : clause.risk_score >= 4 ? 214 : 56, clause.risk_score >= 7 ? 62 : clause.risk_score >= 4 ? 158 : 161, clause.risk_score >= 7 ? 62 : clause.risk_score >= 4 ? 46 : 105);
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

  // Country Compliance
  if (analysis.country_compliance && analysis.country_compliance.length > 0) {
    if (y > 220) addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Country-Specific Compliance', 20, y);
    y += 12;

    for (const item of analysis.country_compliance) {
      if (y > 260) addPage();
      const statusColor = item.status === 'COMPLIANT' ? [56, 161, 105] : item.status === 'NON_COMPLIANT' ? [229, 62, 62] : [214, 158, 46];
      const statusIcon = item.status === 'COMPLIANT' ? '✓' : item.status === 'NON_COMPLIANT' ? '✗' : '⚠';
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

  // Risk Summary Table
  if (analysis.clauses && analysis.clauses.length > 0) {
    if (y > 200) addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Risk Summary', 20, y);
    y += 12;

    // Table header
    doc.setFillColor(30, 58, 95);
    doc.rect(20, y - 2, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Clause', 24, y + 4);
    doc.text('Risk Level', 85, y + 4);
    doc.text('Score', 130, y + 4);
    doc.text('Location', 155, y + 4);
    y += 10;

    // Table rows
    for (const clause of analysis.clauses) {
      if (y > 270) addPage();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 32, 44);
      doc.text(clause.name || '', 24, y);
      doc.setTextColor(
        clause.risk_score >= 7 ? 229 : clause.risk_score >= 4 ? 214 : 56,
        clause.risk_score >= 7 ? 62 : clause.risk_score >= 4 ? 158 : 161,
        clause.risk_score >= 7 ? 62 : clause.risk_score >= 4 ? 46 : 105
      );
      const level = clause.risk_level || (clause.risk_score >= 7 ? 'HIGH' : clause.risk_score >= 4 ? 'MEDIUM' : 'LOW');
      doc.text(level, 85, y);
      doc.setTextColor(30, 32, 44);
      doc.text(`${clause.risk_score}/10`, 130, y);
      doc.text(clause.location || '-', 155, y);
      y += 7;
    }
  }

  // Recommendations
  const recommendations: string[] = [];
  if (analysis.clauses) {
    for (const clause of analysis.clauses) {
      if (clause.recommendation) recommendations.push(clause.recommendation);
    }
  }

  if (recommendations.length > 0) {
    if (y > 200) addPage();
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', 20, y);
    y += 12;

    for (const rec of recommendations) {
      if (y > 260) addPage();
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(74, 85, 104);
      const recLines = wrapText(`• ${rec}`, pageWidth - 44);
      for (const line of recLines) {
        doc.text(line, 24, y);
        y += 4;
      }
      y += 2;
    }
  }

  // Disclaimer
  if (y > 250) addPage();
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(160, 174, 192);
  const discLines = wrapText('This report is AI-generated and does not constitute legal advice. Consult a qualified lawyer for legal decisions.', pageWidth - 40);
  for (const line of discLines) {
    doc.text(line, 20, y);
    y += 3;
  }

  // Page numbers
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
      'Content-Disposition': `attachment; filename="${report.document_name.replace(/\.[^.]+$/, '')}_report.pdf"`,
    },
  });
}
