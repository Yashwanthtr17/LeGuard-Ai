"use client";

import { useState, useEffect, useCallback } from "react";
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

  const fetchReports = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch reports");
      }
      const data = await res.json();
      setReports(data.reports || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, error, refresh: fetchReports };
}
