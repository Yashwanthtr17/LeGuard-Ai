"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

interface ScanSummary {
  id: string;
  fileName: string;
  fileType: string;
  jurisdiction: string;
  detectedCountry: string;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
}

function getRiskColor(score: number): string {
  if (score >= 8) return "text-danger";
  if (score >= 5) return "text-warning";
  if (score >= 3) return "text-amber-600";
  return "text-success";
}

function ConfirmDialog({
  fileName,
  onConfirm,
  onCancel,
}: {
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full animate-scale-in">
        <div className="w-12 h-12 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Scan Result</h3>
        <p className="text-sm text-slate-600 text-center mb-6">
          Are you sure you want to delete <strong className="text-slate-800">{fileName}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-danger text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ScanSummary | null>(null);

  const fetchScans = useCallback(async () => {
    try {
      const res = await fetch("/api/scan");
      if (res.ok) {
        const data = await res.json();
        setScans(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchScans();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchScans]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/scan/${id}`, { method: "DELETE" });
      if (res.ok) {
        setScans((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeleteTarget(null);
    }
  }

  function handleDownload(scan: ScanSummary) {
    const content = JSON.stringify(scan, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = scan.fileName.replace(/\.[^.]+$/, "") + "_analysis.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Sign in to continue</h2>
          <p className="text-slate-600 text-sm mb-6">
            You need to sign in to view your scan history.
          </p>
          <Link
            href="/login?redirect=/history"
            className="inline-block w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            Sign In / Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface-hover/30 py-8 sm:py-12">
      {deleteTarget && (
        <ConfirmDialog
          fileName={deleteTarget.fileName}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">Activity Hub</h1>
            <p className="text-sm sm:text-base text-slate-600">
              {scans.length === 0
                ? "No document scans yet. Start a new analysis to see results here."
                : `Your editorial dashboard — ${scans.length} scan${scans.length !== 1 ? "s" : ""} in total.`}
            </p>
          </div>
          <Link href="/scan">
            <Button variant="primary" size="sm">New Analysis</Button>
          </Link>
        </div>

        {scans.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center card-hover animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No scans yet</h3>
            <p className="text-sm text-slate-500 mb-6">
              Upload your first legal document to get started.
            </p>
            <Link href="/scan">
              <Button variant="premium">Analyze a Document</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden card-hover animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-3 sm:p-4">Document Name</th>
                    <th className="p-3 sm:p-4 hidden sm:table-cell">Jurisdiction</th>
                    <th className="p-3 sm:p-4">Risk</th>
                    <th className="p-3 sm:p-4 hidden sm:table-cell">Date</th>
                    <th className="p-3 sm:p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-white transition-all duration-200">
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center min-w-0">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 sm:mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="min-w-0">
                            <span
                              onClick={() => router.push(`/scan/${scan.id}`)}
                              className="text-sm sm:text-base font-medium text-primary hover:underline cursor-pointer truncate block"
                            >
                              {scan.fileName}
                            </span>
                            <span className="text-[11px] sm:hidden text-slate-500">
                              {scan.detectedCountry || scan.jurisdiction} &middot; Risk {scan.riskScore}/10
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-slate-600 text-sm hidden sm:table-cell">
                        {scan.detectedCountry || scan.jurisdiction || "N/A"}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={`text-sm sm:text-base font-bold ${getRiskColor(scan.riskScore)}`}>
                          {scan.riskScore}/10
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-slate-500 text-sm hidden sm:table-cell">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(scan)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200"
                            title="Download analysis"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(scan)}
                            className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 rounded-xl transition-all duration-200"
                            title="Delete scan"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <Link href={`/scan/${scan.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
