"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SharedReportPage() {
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "error" | "loaded">("loading");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useState(() => {
    async function load() {
      try {
        const res = await fetch(`/api/shared/${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Share link not found or expired.");
        }
        const data = await res.json();
        setPdfUrl(data.pdf_url);
        setStatus("loaded");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shared report.");
        setStatus("error");
      }
    }
    load();
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-subtle">Loading shared report...</span>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Report Unavailable</h1>
          <p className="text-sm text-subtle mb-6">{error}</p>
          <Link href="/" className="inline-flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">LeGuard-AI</span>
          <span className="text-xs text-muted">Shared Report</span>
        </div>
        {pdfUrl && (
          <a href={pdfUrl} download
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
        )}
      </div>
      {pdfUrl && (
        <div className="w-full h-[calc(100vh-57px)]">
          <iframe src={pdfUrl} className="w-full h-full border-0" title="Shared Report" />
        </div>
      )}
      <div className="text-center py-4 text-[10px] text-muted">
        Report shared via LeGuard-AI &middot; This link will expire
      </div>
    </div>
  );
}
