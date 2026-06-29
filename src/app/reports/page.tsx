"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-auth";
import { useReports, useDeleteReport } from "@/lib/hooks/use-reports";
import { TableSkeleton } from "@/components/ui/Skeleton";

function getRiskBadge(score: number): string {
  if (score >= 7) return "bg-danger text-white";
  if (score >= 4) return "bg-warning text-white";
  return "bg-success text-white";
}

function getRiskTextColor(score: number): string {
  if (score >= 7) return "text-danger";
  if (score >= 4) return "text-warning";
  return "text-success";
}

function ConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-2xl border border-border p-6 max-w-sm w-full animate-scale-in">
        <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground text-center mb-2">Delete Report</h3>
        <p className="text-sm text-subtle text-center mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-colors text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data: user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useReports({
    search: search || undefined,
    risk_level: riskFilter !== "all" ? riskFilter : undefined,
    sort: sort as "newest" | "oldest" | "highest" | "lowest",
    page,
  });

  const deleteReport = useDeleteReport();

  const reports = data?.reports ?? [];
  const totalPages = data?.total_pages ?? 1;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/reports");
    }
  }, [user, authLoading, router]);

  function setSearchAndResetPage(value: string) {
    setSearch(value);
    setPage(1);
  }
  function setRiskFilterAndResetPage(value: string) {
    setRiskFilter(value);
    setPage(1);
  }
  function setSortAndResetPage(value: string) {
    setSort(value);
    setPage(1);
  }

  function handleDelete(id: string) {
    deleteReport.mutate(id, {
      onSettled: () => setDeleteTarget(null),
    });
  }

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 bg-background min-h-screen">
      {deleteTarget && (
        <ConfirmModal
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Reports</h1>
            <p className="text-sm text-subtle mt-1">All your past document analyses, saved securely.</p>
          </div>
          <Link href="/analyse" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Analysis
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input type="text" value={search} onChange={(e) => setSearchAndResetPage(e.target.value)}
              placeholder="Search by document name..."
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-surface text-foreground placeholder:text-muted" />
          </div>
          <select value={riskFilter} onChange={(e) => setRiskFilterAndResetPage(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border text-sm bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="all">All Risk Levels</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={sort} onChange={(e) => setSortAndResetPage(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-border text-sm bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Risk</option>
            <option value="lowest">Lowest Risk</option>
          </select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : isError ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center">
            <svg className="w-16 h-16 text-danger mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load reports</h3>
            <p className="text-sm text-subtle mb-6">{error instanceof Error ? error.message : "Something went wrong."}</p>
            <button onClick={() => refetch()} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center">
            <svg className="w-16 h-16 text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">No reports yet</h3>
            <p className="text-sm text-subtle mb-6">Start your first analysis to see results here.</p>
            <Link href="/analyse" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Start First Analysis →
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/80 text-xs font-semibold text-subtle uppercase tracking-wider">
                      <th className="p-4">Document Name</th>
                      <th className="p-4 hidden sm:table-cell">Type</th>
                      <th className="p-4 hidden md:table-cell">Country</th>
                      <th className="p-4">Risk Score</th>
                      <th className="p-4 hidden sm:table-cell">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="p-4">
                          <Link href={`/report/${report.id}`} className="text-sm font-medium text-primary hover:underline truncate block max-w-[200px] sm:max-w-xs">
                            {report.document_name}
                          </Link>
                        </td>
                        <td className="p-4 text-sm text-subtle hidden sm:table-cell">{report.document_type || "—"}</td>
                        <td className="p-4 text-sm text-subtle hidden md:table-cell">{report.country}</td>
                        <td className="p-4">
                          <span className={`text-sm font-bold ${getRiskTextColor(report.overall_score)}`}>
                            {report.overall_score}/10
                          </span>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${getRiskBadge(report.overall_score)}`}>
                            {report.risk_level}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-subtle hidden sm:table-cell">
                          {new Date(report.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/report/${report.id}`}
                              className="px-3 py-1.5 text-xs font-semibold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
                              View
                            </Link>
                            <button onClick={() => setDeleteTarget(report.id)}
                              className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium rounded-xl border border-border hover:bg-surface-hover disabled:opacity-40 transition-colors text-foreground">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm font-medium rounded-xl transition-colors ${page === p ? "bg-primary text-white" : "border border-border hover:bg-surface-hover text-foreground"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-2 text-sm font-medium rounded-xl border border-border hover:bg-surface-hover disabled:opacity-40 transition-colors text-foreground">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
