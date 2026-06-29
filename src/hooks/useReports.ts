"use client";

import { useState, useEffect } from "react";
import type { ReportSummary } from "@/types";

interface UseReportsReturn {
  reports: ReportSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("leguard_token") : null;

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    const id = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      fetch("/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch reports");
          return res.json();
        })
        .then(data => {
          if (!cancelled) setReports(data.reports || data || []);
        })
        .catch(err => {
          if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load reports");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => { cancelled = true; clearTimeout(id); };
  }, [token]);

  function refresh() {
    setLoading(true);
    setError(null);
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/reports", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch reports");
        return res.json();
      })
      .then(data => setReports(data.reports || data || []))
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load reports"))
      .finally(() => setLoading(false));
  }

  return { reports, loading, error, refresh };
}
