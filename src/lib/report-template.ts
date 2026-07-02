export interface TemplateData {
  reportId: string
  title: string
  documentName: string
  documentType: string
  jurisdiction: string
  analysisDate: string
  generatedAt: string
  overallScore: number
  riskLevel: string
  verdict: string
  executiveSummary: string
  plainEnglishSummary: string
  governingLaw: string
  arbitration: string
  jurisdictionText: string
  confidenceScore: number
  clauses: TemplateClause[]
  hiddenClauses: TemplateClause[]
  missingClauses: TemplateClause[]
  dangerousClauses: TemplateClause[]
  unfairClauses: TemplateClause[]
  compliance: TemplateCompliance[]
  redFlags: string[]
  positiveAspects: string[]
  financialRisks: string[]
  legalRisks: string[]
  penalties: string[]
  terminationConditions: string[]
  renewalConditions: string[]
  privacyRisks: string[]
  liabilityRisks: string[]
  aiSuggestions: string[]
  negotiationTips: string[]
  timeline: TemplateTimelineEvent[]
  obligations: TemplateObligation[]
  recommendations: string[]
}

export interface TemplateClause {
  name: string
  riskScore: number
  riskLevel: string
  plainEnglish: string
  whyItMatters: string
  recommendation: string
  location: string
}

export interface TemplateCompliance {
  law: string
  status: string
  note: string
}

export interface TemplateTimelineEvent {
  event: string
  date: string
}

export interface TemplateObligation {
  party: string
  obligation: string
}

function getRiskColor(score: number): string {
  if (score >= 7) return '#EF4444'
  if (score >= 4) return '#F59E0B'
  return '#10B981'
}

function getRiskLabel(score: number): string {
  if (score >= 7) return 'HIGH'
  if (score >= 4) return 'MEDIUM'
  return 'LOW'
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function renderReportHtml(data: TemplateData): string {
  const {
    reportId, title, documentName, documentType, jurisdiction,
    analysisDate, generatedAt, overallScore, riskLevel, verdict,
    executiveSummary, plainEnglishSummary, governingLaw, arbitration,
    jurisdictionText, confidenceScore,
    clauses, hiddenClauses, missingClauses, dangerousClauses, unfairClauses,
    compliance, redFlags, positiveAspects,
    financialRisks, legalRisks, penalties, terminationConditions,
    renewalConditions, privacyRisks, liabilityRisks,
    aiSuggestions, negotiationTips, timeline, obligations, recommendations,
  } = data

  const scoreColor = getRiskColor(overallScore)
  const allClauses = [...clauses].sort((a, b) => b.riskScore - a.riskScore)
  const topFindings = allClauses.filter(c => c.riskScore >= 4).slice(0, 10)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} - Analysis Report</title>
<style>
  @page {
    size: A4;
    margin: 22mm 18mm 25mm 18mm;
    @bottom-left {
      content: element(footerLeft);
      font-size: 7pt;
      color: #94A3B8;
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    }
    @bottom-right {
      content: element(footerRight);
      font-size: 7pt;
      color: #94A3B8;
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    }
    @top-left {
      content: element(headerLeft);
      font-size: 7pt;
      color: #94A3B8;
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    }
  }
  @page:first {
    @top-left { content: none; }
    @bottom-left { content: none; }
    @bottom-right { content: none; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    color: #1E293B;
    line-height: 1.6;
    font-size: 9.5pt;
    position: relative;
  }
  .watermark {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 999;
    overflow: hidden;
  }
  .watermark-text {
    font-size: 120pt;
    font-weight: 900;
    color: rgba(37, 99, 235, 0.06);
    transform: rotate(-35deg);
    white-space: nowrap;
    letter-spacing: 18pt;
    user-select: none;
    line-height: 1;
  }
  .page-break { page-break-before: always; }

  /* Cover page */
  .cover {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 90vh;
    padding: 0;
    position: relative;
  }
  .cover-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    z-index: -1;
  }
  .cover-bg-accent {
    position: absolute;
    top: -120px; right: -120px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
  }
  .cover-content {
    padding: 40px 50px;
    position: relative;
    z-index: 1;
  }
  .cover-logo { margin-bottom: 60px; }
  .cover-logo-text {
    font-size: 28pt;
    font-weight: 800;
    color: #FFFFFF;
    letter-spacing: -0.5px;
  }
  .cover-logo-accent {
    color: #60A5FA;
  }
  .cover-label {
    font-size: 8pt;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 4px;
  }
  .cover-title {
    font-size: 22pt;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.3;
    margin-bottom: 30px;
  }
  .cover-meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 24px;
    font-size: 9pt;
  }
  .cover-meta-label {
    color: rgba(255,255,255,0.4);
    font-weight: 500;
  }
  .cover-meta-value {
    color: rgba(255,255,255,0.85);
  }
  .cover-risk {
    margin-top: 40px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .cover-score {
    font-size: 36pt;
    font-weight: 800;
    color: ${scoreColor};
  }
  .cover-badge {
    display: inline-block;
    padding: 4px 16px;
    border-radius: 999px;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #FFFFFF;
    background-color: ${scoreColor};
  }

  /* Content pages */
  .section { margin-bottom: 28px; }
  .section-title {
    font-size: 14pt;
    font-weight: 700;
    color: #1E293B;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid #2563EB;
  }
  .section-subtitle {
    font-size: 8pt;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 12px;
  }
  .text-body { color: #334155; line-height: 1.7; margin-bottom: 8px; }
  .text-muted { color: #64748B; font-size: 8pt; }

  /* Risk gauge */
  .risk-gauge-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
  }
  .risk-gauge {
    position: relative;
    width: 140px;
    height: 140px;
  }
  .risk-gauge-svg { width: 100%; height: 100%; }
  .risk-gauge-value {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-size: 28pt;
    font-weight: 800;
    color: ${scoreColor};
  }
  .risk-gauge-label {
    font-size: 7pt;
    font-weight: 600;
    color: #64748B;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 4px;
  }
  .risk-verdict {
    max-width: 500px;
    margin: 12px auto 0;
    text-align: center;
    font-size: 9pt;
    color: #475569;
    line-height: 1.6;
  }
  .risk-meter {
    width: 100%;
    max-width: 400px;
    margin: 16px auto 0;
  }
  .risk-meter-track {
    height: 8px;
    background: #E2E8F0;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }
  .risk-meter-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #10B981, #F59E0B, #EF4444);
  }
  .risk-meter-marker {
    position: absolute;
    top: -3px;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 2px solid ${scoreColor};
    transform: translateX(-50%);
  }

  /* Executive Summary */
  .exec-summary {
    background: #F8FAFC;
    border-left: 3px solid #2563EB;
    padding: 16px 20px;
    border-radius: 4px;
    font-size: 9.5pt;
    line-height: 1.7;
    color: #334155;
  }

  /* Clause Cards */
  .clause-card {
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 14px 16px;
    margin-bottom: 10px;
    page-break-inside: avoid;
  }
  .clause-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .clause-name {
    font-weight: 700;
    font-size: 10pt;
    color: #1E293B;
  }
  .clause-risk-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }
  .clause-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .clause-box {
    padding: 10px 12px;
    border-radius: 4px;
    font-size: 8.5pt;
    line-height: 1.5;
  }
  .clause-box-label {
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .clause-box-what {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
  }
  .clause-box-what .clause-box-label { color: #16A34A; }
  .clause-box-why {
    background: #FFFBEB;
    border: 1px solid #FDE68A;
  }
  .clause-box-why .clause-box-label { color: #D97706; }
  .clause-box-rec {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    grid-column: 1 / -1;
  }
  .clause-box-rec .clause-box-label { color: #2563EB; }
  .clause-location {
    margin-top: 6px;
    font-size: 7.5pt;
    color: #94A3B8;
    font-style: italic;
  }

  /* Compliance */
  .compliance-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 6px;
    font-size: 8.5pt;
  }
  .compliance-compliant { background: #F0FDF4; border: 1px solid #BBF7D0; }
  .compliance-noncompliant { background: #FEF2F2; border: 1px solid #FECACA; }
  .compliance-flagged { background: #FFFBEB; border: 1px solid #FDE68A; }

  /* Lists */
  .item-list { list-style: none; padding: 0; }
  .item-list li {
    padding: 6px 0;
    padding-left: 16px;
    position: relative;
    font-size: 8.5pt;
    color: #334155;
    border-bottom: 1px solid #F1F5F9;
  }
  .item-list li:last-child { border-bottom: none; }
  .item-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 12px;
    width: 5px; height: 5px;
    border-radius: 50%;
  }
  .item-red li::before { background: #EF4444; }
  .item-green li::before { background: #10B981; }
  .item-amber li::before { background: #F59E0B; }
  .item-blue li::before { background: #3B82F6; }

  /* Timeline */
  .timeline { position: relative; padding-left: 24px; }
  .timeline::before {
    content: '';
    position: absolute;
    left: 6px; top: 0; bottom: 0;
    width: 2px;
    background: #E2E8F0;
  }
  .timeline-item {
    position: relative;
    padding-bottom: 14px;
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 4px;
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 2px solid #2563EB;
  }
  .timeline-event { font-weight: 600; font-size: 9pt; color: #1E293B; }
  .timeline-date { font-size: 7.5pt; color: #64748B; }

  /* Obligations */
  .obligation-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 12px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    margin-bottom: 6px;
    font-size: 8.5pt;
  }
  .obligation-party {
    padding: 1px 8px;
    background: #EFF6FF;
    color: #2563EB;
    font-size: 7.5pt;
    font-weight: 700;
    border-radius: 4px;
    white-space: nowrap;
  }

  /* Recommendations */
  .rec-list { list-style: none; counter-reset: rec; }
  .rec-list li {
    counter-increment: rec;
    padding: 8px 12px 8px 36px;
    position: relative;
    margin-bottom: 6px;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    font-size: 8.5pt;
    color: #334155;
  }
  .rec-list li::before {
    content: counter(rec);
    position: absolute;
    left: 10px; top: 8px;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #2563EB;
    color: #FFFFFF;
    font-size: 7pt;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Disclaimer */
  .disclaimer {
    margin-top: 30px;
    padding: 16px 20px;
    border-top: 1px solid #E2E8F0;
    text-align: center;
  }
  .disclaimer-icon {
    display: inline-block;
    width: 24px; height: 24px;
    border-radius: 50%;
    background: #F1F5F9;
    text-align: center;
    line-height: 24px;
    font-size: 10pt;
    margin-bottom: 6px;
  }
  .disclaimer-title {
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #64748B;
    margin-bottom: 4px;
  }
  .disclaimer-text {
    font-size: 7.5pt;
    font-style: italic;
    color: #94A3B8;
    line-height: 1.5;
    max-width: 500px;
    margin: 0 auto;
  }

  /* Print helpers */
  .show-print { display: none; }
  @media print {
    .show-print { display: block; }
    .no-print { display: none; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }

  /* Responsive adjustments */
  @media screen and (max-width: 600px) {
    .cover-content { padding: 24px; }
    .cover-title { font-size: 16pt; }
    .clause-grid { grid-template-columns: 1fr; }
    .cover-meta { grid-template-columns: 1fr; gap: 2px; }
  }
</style>
</head>
<body>

<div class="watermark">
  <div class="watermark-text">Leguard-AI</div>
</div>

<!-- ============================== COVER ============================== -->
<div class="cover">
  <div class="cover-bg">
    <div class="cover-bg-accent"></div>
  </div>
  <div class="cover-content">
    <div class="cover-logo">
      <div class="cover-logo-text">Le<span class="cover-logo-accent">guard</span>-AI</div>
    </div>
    <div class="cover-label">Legal Risk Analysis Report</div>
    <div class="cover-title">${esc(documentName)}</div>
    <div class="cover-meta">
      <span class="cover-meta-label">Report ID</span>
      <span class="cover-meta-value">${esc(reportId)}</span>
      <span class="cover-meta-label">Analysis Date</span>
      <span class="cover-meta-value">${esc(analysisDate)}</span>
      <span class="cover-meta-label">Document Type</span>
      <span class="cover-meta-value">${esc(documentType || 'Not specified')}</span>
      <span class="cover-meta-label">Jurisdiction</span>
      <span class="cover-meta-value">${esc(jurisdiction)}</span>
      <span class="cover-meta-label">Generated</span>
      <span class="cover-meta-value">${esc(generatedAt)}</span>
    </div>
    <div class="cover-risk">
      <span class="cover-score">${overallScore.toFixed(1)}</span>
      <div>
        <div class="cover-badge">${esc(riskLevel)} Risk</div>
        <div style="color:rgba(255,255,255,0.4);font-size:8pt;margin-top:4px;">out of 10</div>
      </div>
    </div>
  </div>
</div>

<!-- ============================== PAGE 2+ ============================== -->

<!-- Footer running elements -->
<div class="show-print" style="position: running(footerLeft);">
  Confidential — Generated by Leguard-AI
</div>
<div class="show-print" style="position: running(footerRight);">
  ${esc(reportId)} | Page <span class="pageNumber"></span> of <span class="totalPages"></span>
</div>
<div class="show-print" style="position: running(headerLeft);">
  ${esc(documentName)}
</div>

<!-- ===== EXECUTIVE SUMMARY ===== -->
<div class="page-break"></div>
<div class="section">
  <div class="section-title">Executive Summary</div>
  <div class="exec-summary">
    ${esc(executiveSummary || verdict || 'Analysis complete.')}
  </div>
</div>

<!-- ===== RISK SCORE ===== -->
<div class="section">
  <div class="section-title">Risk Assessment</div>
  <div class="risk-gauge-container">
    <div class="risk-gauge">
      <svg class="risk-gauge-svg" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="55" fill="none" stroke="#E2E8F0" stroke-width="10"/>
        <circle cx="70" cy="70" r="55" fill="none" stroke="${scoreColor}" stroke-width="10"
          stroke-dasharray="${2 * Math.PI * 55}"
          stroke-dashoffset="${2 * Math.PI * 55 * (1 - overallScore / 10)}"
          stroke-linecap="round" transform="rotate(-90 70 70)"/>
      </svg>
      <div class="risk-gauge-value">${overallScore.toFixed(1)}</div>
    </div>
    <div class="risk-gauge-label">Overall Risk Score</div>
    ${confidenceScore > 0 ? `<div style="font-size:8pt;color:#64748B;margin-top:4px;">Confidence: ${(confidenceScore * 10).toFixed(0)}%</div>` : ''}
    ${verdict ? `<div class="risk-verdict">${esc(verdict)}</div>` : ''}
    <div class="risk-meter">
      <div class="risk-meter-track">
        <div class="risk-meter-fill" style="width:${(overallScore / 10) * 100}%"></div>
        <div class="risk-meter-marker" style="left:${(overallScore / 10) * 100}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:7pt;color:#94A3B8;margin-top:4px;">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  </div>
</div>

<!-- ===== TOP FINDINGS (KEY ITEMS TO REVIEW) ===== -->
${topFindings.length > 0 ? `
<div class="section">
  <div class="section-title">Top Items to Review</div>
  <div class="section-subtitle">Prioritized by risk severity — these clauses need your attention</div>
  ${topFindings.map((c, i) => `
  <div class="clause-card" style="border-left:3px solid ${getRiskColor(c.riskScore)};">
    <div class="clause-header">
      <span class="clause-name">${i + 1}. ${esc(c.name)}</span>
      <span class="clause-risk-badge" style="background:${getRiskColor(c.riskScore)};color:#FFFFFF;">
        ${esc(getRiskLabel(c.riskScore))} ${c.riskScore.toFixed(1)}
      </span>
    </div>
    <div style="font-size:8pt;color:#64748B;line-height:1.5;">
      <strong>Why this matters:</strong> ${esc(c.whyItMatters || c.plainEnglish || '')}
    </div>
    ${c.location ? `<div style="font-size:7.5pt;color:#94A3B8;margin-top:4px;">📍 ${esc(c.location)}</div>` : ''}
  </div>`).join('')}
</div>` : ''}

<!-- ===== DETAILED ANALYSIS ===== -->
${allClauses.length > 0 ? `
<div class="page-break"></div>
<div class="section">
  <div class="section-title">Detailed Clause Analysis</div>
  <div class="section-subtitle">Section-by-section breakdown with AI commentary</div>
  ${allClauses.map(c => `
  <div class="clause-card">
    <div class="clause-header">
      <span class="clause-name">${esc(c.name)}</span>
      <span class="clause-risk-badge" style="background:${getRiskColor(c.riskScore)}20;color:${getRiskColor(c.riskScore)};border:1px solid ${getRiskColor(c.riskScore)}40;">
        ${esc(getRiskLabel(c.riskScore))} ${c.riskScore.toFixed(1)}/10
      </span>
    </div>
    <div class="clause-grid">
      <div class="clause-box clause-box-what">
        <div class="clause-box-label">What it says</div>
        ${esc(c.plainEnglish || 'No description available.')}
      </div>
      <div class="clause-box clause-box-why">
        <div class="clause-box-label">Why it matters</div>
        ${esc(c.whyItMatters || 'Review this clause carefully.')}
      </div>
      <div class="clause-box clause-box-rec">
        <div class="clause-box-label">Recommendation</div>
        ${esc(c.recommendation || 'No specific recommendation.')}
      </div>
    </div>
    ${c.location ? `<div class="clause-location">Found in: ${esc(c.location)}</div>` : ''}
  </div>`).join('')}
</div>` : ''}

<!-- ===== HIDDEN / MISSING / DANGEROUS / UNFAIR CLAUSES ===== -->
${hiddenClauses.length > 0 ? `
<div class="page-break"></div>
<div class="section">
  <div class="section-title">Hidden Clauses</div>
  <div class="section-subtitle">Clauses that may be intentionally buried or easy to overlook</div>
  ${hiddenClauses.map(c => `
  <div class="clause-card" style="border-left:3px solid #A855F7;">
    <div class="clause-header">
      <span class="clause-name">${esc(c.name)}</span>
      <span class="clause-risk-badge" style="background:#A855F720;color:#A855F7;border:1px solid #A855F740;">
        ${esc(getRiskLabel(c.riskScore))} ${c.riskScore.toFixed(1)}/10
      </span>
    </div>
    <div style="font-size:8.5pt;color:#334155;line-height:1.6;">${esc(c.plainEnglish || '')}</div>
  </div>`).join('')}
</div>` : ''}

${missingClauses.length > 0 ? `
<div class="section">
  <div class="section-title">Missing Clauses</div>
  <div class="section-subtitle">Standard clauses expected but not found in this document</div>
  ${missingClauses.map(c => `
  <div class="clause-card" style="border-left:3px solid #F97316;">
    <div class="clause-header">
      <span class="clause-name">${esc(c.name)}</span>
      <span class="clause-risk-badge" style="background:#F9731620;color:#F97316;border:1px solid #F9731640;">
        ${esc(getRiskLabel(c.riskScore))} ${c.riskScore.toFixed(1)}/10
      </span>
    </div>
    <div style="font-size:8.5pt;color:#334155;line-height:1.6;">${esc(c.whyItMatters || 'This clause is typically important.')}</div>
  </div>`).join('')}
</div>` : ''}

${dangerousClauses.length > 0 ? `
<div class="section">
  <div class="section-title" style="color:#DC2626;border-bottom-color:#DC2626;">⚠ Dangerous Clauses</div>
  <div class="section-subtitle">These clauses pose significant risk and require immediate attention</div>
  ${dangerousClauses.map(c => `
  <div class="clause-card" style="border-left:3px solid #DC2626;background:#FEF2F2;">
    <div class="clause-header">
      <span class="clause-name">${esc(c.name)}</span>
      <span class="clause-risk-badge" style="background:#DC2626;color:#FFFFFF;">
        DANGEROUS
      </span>
    </div>
    <div style="font-size:8.5pt;color:#334155;line-height:1.6;">${esc(c.whyItMatters || c.plainEnglish || '')}</div>
  </div>`).join('')}
</div>` : ''}

${unfairClauses.length > 0 ? `
<div class="section">
  <div class="section-title" style="color:#EA580C;border-bottom-color:#EA580C;">Potentially Unfair Clauses</div>
  <div class="section-subtitle">Clauses that may be unbalanced or unfairly favor one party</div>
  ${unfairClauses.map(c => `
  <div class="clause-card" style="border-left:3px solid #EA580C;background:#FFF7ED;">
    <div class="clause-header">
      <span class="clause-name">${esc(c.name)}</span>
      <span class="clause-risk-badge" style="background:#EA580C20;color:#EA580C;border:1px solid #EA580C40;">
        UNFAIR
      </span>
    </div>
    <div style="font-size:8.5pt;color:#334155;line-height:1.6;">${esc(c.whyItMatters || c.plainEnglish || '')}</div>
  </div>`).join('')}
</div>` : ''}

<!-- ===== RISKS ===== -->
${financialRisks.length > 0 ? `
<div class="section">
  <div class="section-title">Financial Risks</div>
  <ul class="item-list item-red">
    ${financialRisks.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

${legalRisks.length > 0 ? `
<div class="section">
  <div class="section-title">Legal Risks</div>
  <ul class="item-list item-red">
    ${legalRisks.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

${privacyRisks.length > 0 ? `
<div class="section">
  <div class="section-title">Privacy Risks</div>
  <ul class="item-list item-blue">
    ${privacyRisks.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

${liabilityRisks.length > 0 ? `
<div class="section">
  <div class="section-title">Liability Risks</div>
  <ul class="item-list item-amber">
    ${liabilityRisks.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

${penalties.length > 0 ? `
<div class="section">
  <div class="section-title">Penalties & Damages</div>
  <ul class="item-list item-red">
    ${penalties.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

<!-- ===== TIMELINE ===== -->
${timeline.length > 0 ? `
<div class="page-break"></div>
<div class="section">
  <div class="section-title">Timeline & Key Dates</div>
  <div class="timeline">
    ${timeline.map(t => `
    <div class="timeline-item">
      <div class="timeline-event">${esc(t.event)}</div>
      ${t.date ? `<div class="timeline-date">${esc(t.date)}</div>` : ''}
    </div>`).join('')}
  </div>
</div>` : ''}

<!-- ===== OBLIGATIONS ===== -->
${obligations.length > 0 ? `
<div class="section">
  <div class="section-title">Party Obligations</div>
  ${obligations.map(o => `
  <div class="obligation-item">
    <span class="obligation-party">${esc(o.party)}</span>
    <span>${esc(o.obligation)}</span>
  </div>`).join('')}
</div>` : ''}

<!-- ===== TERMINATION & RENEWAL ===== -->
${terminationConditions.length > 0 ? `
<div class="section">
  <div class="section-title">Termination Conditions</div>
  <ul class="item-list item-amber">
    ${terminationConditions.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

${renewalConditions.length > 0 ? `
<div class="section">
  <div class="section-title">Renewal Conditions</div>
  <ul class="item-list item-green">
    ${renewalConditions.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

<!-- ===== GOVERNING LAW / ARBITRATION / JURISDICTION ===== -->
${governingLaw ? `
<div class="section">
  <div class="section-title">Governing Law</div>
  <div class="text-body">${esc(governingLaw)}</div>
</div>` : ''}

${arbitration ? `
<div class="section">
  <div class="section-title">Arbitration Requirements</div>
  <div class="text-body">${esc(arbitration)}</div>
</div>` : ''}

${jurisdictionText ? `
<div class="section">
  <div class="section-title">Jurisdiction</div>
  <div class="text-body">${esc(jurisdictionText)}</div>
</div>` : ''}

<!-- ===== RED FLAGS / GREEN FLAGS ===== -->
${redFlags.length > 0 ? `
<div class="section">
  <div class="section-title" style="color:#DC2626;border-bottom-color:#DC2626;">Red Flags</div>
  <ul class="item-list item-red">
    ${redFlags.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

${positiveAspects.length > 0 ? `
<div class="section">
  <div class="section-title" style="color:#16A34A;border-bottom-color:#16A34A;">Positive Aspects</div>
  <ul class="item-list item-green">
    ${positiveAspects.map(r => `<li>${esc(r)}</li>`).join('')}
  </ul>
</div>` : ''}

<!-- ===== AI SUGGESTIONS & NEGOTIATION TIPS ===== -->
${aiSuggestions.length > 0 ? `
<div class="section">
  <div class="section-title">AI-Powered Suggestions</div>
  <ul class="item-list item-blue">
    ${aiSuggestions.map((s, i) => `<li><strong>${i + 1}.</strong> ${esc(s)}</li>`).join('')}
  </ul>
</div>` : ''}

${negotiationTips.length > 0 ? `
<div class="section">
  <div class="section-title">Negotiation Suggestions</div>
  <ul class="item-list item-amber">
    ${negotiationTips.map((t, i) => `<li><strong>${i + 1}.</strong> ${esc(t)}</li>`).join('')}
  </ul>
</div>` : ''}

<!-- ===== COMPLIANCE ===== -->
${compliance.length > 0 ? `
<div class="page-break"></div>
<div class="section">
  <div class="section-title">Country-Specific Compliance</div>
  <div class="section-subtitle">Laws applied during analysis for ${esc(jurisdiction)}</div>
  ${compliance.map(c => {
    const cls = c.status === 'COMPLIANT' ? 'compliance-compliant' :
                c.status === 'NON_COMPLIANT' ? 'compliance-noncompliant' : 'compliance-flagged'
    const icon = c.status === 'COMPLIANT' ? '✓' : c.status === 'NON_COMPLIANT' ? '✗' : '⚠'
    return `<div class="compliance-item ${cls}">
      <strong>${icon}</strong>
      <div>
        <strong>${esc(c.law)}</strong>
        ${c.note ? `<div style="font-size:8pt;color:#64748B;margin-top:2px;">${esc(c.note)}</div>` : ''}
      </div>
    </div>`
  }).join('')}
</div>` : ''}

<!-- ===== RECOMMENDATIONS ===== -->
${recommendations.length > 0 ? `
<div class="section">
  <div class="section-title">Actionable Recommendations</div>
  <ol class="rec-list">
    ${recommendations.map(r => `<li>${esc(r)}</li>`).join('')}
  </ol>
</div>` : ''}

<!-- ===== PLAIN ENGLISH SUMMARY ===== -->
${plainEnglishSummary ? `
<div class="section">
  <div class="section-title">Plain English Summary</div>
  <div class="exec-summary">
    ${esc(plainEnglishSummary)}
  </div>
</div>` : ''}

<!-- ===== DISCLAIMER ===== -->
<div class="disclaimer">
  <div class="disclaimer-icon">i</div>
  <div class="disclaimer-title">Disclaimer</div>
  <div class="disclaimer-text">
    This report is AI-generated and does not constitute legal advice. It is intended for informational and educational purposes only. The analysis may contain errors, omissions, or inaccuracies. Always consult a qualified lawyer licensed in your jurisdiction for legal decisions. By using this report, you agree that LeGuard-AI and its operators bear no liability for any actions taken based on this analysis.
  </div>
  <div style="font-size:6.5pt;color:#94A3B8;margin-top:8px;">
    Report ID: ${esc(reportId)} | Generated: ${esc(generatedAt)} | Confidential — Generated by LeGuard-AI
  </div>
</div>

</body>
</html>`
}
