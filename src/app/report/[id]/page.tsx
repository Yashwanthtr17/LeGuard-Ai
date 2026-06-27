"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface Clause {
  name: string;
  risk_score: number;
  risk_level: string;
  plain_english: string;
  why_it_matters: string;
  recommendation: string;
  location: string;
}

interface Compliance {
  law: string;
  status: string;
  note: string;
}

interface ReportData {
  id: string;
  fileName: string;
  documentType: string;
  jurisdiction: string;
  overallScore: number;
  riskLevel: string;
  verdict: string;
  executiveSummary: string;
  createdAt: string;
  clauses: Clause[];
  country_compliance: Compliance[];
  red_flags: string[];
  positive_aspects: string[];
  country_applied: string;
  document_type_detected: string;
}

function getRiskColor(score: number): string {
  if (score >= 7) return "#E53E3E";
  if (score >= 4) return "#D69E2E";
  return "#38A169";
}

function getRiskTextColor(score: number): string {
  if (score >= 7) return "text-danger";
  if (score >= 4) return "text-warning";
  return "text-success";
}

function getRiskBg(score: number): string {
  if (score >= 7) return "bg-danger/10 border-danger/20 text-danger";
  if (score >= 4) return "bg-warning/10 border-warning/20 text-warning";
  return "bg-success/10 border-success/20 text-success";
}

function RiskGauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.min(score, 10);
  const offset = circumference - (normalized / 10) * circumference;
  const color = getRiskColor(normalized);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 200 200" className="drop-shadow-sm">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="14" />
        <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 1.5s ease-out, stroke 0.5s", filter: `drop-shadow(0 0 8px ${color}50)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl sm:text-6xl font-bold tracking-tight" style={{ color }}>{normalized}</span>
        <span className="text-xs text-slate-400 font-medium mt-1">out of 10</span>
      </div>
      <div className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg" style={{ backgroundColor: color }}>
        {score >= 7 ? "HIGH" : score >= 4 ? "MEDIUM" : "LOW"} RISK
      </div>
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full animate-scale-in">
        <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Report</h3>
        <p className="text-sm text-slate-600 text-center mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">Yes, Delete Report</button>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("leguard_token") : null;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/report/${id}`);
      return;
    }
    if (isAuthenticated && token) {
      fetch(`/api/scan/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.status === 404) throw new Error("Report not found");
          if (!res.ok) throw new Error("Failed to load report");
          return res.json();
        })
        .then(data => setReport(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, id, token, router]);

  async function handleDelete() {
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/scan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push("/reports");
      } else {
        setError("Couldn't delete report. Try again.");
      }
    } catch {
      setError("Couldn't delete report. Try again.");
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  async function handleDownloadPdf() {
    if (!token) return;
    try {
      const res = await fetch(`/api/reports/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report?.fileName?.replace(/\.[^.]+$/, "") || "report"}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't generate PDF. Try again.");
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (error || !report) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report Unavailable</h2>
          <p className="text-slate-600 mb-6 text-sm">{error || "Could not load report."}</p>
          <Link href="/reports" className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const sortedClauses = [...(report.clauses || [])].sort((a, b) => b.risk_score - a.risk_score);
  const maxScore = Math.max(...sortedClauses.map(c => c.risk_score), 1);

  return (
    <div className="flex-1 bg-background min-h-screen pb-20">
      {showDelete && <ConfirmModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}

      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="text-slate-500 hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-md">{report.fileName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadPdf}
            className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button onClick={() => setShowDelete(true)}
            className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Report Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-lg font-bold text-primary">LeGuard-AI</span>
            </div>
            <h1 className="text-sm text-slate-700 mt-1">{report.fileName} — Legal Risk Analysis</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{report.country_applied || report.jurisdiction}</span>
            <span className="px-3 py-1 bg-primary/5 rounded-full text-xs font-medium text-primary">{report.document_type_detected || report.documentType}</span>
            <span className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Risk Score Hero */}
        <div className={`bg-white rounded-2xl shadow-sm border p-8 sm:p-10 text-center`}
          style={{ borderColor: getRiskColor(report.overallScore) + "30" }}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Overall Risk Score</p>
          <div className="flex justify-center mb-4">
            <RiskGauge score={report.overallScore} />
          </div>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-4 leading-relaxed">
            {report.verdict || "Analysis complete."}
          </p>
          <p className="text-xs text-slate-400 mt-4 cursor-help" title="Weighted average of all clause risk scores, adjusted for legal severity">ⓘ How is this calculated?</p>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-bold text-slate-900">Executive Summary</h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{report.executiveSummary || report.verdict}</p>
        </div>

        {/* Clauses */}
        {sortedClauses.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Clause-by-Clause Breakdown</h2>
            <div className="space-y-4">
              {sortedClauses.map((clause, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 card-hover">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${getRiskBg(clause.risk_score)}`}>
                        {clause.risk_level || (clause.risk_score >= 7 ? "HIGH" : clause.risk_score >= 4 ? "MEDIUM" : "LOW")}
                      </div>
                      <h3 className="font-bold text-slate-900">{clause.name}</h3>
                    </div>
                    <span className="text-sm font-bold" style={{ color: getRiskColor(clause.risk_score) }}>
                      {clause.risk_score}/10
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="bg-green-50/80 rounded-xl p-4 border border-green-200/60">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">What it says</p>
                      <p className="text-sm text-green-800 leading-relaxed">{clause.plain_english}</p>
                    </div>
                    <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200/60">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Why it matters</p>
                      <p className="text-sm text-amber-800 leading-relaxed">{clause.why_it_matters}</p>
                    </div>
                  </div>

                  <div className="mt-3 bg-primary/5 rounded-xl p-4 border border-primary/20">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">What to do</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{clause.recommendation}</p>
                  </div>

                  {clause.location && (
                    <p className="text-xs text-slate-400 mt-2">📍 Found in: {clause.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Country Compliance */}
        {report.country_compliance && report.country_compliance.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Country-Specific Legal Notes</h2>
            <p className="text-sm text-slate-500 mb-4">Relevant laws for {report.country_applied || report.jurisdiction}</p>
            <div className="space-y-3">
              {report.country_compliance.map((item, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  item.status === "COMPLIANT" ? "bg-green-50/80 border-green-200/60" :
                  item.status === "NON_COMPLIANT" ? "bg-red-50/80 border-red-200/60" :
                  "bg-amber-50/80 border-amber-200/60"
                }`}>
                  <span className={`text-lg ${
                    item.status === "COMPLIANT" ? "text-success" :
                    item.status === "NON_COMPLIANT" ? "text-danger" : "text-warning"
                  }`}>
                    {item.status === "COMPLIANT" ? "✅" : item.status === "NON_COMPLIANT" ? "❌" : "⚠️"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.law}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Summary Table */}
        {sortedClauses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Risk Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">Clause</th>
                    <th className="pb-3 pr-4">Risk Level</th>
                    <th className="pb-3 pr-4">Score</th>
                    <th className="pb-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedClauses.map((clause, i) => (
                    <tr key={i} className="text-sm hover:bg-slate-50/50">
                      <td className="py-3 pr-4 font-medium text-slate-900">{clause.name}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          clause.risk_score >= 7 ? "bg-danger/10 text-danger" :
                          clause.risk_score >= 4 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                        }`}>
                          {clause.risk_level || (clause.risk_score >= 7 ? "High" : clause.risk_score >= 4 ? "Medium" : "Low")}
                        </span>
                      </td>
                      <td className={`py-3 pr-4 font-bold ${getRiskTextColor(clause.risk_score)}`}>{clause.risk_score}/10</td>
                      <td className="py-3 text-slate-400 text-xs">{clause.location || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Red Flags & Positive Aspects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.red_flags && report.red_flags.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-danger text-sm mb-3">🚩 Red Flags</h3>
              <ul className="space-y-2">
                {report.red_flags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-danger mt-0.5">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.positive_aspects && report.positive_aspects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-success text-sm mb-3">✅ Positive Aspects</h3>
              <ul className="space-y-2">
                {report.positive_aspects.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-success mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-center p-4">
          <p className="text-xs text-slate-400 italic">
            This report is AI-generated and does not constitute legal advice. Consult a qualified lawyer for legal decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
