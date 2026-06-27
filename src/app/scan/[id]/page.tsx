"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { ScanResult, Consequence, HiddenThreat } from "@/lib/store";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-danger/10 border-danger/30 text-danger",
  high: "bg-warning/10 border-warning/30 text-warning",
  medium: "bg-amber-50 border-amber-200 text-amber-600",
  low: "bg-blue-50 border-blue-200 text-blue-600",
};

const CATEGORY_STYLES: Record<string, string> = {
  statutory: "bg-purple-50 text-purple-700 border-purple-200",
  commercial: "bg-cyan-50 text-cyan-700 border-cyan-200",
  semantic: "bg-amber-50 text-amber-700 border-amber-200",
};

function getRiskColor(score: number): string {
  if (score >= 8) return "#ef4444";
  if (score >= 5) return "#f59e0b";
  if (score >= 3) return "#f59e0b";
  return "#10b981";
}

function getRiskLabel(score: number): string {
  if (score >= 8) return "High";
  if (score >= 5) return "Medium";
  if (score >= 3) return "Low";
  return "No Risk";
}

function RiskGauge({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(score, 10);
  const offset = circumference - (normalizedScore / 10) * circumference;
  const color = getRiskColor(normalizedScore);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="160" height="160" viewBox="0 0 200 200" className="sm:w-[200px] sm:h-[200px] drop-shadow-sm">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          className="drop-shadow-sm"
          style={{ transition: "stroke-dashoffset 1.2s ease-out", filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl sm:text-5xl font-bold tracking-tight animate-scale-in" style={{ color }}>
          {normalizedScore}
        </span>
        <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">out of 10</span>
      </div>
      <div
        className="mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-lg animate-fade-in"
        style={{ backgroundColor: color }}
      >
        {getRiskLabel(normalizedScore)} Risk
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 card-hover">
      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">{label}</p>
      <p className="text-lg sm:text-2xl font-bold truncate" style={{ color }}>{value}</p>
    </div>
  );
}

function ConsequenceCard({ item }: { item: Consequence }) {
  const [showPlain, setShowPlain] = useState(true);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 card-hover">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${SEVERITY_STYLES[item.severity]}`}>
            {item.severity.toUpperCase()}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border ${CATEGORY_STYLES[item.category]}`}>
            {item.category}
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-50/80 px-2 py-0.5 rounded border border-slate-200/60">
          Page {item.pageNumber}
        </span>
      </div>

      <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5">{item.clause}</h4>
      <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">{item.issue}</p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowPlain(true)}
          className={`text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-200 ${
            showPlain
              ? "bg-primary text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          Plain English
        </button>
        <button
          onClick={() => setShowPlain(false)}
          className={`text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-200 ${
            !showPlain
              ? "bg-primary text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          Full Details
        </button>
      </div>

      {showPlain ? (
        <div className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl p-3 sm:p-4 border border-green-200/60">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wider">In Simple Words</span>
          </div>
          <p className="text-xs sm:text-sm text-green-800 leading-relaxed">{item.plainEnglish}</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 sm:p-4 border border-slate-200/60 space-y-2">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Explanation</span>
            <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">{item.explanation}</p>
          </div>
        </div>
      )}

      <div className="mt-3 bg-gradient-to-br from-primary/5 to-primary/[0.02] rounded-xl p-3 sm:p-4 border border-primary/20">
        <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">Recommendation</span>
        <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">{item.recommendation}</p>
      </div>
    </div>
  );
}

function HiddenThreatCard({ item }: { item: HiddenThreat }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 card-hover">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${SEVERITY_STYLES[item.severity]}`}>
          {item.severity.toUpperCase()}
        </span>
        <span className="text-[10px] sm:text-xs font-mono text-slate-400 bg-slate-50/80 px-2 py-0.5 rounded border border-slate-200/60">
          Page {item.pageNumber}
        </span>
      </div>

      <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 flex items-center gap-2">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {item.threat}
      </h4>

      <div className="bg-gradient-to-br from-red-50 to-red-50/50 rounded-xl p-3 sm:p-4 border border-red-200/60 mb-3">
        <span className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-wider">In Simple Words</span>
        <p className="text-xs sm:text-sm text-red-800 mt-1 leading-relaxed">{item.plainEnglish}</p>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 sm:p-4 border border-slate-200/60">
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Detailed Explanation</span>
        <p className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">{item.explanation}</p>
      </div>
    </div>
  );
}

function QuestionsSection({ questions }: { questions: string[] }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Questions to Ask the Document Provider
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-slate-500 mb-4">
        Use these questions to discuss concerns with the company, lawyer, or counterparty who provided this document.
      </p>
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-3 bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 sm:p-4 border border-slate-200/60 hover:border-primary/20 transition-colors duration-200">
            <span className="w-6 h-6 bg-gradient-to-br from-primary to-primary-light text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
              {i + 1}
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{q}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalysisResults() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"consequences" | "threats" | "document">("consequences");
  const [showDoc, setShowDoc] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/scan/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Analysis result not found. The scan may have expired.");
          throw new Error("Failed to load analysis results.");
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-medium text-sm sm:text-base">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-surface-hover/30 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Sign in to view results</h2>
          <p className="text-slate-600 text-sm mb-6">
            You need to sign in to view your analysis results.
          </p>
          <Link
            href={`/login?redirect=/scan/${id}`}
            className="inline-block w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] px-4">
        <div className="text-center max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Analysis Unavailable</h2>
          <p className="text-slate-600 mb-6 text-sm">{error || "Could not load analysis."}</p>
          <Link href="/scan">
            <button className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm sm:text-base">
              Start New Analysis
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const hasHighRisk = data.consequences.some(
    (c) => c.severity === "high" || c.severity === "critical"
  );
  const highCriticalCount = data.consequences.filter(
    (c) => c.severity === "high" || c.severity === "critical"
  ).length;

  return (
    <div className="flex-1 flex flex-col bg-surface-hover/30 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <Link href="/history" className="text-slate-500 hover:text-primary transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-[160px] sm:max-w-none">{data.fileName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold">Analyzed</span>
              <span className="text-[10px] sm:text-xs text-slate-400 truncate">
                {new Date(data.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-slate-600">
              {data.detectedCountry}
            </span>
          </div>
          <div
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: getRiskColor(data.riskScore) }}
          >
            Risk: {data.riskScore}/10
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <StatCard
              label="Risk Score"
              value={`${data.riskScore}/10`}
              color={getRiskColor(data.riskScore)}
            />
            <StatCard
              label="Issues Found"
              value={data.consequences.length}
              color="#3366cc"
            />
            <StatCard
              label="High / Critical"
              value={hasHighRisk ? highCriticalCount : "None"}
              color={hasHighRisk ? "#ef4444" : "#10b981"}
            />
            <StatCard
              label="Hidden Threats"
              value={data.hiddenThreats.length > 0 ? data.hiddenThreats.length : "None"}
              color={data.hiddenThreats.length > 0 ? "#ef4444" : "#10b981"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm flex items-center justify-center card-hover">
              <RiskGauge score={data.riskScore} />
            </div>
            <div className="md:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-sm card-hover">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3">Analysis Summary</h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-3 sm:mb-4">{data.summary}</p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-slate-200">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Jurisdiction</span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">{data.jurisdiction === 'auto' ? 'Auto-detected' : data.jurisdiction}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3 border border-slate-200">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">Detected Country</span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">{data.detectedCountry}</p>
                </div>
              </div>
            </div>
          </div>

          <QuestionsSection questions={data.questionsToAsk} />

          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden card-hover">
            <div className="flex border-b border-slate-200/60 bg-slate-50/80 overflow-x-auto">
              <button
                onClick={() => setActiveTab("consequences")}
                className={`flex-1 min-w-0 py-3 sm:py-3.5 px-3 sm:px-4 text-[11px] sm:text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  activeTab === "consequences"
                    ? "text-primary bg-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  Risks & Consequences
                  <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                    {data.consequences.length}
                  </span>
                </span>
                {activeTab === "consequences" && (
                  <span className="absolute bottom-0 left-3 sm:left-4 right-3 sm:right-4 h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("threats")}
                className={`flex-1 min-w-0 py-3 sm:py-3.5 px-3 sm:px-4 text-[11px] sm:text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  activeTab === "threats"
                    ? "text-primary bg-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  Hidden Threats
                  <span className="bg-danger/10 text-danger text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                    {data.hiddenThreats.length}
                  </span>
                </span>
                {activeTab === "threats" && (
                  <span className="absolute bottom-0 left-3 sm:left-4 right-3 sm:right-4 h-0.5 bg-danger rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("document")}
                className={`flex-1 min-w-0 py-3 sm:py-3.5 px-3 sm:px-4 text-[11px] sm:text-sm font-semibold transition-colors relative whitespace-nowrap ${
                  activeTab === "document"
                    ? "text-primary bg-white"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  Document Text
                </span>
                {activeTab === "document" && (
                  <span className="absolute bottom-0 left-3 sm:left-4 right-3 sm:right-4 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </div>

            <div className="p-3 sm:p-6">
              {activeTab === "consequences" && (
                <div className="space-y-3 sm:space-y-4">
                  {data.consequences.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 font-medium text-sm">No risks or issues found in this document</p>
                    </div>
                  ) : (
                    data.consequences.map((item, i) => (
                      <ConsequenceCard key={i} item={item} />
                    ))
                  )}
                </div>
              )}

              {activeTab === "threats" && (
                <div className="space-y-3 sm:space-y-4">
                  {data.hiddenThreats.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-slate-500 font-medium text-sm">No hidden threats detected in this document</p>
                    </div>
                  ) : (
                    data.hiddenThreats.map((item, i) => (
                      <HiddenThreatCard key={i} item={item} />
                    ))
                  )}
                </div>
              )}

              {activeTab === "document" && (
                <div>
                  <button
                    onClick={() => setShowDoc(!showDoc)}
                    className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-primary-dark transition-colors mb-3 sm:mb-4"
                  >
                    <svg
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showDoc ? "rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {showDoc ? "Hide Document Text" : "Show Document Text"}
                  </button>
                  {showDoc && (
                    <pre className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                      {data.documentText}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
