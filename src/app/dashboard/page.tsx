"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useDashboardStats } from "@/lib/hooks/use-dashboard";
import { useUnreadCount } from "@/lib/hooks/use-notifications";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { useUser, useUpdateProfile } from "@/lib/hooks/use-auth";
import { useReveal } from "@/lib/use-reveal";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import type { DashboardStats } from "@/types";

interface ActivityItem {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

interface DashboardData extends DashboardStats {
  storage_used: number;
  recent_activity: ActivityItem[];
  unread_notifications: number;
  total_documents: number;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RevealSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, isVisible } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"} ${className}`}>
      {children}
    </div>
  );
}

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const updateProfile = useUpdateProfile();

  const handleComplete = () => {
    updateProfile.mutate(
      { onboarding_complete: true },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl shadow-2xl border border-border max-w-lg w-full p-8 animate-scale-in">
        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome to LeGuard-AI!</h2>
            <p className="text-sm text-subtle">Your AI-powered legal guardian. Upload any contract, NDA, or policy &mdash; get a plain-English risk analysis in seconds.</p>
            <button onClick={() => setStep(2)} className="mt-6 px-6 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all">Next</button>
          </div>
        )}
        {step === 2 && (
          <div className="text-center">
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
                <span className="text-xs font-medium text-subtle">Upload</span>
              </div>
              <div className="flex items-center text-muted text-xl">→</div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                <span className="text-xs font-medium text-subtle">Analyse</span>
              </div>
              <div className="flex items-center text-muted text-xl">→</div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center"><svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                <span className="text-xs font-medium text-subtle">Report</span>
              </div>
            </div>
            <p className="text-sm text-subtle mb-6">Upload a document → AI analyses it → Get your risk report. It&apos;s that simple.</p>
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
            <h2 className="text-xl font-bold text-foreground mb-2">You&apos;re all set!</h2>
            <p className="text-sm text-subtle mb-6">Analyse your first document now and get your risk score in seconds.</p>
            <Link href="/analyse" onClick={handleComplete} className="inline-block px-6 py-2.5 bg-gradient-to-br from-accent to-accent-hover text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Analyse your first document →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, gradient, textColor }: {
  label: string;
  value: string | number;
  icon: ReactNode;
  gradient: string;
  textColor: string;
}) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border border-border/60 card-hover transition-all duration-500 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-surface/50 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-subtle font-medium mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: rawStats, isLoading: statsLoading, isError, error, refetch } = useDashboardStats();
  const { data: unreadData } = useUnreadCount();
  const { data: subscription } = useSubscription();
  const stats = rawStats as DashboardData | undefined;
  const isLoading = userLoading || statsLoading;
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);
  const showOnboarding = !!(user && !user.onboarding_complete && !dismissedOnboarding);

  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Failed to load dashboard</h2>
          <p className="text-subtle text-sm mb-6">{error instanceof Error ? error.message : "Something went wrong. Please try again."}</p>
          <button onClick={() => refetch()} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.total_analyses === 0;
  const unreadCount = unreadData?.count ?? 0;

  const statCards = [
    {
      label: "Total Analyses",
      value: stats?.total_analyses ?? 0,
      icon: <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      gradient: "from-primary/10 to-primary/5",
      textColor: "text-primary",
    },
    {
      label: "Avg Risk Score",
      value: stats ? `${stats.avg_risk_score}/10` : "\u2014",
      icon: <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
      gradient: "from-accent/10 to-accent/5",
      textColor: "text-accent",
    },
    {
      label: "High Risk Docs",
      value: stats?.high_risk_docs ?? 0,
      icon: <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>,
      gradient: "from-danger/10 to-danger/5",
      textColor: "text-danger",
    },
    {
      label: "Storage Used",
      value: stats ? formatFileSize(stats.storage_used) : "\u2014",
      icon: <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
      gradient: "from-success/10 to-success/5",
      textColor: "text-success",
    },
  ];

  const quickActions = [
    {
      label: "New Analysis",
      href: "/analyse",
      icon: <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
    },
    {
      label: "View Reports",
      href: "/reports",
      icon: <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      label: "Upload Document",
      href: "/analyse",
      icon: <svg className="w-6 h-6 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
  ];

  return (
    <div className="flex-1 bg-background min-h-screen">
      {showOnboarding && <OnboardingModal onClose={() => setDismissedOnboarding(true)} />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <RevealSection>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {getGreeting()}, {user?.full_name?.split(" ")[0] || "there"}
              </h1>
              <p className="text-subtle text-sm mt-1">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            {unreadCount > 0 && (
              <Link href="/notifications" className="relative p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover transition-colors">
                <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
              </Link>
            )}
          </div>
        </RevealSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        <RevealSection>
          <div className="bg-surface rounded-2xl border border-border/60 p-5 mb-6 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {subscription ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan` : "Free Plan"}
                  </p>
                  <p className="text-xs text-subtle">
                    {subscription?.status === "active"
                      ? `Active until ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : subscription?.status === "trialing"
                        ? "Trial period"
                        : "Upgrade to unlock more features"}
                  </p>
                </div>
              </div>
              {(!subscription || subscription.plan === "free") && (
                <Link href="/pricing" className="px-4 py-2 bg-gradient-to-br from-primary to-primary-dark text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all">
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </RevealSection>

        {isEmpty ? (
          <RevealSection>
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 sm:p-12 text-center border border-primary/10">
              <svg className="w-16 h-16 text-primary/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-bold text-foreground mb-2">Ready to analyse a document?</h2>
              <p className="text-subtle mb-6 max-w-md mx-auto">
                Upload any contract, NDA, lease or policy — get your risk score in seconds.
              </p>
              <Link href="/analyse" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
                Start New Analysis →
              </Link>
            </div>
          </RevealSection>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <RevealSection className="lg:col-span-2">
                <div className="bg-surface rounded-2xl border border-border/60 p-6 card-hover">
                  <h2 className="text-lg font-bold text-foreground mb-4">Recent Reports</h2>
                  {stats!.recent_reports.length === 0 ? (
                    <p className="text-subtle text-sm">No reports yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats!.recent_reports.map((report) => (
                        <Link key={report.id} href={`/report/${report.id}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg ${getRiskBg(report.overall_score)} flex items-center justify-center shrink-0`}>
                              <span className={`text-xs font-bold ${getRiskColor(report.overall_score)}`}>
                                {report.overall_score}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{report.document_name}</p>
                              <p className="text-xs text-subtle">{report.country} · {new Date(report.created_at).toLocaleDateString()}</p>
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
              </RevealSection>

              <RevealSection>
                <div className="bg-surface rounded-2xl border border-border/60 p-6 card-hover">
                  <h2 className="text-lg font-bold text-foreground mb-4">Score Distribution</h2>
                  {stats!.score_distribution && (
                    <div className="flex items-end gap-1 h-32">
                      {stats!.score_distribution.slice(0, 10).map((count, i) => {
                        const maxCount = Math.max(...stats!.score_distribution, 1);
                        const height = (count / maxCount) * 100;
                        const color = i + 1 >= 7 ? "#EF4444" : i + 1 >= 4 ? "#F59E0B" : "#10B981";
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] font-bold text-muted">{count}</span>
                            <div
                              className="w-full rounded-t-md transition-all hover:opacity-80"
                              style={{ height: `${Math.max(height, 2)}%`, backgroundColor: color }}
                            />
                            <span className="text-[10px] text-muted">{i + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-muted text-center mt-3">Risk score distribution</p>
                </div>
              </RevealSection>
            </div>

            {stats!.recent_activity && stats!.recent_activity.length > 0 && (
              <RevealSection>
                <div className="bg-surface rounded-2xl border border-border/60 p-6 mb-8 card-hover">
                  <h2 className="text-lg font-bold text-foreground mb-4">Recent Activity</h2>
                  <div className="space-y-3">
                    {stats!.recent_activity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-2">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">{activity.description}</p>
                          <p className="text-xs text-subtle">{new Date(activity.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealSection>
            )}

            <RevealSection>
              <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action, i) => (
                  <Link key={i} href={action.href}
                    className="bg-surface rounded-2xl border border-border/60 p-5 card-hover text-center hover:bg-surface-hover transition-all group flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-surface-hover group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                      {action.icon}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                  </Link>
                ))}
              </div>
            </RevealSection>

            <RevealSection>
              <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl p-6 border border-accent/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Ready to analyse another document?</h3>
                    <p className="text-sm text-subtle mt-1">Upload any contract, NDA, lease or policy — get your risk score in seconds.</p>
                  </div>
                  <Link href="/analyse" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-accent to-accent-hover text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/20 transition-all shrink-0">
                    Start New Analysis →
                  </Link>
                </div>
              </div>
            </RevealSection>
          </>
        )}
      </div>
    </div>
  );
}
