"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  useReport,
  useDeleteReport,
  useFavoriteReport,
  useDownloadReportPdf,
} from "@/lib/hooks/use-reports";

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

interface TimelineEvent {
  event: string;
  date: string;
}

interface Obligation {
  party: string;
  obligation: string;
}

function getRiskColor(score: number): string {
  if (score >= 7) return "#EF4444";
  if (score >= 4) return "#F59E0B";
  return "#10B981";
}

function getRiskTextColor(score: number): string {
  if (score >= 7) return "text-danger";
  if (score >= 4) return "text-warning";
  return "text-success";
}

function getRiskBadgeBg(score: number): string {
  if (score >= 7) return "bg-danger/10 text-danger border-danger/20";
  if (score >= 4) return "bg-warning/10 text-warning border-warning/20";
  return "bg-success/10 text-success border-success/20";
}

function RiskGauge({ score, animated = true }: { score: number; animated?: boolean }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.min(score, 10);
  const [offset, setOffset] = useState(circumference);
  const color = getRiskColor(normalized);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (normalized / 10) * circumference);
    }, animated ? 200 : 0);
    return () => clearTimeout(timer);
  }, [normalized, circumference, animated]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-sm">
        <defs>
          <linearGradient id={`gaugeGrad-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <filter id={`glow-${score}`}>
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.3" />
          </filter>
        </defs>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="14" />
        <circle cx="100" cy="100" r={radius} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{ transition: "stroke-dashoffset 1.5s ease-out, stroke 0.5s" }}
          filter={`url(#glow-${score})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl sm:text-6xl font-bold tracking-tight" style={{ color }}>{normalized.toFixed(1)}</span>
        <span className="text-xs text-subtle font-medium mt-1">out of 10</span>
      </div>
      <div className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg" style={{ backgroundColor: color }}>
        {normalized >= 7 ? "HIGH" : normalized >= 4 ? "MEDIUM" : "LOW"} RISK
      </div>
    </div>
  );
}

function RiskMeter({ score }: { score: number }) {
  const normalized = Math.min(score, 10);
  const pct = (normalized / 10) * 100;
  const color = getRiskColor(normalized);

  return (
    <div className="w-full">
      <div className="relative h-6 rounded-full overflow-hidden bg-border/50">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-success/30" />
          <div className="flex-1 bg-warning/30" />
          <div className="flex-1 bg-danger/30" />
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold text-subtle">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-10"
          style={{ left: `${pct}%`, marginLeft: "-8px" }}>
          <div className="w-4 h-4 bg-surface rounded-full shadow-md border-2" style={{ borderColor: color }} />
        </div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-subtle">0</span>
        <span className="text-[10px] text-subtle">10</span>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children, className = "", id }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-surface rounded-2xl shadow-sm border border-border p-5 sm:p-6 ${className}`}
    >
      {icon ? (
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
      ) : (
        <h2 className="text-lg font-bold text-foreground mb-4">{title}</h2>
      )}
      {children}
    </motion.div>
  );
}

function ClauseCard({ clause }: { clause: Clause }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-surface rounded-2xl shadow-sm border border-border p-5 card-hover"
    >
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskBadgeBg(clause.risk_score)}`}>
            {clause.risk_level || (clause.risk_score >= 7 ? "HIGH" : clause.risk_score >= 4 ? "MEDIUM" : "LOW")}
          </div>
          <h3 className="font-bold text-foreground">{clause.name}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(clause.risk_score / 10) * 100}%`, backgroundColor: getRiskColor(clause.risk_score) }} />
          </div>
          <span className="text-sm font-bold min-w-[3rem] text-right" style={{ color: getRiskColor(clause.risk_score) }}>
            {clause.risk_score}/10
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="bg-success/5 rounded-xl p-4 border border-success/20">
          <p className="text-xs font-bold text-success uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>📖</span> What it says
          </p>
          <p className="text-sm text-foreground leading-relaxed">{clause.plain_english}</p>
        </div>
        <div className="bg-warning/5 rounded-xl p-4 border border-warning/20">
          <p className="text-xs font-bold text-warning uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>⚡</span> Why it matters
          </p>
          <p className="text-sm text-foreground leading-relaxed">{clause.why_it_matters}</p>
        </div>
      </div>

      <div className="mt-3 bg-primary/5 rounded-xl p-4 border border-primary/20">
        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <span>💡</span> What to do
        </p>
        <p className="text-sm text-foreground leading-relaxed">{clause.recommendation}</p>
      </div>

      {clause.location && (
        <p className="text-xs text-subtle mt-2 flex items-center gap-1">
          <span>📍</span> Found in: {clause.location}
        </p>
      )}
    </motion.div>
  );
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-surface rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full"
      >
        <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground text-center mb-2">Delete Report</h3>
        <p className="text-sm text-subtle text-center mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-colors text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">Yes, Delete Report</button>
        </div>
      </motion.div>
    </div>
  );
}

function ShareModal({ onClose, url }: { onClose: () => void; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-surface rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Share Report</h3>
          <button onClick={onClose} className="text-subtle hover:text-foreground">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-surface-hover rounded-xl p-2 border border-border">
          <input readOnly value={url} className="flex-1 bg-transparent text-sm text-foreground px-2 py-1 outline-none truncate" />
          <button onClick={handleCopy} className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-subtle mt-3 text-center">Anyone with this link can view this report.</p>
      </motion.div>
    </div>
  );
}

function SubNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      }
    }, { rootMargin: "-80px 0px -60% 0px" });

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="hidden lg:block sticky top-16 z-20 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 overflow-x-auto">
        <div className="flex gap-1 py-2 text-xs font-medium text-subtle">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors hover:text-primary hover:bg-primary/5 ${
                active === s.id ? "bg-primary/10 text-primary font-semibold" : ""
              }`}>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonLine({ width = "100%", className = "" }: { width?: string; className?: string }) {
  return (
    <div className={`h-4 bg-border/50 rounded-lg animate-pulse ${className}`} style={{ width }} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-6 space-y-5 sm:space-y-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-border/50 rounded-xl animate-pulse" />
          <div className="space-y-2 flex-1">
            <SkeletonLine width="60%" />
            <SkeletonLine width="40%" />
          </div>
        </div>
      </div>
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 sm:p-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-[200px] h-[200px] bg-border/30 rounded-full animate-pulse" />
          <SkeletonLine width="120px" />
          <SkeletonLine width="200px" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface rounded-2xl shadow-sm border border-border p-5 sm:p-6">
          <SkeletonLine width="180px" className="mb-4" />
          <SkeletonLine width="100%" className="mb-2" />
          <SkeletonLine width="100%" className="mb-2" />
          <SkeletonLine width="75%" />
        </div>
      ))}
    </div>
  );
}

export default function ReportPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, isError, error } = useReport(id);
  const deleteMutation = useDeleteReport();
  const favoriteMutation = useFavoriteReport();
  const downloadMutation = useDownloadReportPdf();

  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [sortKey, setSortKey] = useState<string>("risk_score");
  const [sortAsc, setSortAsc] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const report = useMemo(() => {
    if (!data) return null;
    const d = data as unknown as Record<string, unknown>;
    const r = d.report as Record<string, unknown> | undefined;
    const a = d.analysis as Record<string, unknown> | undefined;
    const doc = d.document as Record<string, unknown> | undefined;
    const clauses = (d.clauses as Clause[]) || [];
    const clausesByType = (d.clauses_by_type as Record<string, Clause[]>) || {};
    const compliance = (d.compliance as Compliance[]) || [];
    const riskItems = (d.risk_items as { category: string; content: string }[]) || [];
    const timelineData = (d.timeline as TimelineEvent[]) || [];
    const obligationsData = (d.obligations as Obligation[]) || [];

    const getClausesByType = (type: string) =>
      clausesByType[type] || clauses.filter((c) => (c as unknown as Record<string, unknown>).type === type) || [];

    const byCategory: Record<string, string[]> = {};
    for (const item of riskItems) {
      const cat = item.category || "other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(item.content);
    }

    return {
      fileName: (doc?.original_name as string) || (r?.title as string) || "Untitled",
      documentType: (a?.document_type_detected as string) || "",
      overallScore: (a?.overall_score as number) ?? 0,
      riskLevel: (a?.risk_level as string) || "LOW",
      verdict: (a?.verdict as string) || "",
      executiveSummary: (a?.executive_summary as string) || "",
      createdAt: (r?.created_at as string) || "",
      confidenceScore: (a?.confidence_score as number) ?? 0,
      countryApplied: (a?.country_applied as string) || "",
      documentTypeDetected: (a?.document_type_detected as string) || "",
      governingLaw: (a?.governing_law as string) || "",
      arbitration: (a?.arbitration as string) || "",
      jurisdiction: (a?.jurisdiction as string) || "",
      plainEnglishSummary: (a?.plain_english_summary as string) || "",
      clauses,
      clausesByType,
      compliance,
      hiddenClauses: getClausesByType("hidden"),
      missingClauses: getClausesByType("missing"),
      dangerousClauses: getClausesByType("dangerous"),
      unfairClauses: getClausesByType("unfair"),
      financialRisks: byCategory["financial"] || [],
      legalRisks: byCategory["legal"] || [],
      penalties: byCategory["penalty"] || [],
      terminationConditions: byCategory["termination"] || [],
      renewalConditions: byCategory["renewal"] || [],
      privacyRisks: byCategory["privacy"] || [],
      liabilityRisks: byCategory["liability"] || [],
      redFlags: byCategory["red_flag"] || [],
      positiveAspects: byCategory["green_flag"] || [],
      aiSuggestions: byCategory["ai_suggestion"] || [],
      negotiationTips: byCategory["negotiation"] || [],
      timeline: timelineData,
      obligations: obligationsData,
    };
  }, [data]);

  function handleDelete() {
    deleteMutation.mutate(id, {
      onSuccess: () => router.push("/reports"),
      onError: () => {},
    });
    setShowDelete(false);
  }

  function handleDownloadPdf() {
    downloadMutation.mutate(id, {
      onSuccess: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report?.fileName?.replace(/\.[^.]+$/, "") || "report"}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
    });
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      setShowShare(true);
      navigator.clipboard.writeText(window.location.href);
    }
  }

  function handleFavorite() {
    favoriteMutation.mutate(id);
  }

  const getSortedClauses = useCallback((clauses: Clause[] | undefined): Clause[] => {
    if (!clauses) return [];
    const sorted = [...clauses];
    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "risk_score") cmp = b.risk_score - a.risk_score;
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "location") cmp = (a.location || "").localeCompare(b.location || "");
      return sortAsc ? -cmp : cmp;
    });
    return sorted;
  }, [sortKey, sortAsc]);

  const sortedClauses = useMemo(() => getSortedClauses(report?.clauses), [report?.clauses, getSortedClauses]);

  const sections = [
    { id: "overall-risk", label: "Risk Score" },
    { id: "executive-summary", label: "Summary" },
    { id: "clause-analysis", label: "Clauses" },
    { id: "hidden-clauses", label: "Hidden" },
    { id: "missing-clauses", label: "Missing" },
    { id: "dangerous-clauses", label: "Dangerous" },
    { id: "unfair-clauses", label: "Unfair" },
    { id: "financial-risks", label: "Financial" },
    { id: "legal-risks", label: "Legal" },
    { id: "timeline", label: "Timeline" },
    { id: "obligations", label: "Obligations" },
    { id: "penalties", label: "Penalties" },
    { id: "termination", label: "Termination" },
    { id: "renewal", label: "Renewal" },
    { id: "privacy", label: "Privacy" },
    { id: "liability", label: "Liability" },
    { id: "governing-law", label: "Governing Law" },
    { id: "arbitration", label: "Arbitration" },
    { id: "jurisdiction", label: "Jurisdiction" },
    { id: "red-flags", label: "Red Flags" },
    { id: "green-flags", label: "Green Flags" },
    { id: "ai-suggestions", label: "AI" },
    { id: "negotiation", label: "Negotiation" },
    { id: "plain-english", label: "Plain English" },
    { id: "country-laws", label: "Country Laws" },
    { id: "risk-chart", label: "Risk Chart" },
  ];

  if (authLoading || (isLoading && !report)) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-border/50 rounded-lg animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-border/50 rounded w-48 animate-pulse" />
              <div className="h-3 bg-border/50 rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isError || !report) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md mx-auto p-8 bg-surface rounded-2xl shadow-lg border border-border"
        >
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Report Unavailable</h2>
          <p className="text-subtle mb-6 text-sm">{(error as Error)?.message || "Could not load report."}</p>
          <Link href="/reports" className="inline-block px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">
            Back to Reports
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background min-h-screen pb-20">
      {showDelete && <ConfirmModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
      {showShare && <ShareModal onClose={() => setShowShare(false)} url={typeof window !== "undefined" ? window.location.href : ""} />}

      {/* Sticky Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/reports" className="p-1.5 text-subtle hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate max-w-[160px] sm:max-w-xs md:max-w-md">{report.fileName}</h1>
            <p className="text-[10px] text-subtle hidden sm:block">{report.documentTypeDetected || report.documentType} &middot; {report.countryApplied || report.jurisdiction}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button onClick={handleShare}
            className="p-2 text-subtle hover:text-primary hover:bg-primary/5 rounded-xl transition-colors hidden sm:block" title="Share">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button onClick={handleFavorite}
            className={`p-2 rounded-xl transition-colors hidden sm:block ${
              favoriteMutation.isSuccess && favoriteMutation.data?.favorited
                ? "text-danger hover:text-danger hover:bg-red-50"
                : "text-subtle hover:text-danger hover:bg-red-50"
            }`} title="Toggle favorite">
            <svg className="w-4 h-4" fill={(favoriteMutation.isSuccess && favoriteMutation.data?.favorited) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button onClick={handlePrint}
            className="p-2 text-subtle hover:text-primary hover:bg-primary/5 rounded-xl transition-colors hidden sm:block" title="Print">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </button>
          <button onClick={handleDownloadPdf}
            className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-sm"
            disabled={downloadMutation.isPending}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">{downloadMutation.isPending ? "Downloading..." : "Download PDF"}</span>
          </button>
          <button onClick={() => setShowDelete(true)}
            className="p-2 text-subtle hover:text-danger hover:bg-red-50 rounded-xl transition-colors" title="Delete">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Sub Navigation */}
      <SubNav sections={sections} />

      <div ref={printRef} className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-6 space-y-5 sm:space-y-6">

        {/* ===== Report Header ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-surface rounded-2xl shadow-sm border border-border p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-primary">LeGuard-AI</span>
            </div>
            <h1 className="text-sm text-foreground mt-1">{report.fileName} — Legal Risk Analysis</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-surface-hover rounded-full text-xs font-medium text-subtle">{report.countryApplied || report.jurisdiction}</span>
            <span className="px-3 py-1 bg-primary/5 rounded-full text-xs font-medium text-primary">{report.documentTypeDetected || report.documentType}</span>
            <span className="text-xs text-subtle">{new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </motion.div>

        {/* ===== Overall Risk Score ===== */}
        <motion.div
          id="overall-risk"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <div className={`bg-surface rounded-2xl shadow-sm border p-6 sm:p-10 text-center`}
            style={{ borderColor: getRiskColor(report.overallScore) + "30" }}>
            <p className="text-xs font-semibold text-subtle uppercase tracking-widest mb-4">Overall Risk Score</p>
            <div className="flex justify-center mb-4">
              <RiskGauge score={report.overallScore} />
            </div>

            {report.confidenceScore > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3 mb-4">
                <span className="text-xs text-subtle">Confidence:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= Math.round(report.confidenceScore / 2) ? "text-yellow-400" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-subtle ml-1">{(report.confidenceScore * 10).toFixed(0)}%</span>
                </div>
              </div>
            )}

            <div className="max-w-md mx-auto mt-6">
              <p className="text-xs font-semibold text-subtle uppercase tracking-wider mb-2">Risk Meter</p>
              <RiskMeter score={report.overallScore} />
            </div>

            <p className="text-sm sm:text-base text-foreground max-w-xl mx-auto mt-6 leading-relaxed">
              {report.verdict || "Analysis complete."}
            </p>
            <p className="text-xs text-subtle mt-4 cursor-help" title="Weighted average of all clause risk scores, adjusted for legal severity">ⓘ How is this calculated?</p>
          </div>
        </motion.div>

        {/* ===== Executive Summary ===== */}
        <div id="executive-summary">
          <SectionCard title="Executive Summary" icon={
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }>
            <p className="text-sm text-foreground leading-relaxed">{report.executiveSummary || report.verdict}</p>
          </SectionCard>
        </div>

        {/* ===== Clause Analysis ===== */}
        {sortedClauses.length > 0 && (
          <div id="clause-analysis">
            <SectionCard title="Clause-by-Clause Breakdown" id="clause-analysis-inner" icon={
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }>
              <div className="space-y-4">
                {sortedClauses.map((clause, i) => (
                  <ClauseCard key={i} clause={clause} />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Hidden Clauses ===== */}
        {report.hiddenClauses.length > 0 && (
          <div id="hidden-clauses">
            <SectionCard title="Hidden Clauses" icon={
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            }>
              <p className="text-xs text-subtle mb-4">Clauses that may be intentionally hidden, buried, or easy to overlook in the document.</p>
              <div className="space-y-4">
                {report.hiddenClauses.map((clause, i) => (
                  <ClauseCard key={i} clause={clause} />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Missing Clauses ===== */}
        {report.missingClauses.length > 0 && (
          <div id="missing-clauses">
            <SectionCard title="Missing Clauses" icon={
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            }>
              <p className="text-xs text-subtle mb-4">Standard clauses that are typically expected in this type of document but appear to be absent.</p>
              <div className="space-y-4">
                {report.missingClauses.map((clause, i) => (
                  <ClauseCard key={i} clause={clause} />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Dangerous Clauses ===== */}
        {report.dangerousClauses.length > 0 && (
          <div id="dangerous-clauses">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-danger/5 rounded-2xl shadow-sm border border-danger/20 p-5 sm:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h2 className="text-lg font-bold text-danger">Dangerous Clauses</h2>
              </div>
              <p className="text-xs text-danger/70 mb-4">These clauses pose significant risk and require immediate attention.</p>
              <div className="space-y-4">
                {report.dangerousClauses.map((clause, i) => (
                  <ClauseCard key={i} clause={clause} />
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* ===== Unfair Clauses ===== */}
        {report.unfairClauses.length > 0 && (
          <div id="unfair-clauses">
            <SectionCard title="Potentially Unfair Clauses" icon={
              <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            }>
              <p className="text-xs text-subtle mb-4">Clauses that may be unbalanced or unfairly favor one party over the other.</p>
              <div className="space-y-4">
                {report.unfairClauses.map((clause, i) => (
                  <ClauseCard key={i} clause={clause} />
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Financial Risks ===== */}
        {report.financialRisks.length > 0 && (
          <div id="financial-risks">
            <SectionCard title="Financial Risks" icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.financialRisks.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-surface-hover rounded-xl p-3 border border-border">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">$</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Legal Risks ===== */}
        {report.legalRisks.length > 0 && (
          <div id="legal-risks">
            <SectionCard title="Legal Risks" icon={
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.legalRisks.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-surface-hover rounded-xl p-3 border border-border">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">⚖️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Timeline ===== */}
        {report.timeline.length > 0 && (
          <div id="timeline">
            <SectionCard title="Timeline & Key Dates" icon={
              <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-5">
                  {report.timeline.map((item, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-cyan-400 bg-surface" />
                      <p className="text-sm font-semibold text-foreground">{item.event}</p>
                      <p className="text-xs text-subtle">{item.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Obligations ===== */}
        {report.obligations.length > 0 && (
          <div id="obligations">
            <SectionCard title="Party Obligations" icon={
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }>
              <div className="space-y-3">
                {report.obligations.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-surface-hover rounded-xl p-3 border border-border">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-md whitespace-nowrap">{item.party}</span>
                    <span className="text-sm text-foreground">{item.obligation}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Penalties ===== */}
        {report.penalties.length > 0 && (
          <div id="penalties">
            <SectionCard title="Penalties & Damages" icon={
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.penalties.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-danger/5 rounded-xl p-3 border border-danger/20">
                    <span className="text-danger mt-0.5 flex-shrink-0">⚠️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Termination Conditions ===== */}
        {report.terminationConditions.length > 0 && (
          <div id="termination">
            <SectionCard title="Termination Conditions" icon={
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.terminationConditions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-surface-hover rounded-xl p-3 border border-border">
                    <span className="text-rose-500 mt-0.5 flex-shrink-0">🔚</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Renewal Conditions ===== */}
        {report.renewalConditions.length > 0 && (
          <div id="renewal">
            <SectionCard title="Renewal Conditions" icon={
              <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.renewalConditions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-surface-hover rounded-xl p-3 border border-border">
                    <span className="text-teal-500 mt-0.5 flex-shrink-0">🔄</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Privacy Risks ===== */}
        {report.privacyRisks.length > 0 && (
          <div id="privacy">
            <SectionCard title="Privacy Risks" icon={
              <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.privacyRisks.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-surface-hover rounded-xl p-3 border border-border">
                    <span className="text-violet-500 mt-0.5 flex-shrink-0">🔒</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Liability Risks ===== */}
        {report.liabilityRisks.length > 0 && (
          <div id="liability">
            <SectionCard title="Liability Risks" icon={
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.liabilityRisks.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-amber-50/50 rounded-xl p-3 border border-amber-100">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">🛡️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Governing Law ===== */}
        {report.governingLaw && (
          <div id="governing-law">
            <SectionCard title="Governing Law" icon={
              <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
              <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100">
                <p className="text-sm text-foreground leading-relaxed">{report.governingLaw}</p>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Arbitration ===== */}
        {report.arbitration && (
          <div id="arbitration">
            <SectionCard title="Arbitration Requirements" icon={
              <svg className="w-5 h-5 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            }>
              <div className="bg-surface-hover rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground leading-relaxed">{report.arbitration}</p>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Jurisdiction ===== */}
        {report.jurisdiction && (
          <div id="jurisdiction">
            <SectionCard title="Jurisdiction" icon={
              <svg className="w-5 h-5 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }>
              <div className="bg-surface-hover rounded-xl p-4 border border-border">
                <p className="text-sm text-foreground leading-relaxed">{report.jurisdiction}</p>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Red Flags ===== */}
        {report.redFlags.length > 0 && (
          <div id="red-flags">
            <SectionCard title="Red Flags" icon={
              <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-danger/5 rounded-xl p-3 border border-danger/20">
                    <span className="text-danger mt-0.5 flex-shrink-0">🚩</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== Green Flags ===== */}
        {report.positiveAspects.length > 0 && (
          <div id="green-flags">
            <SectionCard title="Green Flags" icon={
              <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }>
              <ul className="space-y-2">
                {report.positiveAspects.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground bg-success/5 rounded-xl p-3 border border-success/20">
                    <span className="text-success mt-0.5 flex-shrink-0">✅</span>
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}

        {/* ===== AI Suggestions ===== */}
        {report.aiSuggestions.length > 0 && (
          <div id="ai-suggestions">
            <SectionCard title="AI-Powered Suggestions" icon={
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }>
              <div className="space-y-3">
                {report.aiSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">{i + 1}</span>
                    <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Negotiation Suggestions ===== */}
        {report.negotiationTips.length > 0 && (
          <div id="negotiation">
            <SectionCard title="Negotiation Suggestions" icon={
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            }>
              <div className="space-y-3">
                {report.negotiationTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-600">{i + 1}</span>
                    <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Plain English Explanation ===== */}
        {report.plainEnglishSummary && (
          <div id="plain-english">
            <SectionCard title="Plain English Explanation" icon={
              <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }>
              <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100">
                <p className="text-sm text-foreground leading-relaxed">{report.plainEnglishSummary}</p>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Country Laws Used ===== */}
        {report.compliance.length > 0 && (
          <div id="country-laws">
            <SectionCard title="Country Laws Applied" icon={
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            }>
              <p className="text-xs text-subtle mb-4">Specific laws applied during analysis for {report.countryApplied || report.jurisdiction}</p>
              <div className="space-y-3">
                {report.compliance.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    item.status === "COMPLIANT" ? "bg-success/5 border-success/20" :
                    item.status === "NON_COMPLIANT" ? "bg-danger/5 border-danger/20" :
                    "bg-warning/5 border-warning/20"
                  }`}>
                    <span className={`text-lg ${
                      item.status === "COMPLIANT" ? "text-success" :
                      item.status === "NON_COMPLIANT" ? "text-danger" : "text-warning"
                    }`}>
                      {item.status === "COMPLIANT" ? "✅" : item.status === "NON_COMPLIANT" ? "❌" : "⚠️"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.law}</p>
                      <p className="text-xs text-subtle mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Risk Summary Table ===== */}
        {sortedClauses.length > 0 && (
          <div id="risk-summary-table">
            <SectionCard title="Risk Summary Table" icon={
              <svg className="w-5 h-5 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }>
              <div className="flex justify-end mb-3">
                <div className="flex items-center gap-2 text-xs text-subtle">
                  <span>Sort:</span>
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}
                    className="text-xs border border-border rounded-lg px-2 py-1 bg-surface text-foreground">
                    <option value="risk_score">Risk Score</option>
                    <option value="name">Name</option>
                    <option value="location">Location</option>
                  </select>
                  <button onClick={() => setSortAsc(!sortAsc)}
                    className="p-1 hover:bg-surface-hover rounded transition-colors">
                    <svg className={`w-4 h-4 transition-transform ${sortAsc ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-subtle uppercase tracking-wider">
                      <th className="pb-3 pr-4">Clause</th>
                      <th className="pb-3 pr-4">Risk Level</th>
                      <th className="pb-3 pr-4">Score</th>
                      <th className="pb-3">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {getSortedClauses(report.clauses).map((clause, i) => (
                      <tr key={i} className="text-sm hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3 pr-4 font-medium text-foreground">{clause.name}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            clause.risk_score >= 7 ? "bg-danger/10 text-danger" :
                            clause.risk_score >= 4 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                          }`}>
                            {clause.risk_level || (clause.risk_score >= 7 ? "High" : clause.risk_score >= 4 ? "Medium" : "Low")}
                          </span>
                        </td>
                        <td className={`py-3 pr-4 font-bold ${getRiskTextColor(clause.risk_score)}`}>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(clause.risk_score / 10) * 100}%`, backgroundColor: getRiskColor(clause.risk_score) }} />
                            </div>
                            {clause.risk_score}/10
                          </div>
                        </td>
                        <td className="py-3 text-subtle text-xs">{clause.location || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Risk Chart ===== */}
        {sortedClauses.length > 0 && (
          <div id="risk-chart">
            <SectionCard title="Risk Distribution Chart" icon={
              <svg className="w-5 h-5 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-end gap-2 h-48 sm:h-56"
              >
                {sortedClauses.map((clause, i) => {
                  const height = (clause.risk_score / 10) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-foreground text-surface text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10">
                        {clause.name}: {clause.risk_score}/10
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                        className="w-full rounded-t-md hover:opacity-80"
                        style={{ backgroundColor: getRiskColor(clause.risk_score), minHeight: "4px" }}
                      />
                      <span className="text-[9px] text-subtle truncate w-full text-center leading-tight">{clause.name}</span>
                    </div>
                  );
                })}
              </motion.div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-subtle">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-success" />
                  <span>Low (0-3)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-warning" />
                  <span>Medium (4-6)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-danger" />
                  <span>High (7-10)</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-success/10 rounded-xl p-3 text-center border border-success/20">
                  <p className="text-lg font-bold text-success">{sortedClauses.filter(c => c.risk_score < 4).length}</p>
                  <p className="text-[10px] text-subtle font-medium">Low Risk</p>
                </div>
                <div className="bg-warning/10 rounded-xl p-3 text-center border border-warning/20">
                  <p className="text-lg font-bold text-warning">{sortedClauses.filter(c => c.risk_score >= 4 && c.risk_score < 7).length}</p>
                  <p className="text-[10px] text-subtle font-medium">Medium Risk</p>
                </div>
                <div className="bg-danger/10 rounded-xl p-3 text-center border border-danger/20">
                  <p className="text-lg font-bold text-danger">{sortedClauses.filter(c => c.risk_score >= 7).length}</p>
                  <p className="text-[10px] text-subtle font-medium">High Risk</p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {/* ===== Sticky Navigation (mobile) ===== */}
        <div className="sticky bottom-4 z-20 lg:hidden">
          <div className="bg-surface/95 backdrop-blur-md rounded-2xl shadow-lg border border-border p-2 flex overflow-x-auto gap-1">
            {sections.slice(0, 7).map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className="px-3 py-1.5 text-[10px] font-medium text-subtle hover:text-primary hover:bg-primary/5 rounded-lg whitespace-nowrap transition-colors flex-shrink-0">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* ===== Disclaimer ===== */}
        <motion.div
          id="disclaimer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center p-4 sm:p-6 bg-surface-hover rounded-2xl border border-border"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-4 h-4 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-subtle uppercase tracking-wider">Disclaimer</span>
          </div>
          <p className="text-xs text-subtle italic leading-relaxed max-w-xl mx-auto">
            This report is AI-generated and does not constitute legal advice. It is intended for informational and educational purposes only. The analysis may contain errors, omissions, or inaccuracies. Always consult a qualified lawyer licensed in your jurisdiction for legal decisions. By using this report, you agree that LeGuard-AI and its operators bear no liability for any actions taken based on this analysis.
          </p>
          <p className="text-[10px] text-muted mt-3">
            Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </motion.div>

      </div>
    </div>
  );
}
