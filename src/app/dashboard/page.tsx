"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface DashboardStats {
  total_analyses: number;
  avg_risk_score: number;
  high_risk_docs: number;
  reports_saved: number;
  score_distribution: number[];
  recent_reports: Array<{
    id: string;
    document_name: string;
    document_type: string;
    country: string;
    overall_score: number;
    risk_level: string;
    created_at: string;
  }>;
}

function getRiskColor(score: number): string {
  if (score >= 7) return "text-danger";
  if (score >= 4) return "text-warning";
  return "text-success";
}

function getRiskBg(score: number): string {
  if (score >= 7) return "bg-danger/10";
  if (score >= 4) return "bg-warning/10";
  return "bg-success/10";
}

function getRiskBadge(score: number): string {
  if (score >= 7) return "bg-danger text-white";
  if (score >= 4) return "bg-warning text-white";
  return "bg-success text-white";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-8 animate-scale-in">
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to LeGuard-AI!</h2>
            <p className="text-sm text-slate-600">Your AI-powered legal guardian. Upload any contract, NDA, or policy &mdash; get a plain-English risk analysis in seconds.</p>
            <button onClick={() => setStep(2)} className="mt-6 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all">Next</button>
          </div>
        )}
        {step === 2 && (
          <div className="text-center">
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
                <span className="text-xs font-medium text-slate-600">Upload</span>
              </div>
              <div className="flex items-center text-slate-300 text-xl">→</div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                <span className="text-xs font-medium text-slate-600">Analyse</span>
              </div>
              <div className="flex items-center text-slate-300 text-xl">→</div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                <span className="text-xs font-medium text-slate-600">Report</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">Upload a document → AI analyses it → Get your risk report. It&apos;s that simple.</p>
            <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all">Next</button>
          </div>
        )}
        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">You&apos;re all set!</h2>
            <p className="text-sm text-slate-600 mb-6">Analyse your first document now and get your risk score in seconds.</p>
            <Link href="/analyse" onClick={onComplete} className="inline-block px-6 py-2.5 bg-gradient-to-br from-accent to-accent-hover text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Analyse your first document →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("leguard_token") : null;

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (isAuthenticated) {
      fetchStats();
      if (user && !user.onboarding_complete) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, authLoading, fetchStats, router, user]);

  async function completeOnboarding() {
    if (!token) return;
    await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ onboarding_complete: true }),
    });
    updateUser({ onboarding_complete: true });
    setShowOnboarding(false);
  }

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const statCards = [
    { label: "Total Analyses", value: stats?.total_analyses ?? 0, icon: "📊", color: "from-primary/10 to-primary/5", textColor: "text-primary" },
    { label: "Avg Risk Score", value: stats ? `${stats.avg_risk_score}/10` : "—", icon: "🎯", color: "from-accent/10 to-accent/5", textColor: "text-accent" },
    { label: "High Risk Docs", value: stats?.high_risk_docs ?? 0, icon: "⚠️", color: "from-danger/10 to-danger/5", textColor: "text-danger" },
    { label: "Reports Saved", value: stats?.reports_saved ?? 0, icon: "📁", color: "from-success/10 to-success/5", textColor: "text-success" },
  ];

  return (
    <div className="flex-1 bg-background min-h-screen">
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {getGreeting()}, {user?.full_name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 border border-slate-200/60 card-hover`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {(!stats || stats.total_analyses === 0) ? (
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 sm:p-12 text-center border border-primary/10">
            <svg className="w-16 h-16 text-primary/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to analyse a document?</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Upload any contract, NDA, lease or policy — get your risk score in seconds.
            </p>
            <Link href="/analyse" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
              Start New Analysis →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 p-6 card-hover">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Reports</h2>
                {stats.recent_reports.length === 0 ? (
                  <p className="text-slate-500 text-sm">No reports yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recent_reports.map((report) => (
                      <Link key={report.id} href={`/report/${report.id}`}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg ${getRiskBg(report.overall_score)} flex items-center justify-center shrink-0`}>
                            <span className={`text-xs font-bold ${getRiskColor(report.overall_score)}`}>
                              {report.overall_score}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-primary transition-colors">{report.document_name}</p>
                            <p className="text-xs text-slate-500">{report.country} · {new Date(report.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getRiskBadge(report.overall_score)}`}>
                          {report.risk_level}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/reports" className="inline-block mt-4 text-sm text-accent font-semibold hover:underline">
                  View All Reports →
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 p-6 card-hover">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Score Distribution</h2>
                {stats.score_distribution && (
                  <div className="flex items-end gap-1 h-32">
                    {stats.score_distribution.slice(0, 10).map((count, i) => {
                      const maxCount = Math.max(...stats.score_distribution, 1);
                      const height = (count / maxCount) * 100;
                      const color = i + 1 >= 7 ? "#E53E3E" : i + 1 >= 4 ? "#D69E2E" : "#38A169";
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-slate-400">{count}</span>
                          <div
                            className="w-full rounded-t-md transition-all hover:opacity-80"
                            style={{ height: `${Math.max(height, 2)}%`, backgroundColor: color }}
                          />
                          <span className="text-[10px] text-slate-400">{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-slate-400 text-center mt-3">Risk score distribution</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-6 border border-accent/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Ready to analyse another document?</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload any contract, NDA, lease or policy — get your risk score in seconds.</p>
                </div>
                <Link href="/analyse" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-accent to-accent-hover text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all shrink-0">
                  Start New Analysis →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
