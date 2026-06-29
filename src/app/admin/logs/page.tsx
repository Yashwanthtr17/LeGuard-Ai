"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAdminLogs } from "@/lib/hooks/use-admin";

const ITEMS_PER_PAGE = 8;

const levelStyles: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  error: "bg-danger/10 text-danger",
};

function LoadingSkeleton() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="h-8 w-40 bg-surface-hover rounded-lg animate-pulse mb-6" />
        <div className="glass rounded-2xl p-6">
          <div className="flex gap-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-surface-hover rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-surface-hover rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogs() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading) {
      const isAdmin = localStorage.getItem("leguard_admin") === "true";
      if (!isAuthenticated || !user || !isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const { data, isLoading, isError } = useAdminLogs({
    page,
    limit: ITEMS_PER_PAGE,
    search: filter || undefined,
  });

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
          <p className="text-danger font-semibold">Failed to load logs.</p>
          <p className="text-sm text-subtle mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  const eventTypes = ["", ...Array.from(new Set(logs.map((l) => l.action)))];

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">System Logs</h1>
            <p className="text-subtle text-sm mt-1">Event log and audit trail ({total} entries)</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((type) => (
                <button
                  key={type || "all"}
                  onClick={() => { setFilter(type); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filter === type
                      ? "bg-primary/10 text-primary"
                      : "text-subtle hover:bg-surface-hover"
                  }`}
                >
                  {type || "All Events"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-muted">Timestamp</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted">Action</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted">User</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted hidden lg:table-cell">Details</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted">Level</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const level = log.action.includes("error") || log.action.includes("fail")
                    ? "error"
                    : log.action.includes("deleted") || log.action.includes("reset")
                      ? "warning"
                      : "info";
                  return (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-3 text-foreground font-mono text-xs whitespace-nowrap">
                        {log.created_at}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs text-subtle bg-surface-hover px-2 py-1 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-subtle text-xs">{log.user_email || log.user_id || "system"}</td>
                      <td className="py-3 px-3 text-subtle text-xs hidden lg:table-cell max-w-[300px] truncate">
                        {log.details}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${levelStyles[level] || "bg-surface-hover text-muted"}`}>
                          {level}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted">No logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-subtle hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-all ${
                      page === p ? "bg-primary text-white" : "text-subtle hover:bg-surface-hover"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-subtle hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
