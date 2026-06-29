"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAdminAnalytics } from "@/lib/hooks/use-admin";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6b7280"];

function LoadingSkeleton() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="h-8 w-40 bg-surface-hover rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-hover rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 h-80 bg-surface-hover rounded-2xl animate-pulse" />
          <div className="h-80 bg-surface-hover rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError } = useAdminAnalytics();
  const router = useRouter();
  const [mounted] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      const isAdmin = localStorage.getItem("leguard_admin") === "true";
      if (!isAuthenticated || !user || !isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (!mounted || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = localStorage.getItem("leguard_admin") === "true";
  if (!isAuthenticated || !user || !isAdmin) return null;

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger font-semibold">Failed to load analytics.</p>
          <p className="text-sm text-subtle mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const signupsMerged = data?.signups_over_time?.map((s) => {
    const analysis = data?.analyses_over_time?.find((a) => a.date === s.date);
    return {
      date: s.date,
      signups: s.count,
      analyses: analysis?.count || 0,
    };
  }) || [];

  const riskData = Object.entries(data?.risk_distribution || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const totalRisk = riskData.reduce((sum, d) => sum + d.value, 0);

  const totalSignups = (data?.signups_over_time || []).reduce((sum, d) => sum + d.count, 0);
  const totalAnalyses = signupsMerged.reduce((sum, d) => sum + d.analyses, 0);

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-subtle hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-subtle text-sm mt-1">Detailed platform metrics and trends</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Total Signups</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{totalSignups.toLocaleString()}</p>
          </div>
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Total Analyses</p>
            <p className="text-2xl sm:text-3xl font-bold text-accent">{totalAnalyses.toLocaleString()}</p>
          </div>
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Risk Categories</p>
            <p className="text-2xl sm:text-3xl font-bold text-success">{riskData.length}</p>
          </div>
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Jurisdictions</p>
            <p className="text-2xl sm:text-3xl font-bold text-warning">{data?.popular_jurisdictions?.length || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-2xl p-6 card-hover">
            <h2 className="text-lg font-bold text-foreground mb-6">Signups & Analyses Over Time</h2>
            {signupsMerged.length === 0 ? (
              <p className="text-sm text-muted text-center py-12">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={signupsMerged}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--color-muted, #9ca3af)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--color-muted, #9ca3af)" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-surface, #1e293b)", border: "1px solid var(--color-border, #334155)", borderRadius: 8 }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} dot={false} name="Signups" />
                  <Line type="monotone" dataKey="analyses" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Analyses" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <h2 className="text-lg font-bold text-foreground mb-6">Risk Distribution</h2>
            {riskData.length === 0 ? (
              <p className="text-sm text-muted text-center py-12">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${((value / totalRisk) * 100).toFixed(0)}%)`}
                  >
                    {riskData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 card-hover">
          <h2 className="text-lg font-bold text-foreground mb-6">Popular Jurisdictions</h2>
          {(!data?.popular_jurisdictions || data.popular_jurisdictions.length === 0) ? (
            <p className="text-sm text-muted text-center py-8">No data available.</p>
          ) : (
            <div className="space-y-4">
              {data.popular_jurisdictions.map((j) => (
                <div key={j.jurisdiction}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{j.jurisdiction}</span>
                    <span className="text-xs text-muted">{j.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${(j.count / Math.max(...data.popular_jurisdictions.map((x) => x.count))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
