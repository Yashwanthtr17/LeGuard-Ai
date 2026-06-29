"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAdminAiUsage } from "@/lib/hooks/use-admin";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
        <div className="h-80 bg-surface-hover rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

export default function AdminAIUsage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError } = useAdminAiUsage();
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
          <p className="text-danger font-semibold">Failed to load AI usage data.</p>
          <p className="text-sm text-subtle mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const usage = data?.usage || [];
  const totalTokens = usage.reduce((sum, d) => sum + d.total_tokens, 0);
  const totalRequests = usage.reduce((sum, d) => sum + d.total_requests, 0);
  const avgResponseMs = usage.length > 0
    ? Math.round(usage.reduce((sum, d) => sum + d.avg_response_time_ms, 0) / usage.length)
    : 0;

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Usage</h1>
            <p className="text-subtle text-sm mt-1">Monitor AI model consumption and costs</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Total Tokens</p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{totalTokens.toLocaleString()}</p>
            <p className="text-xs text-muted mt-0.5">Lifetime</p>
          </div>
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Total API Calls</p>
            <p className="text-2xl sm:text-3xl font-bold text-accent">{totalRequests.toLocaleString()}</p>
            <p className="text-xs text-muted mt-0.5">All time</p>
          </div>
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Avg Response Time</p>
            <p className="text-2xl sm:text-3xl font-bold text-success">{(avgResponseMs / 1000).toFixed(1)}s</p>
            <p className="text-xs text-muted mt-0.5">Across all records</p>
          </div>
          <div className="glass rounded-2xl p-5 card-hover">
            <p className="text-sm font-medium text-muted mb-2">Total Records</p>
            <p className="text-2xl sm:text-3xl font-bold text-warning">{data?.total || 0}</p>
            <p className="text-xs text-muted mt-0.5">Usage entries</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 card-hover">
          <h2 className="text-lg font-bold text-foreground mb-6">Daily Usage</h2>
          {usage.length === 0 ? (
            <p className="text-sm text-muted text-center py-12">No usage data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={usage}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "var(--color-muted, #9ca3af)" }}
                  tickFormatter={(val) => val?.split("T")[0] || val}
                />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-muted, #9ca3af)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface, #1e293b)",
                    border: "1px solid var(--color-border, #334155)",
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Bar dataKey="total_requests" fill="#6366f1" name="API Calls" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_tokens" fill="#8b5cf6" name="Tokens" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
