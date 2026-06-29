"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RiskReport, ReportSummary, PaginatedResponse } from "@/types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("leguard_token");
}

async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export interface ReportsOptions {
  search?: string;
  country?: string;
  risk_level?: string;
  sort?: "newest" | "oldest" | "highest" | "lowest";
  page?: number;
}

export interface ReportsResponse extends PaginatedResponse<ReportSummary> {
  reports: ReportSummary[];
}

export function useReports(options?: ReportsOptions) {
  const params = new URLSearchParams();
  if (options?.search) params.set("search", options.search);
  if (options?.country) params.set("country", options.country);
  if (options?.risk_level) params.set("risk_level", options.risk_level);
  if (options?.sort) params.set("sort", options.sort);
  if (options?.page) params.set("page", String(options.page));
  const qs = params.toString();

  return useQuery<ReportsResponse>({
    queryKey: ["reports", options],
    queryFn: async () => {
      const res = await authFetch(`/api/reports${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });
}

export function useReport(id: string) {
  return useQuery<RiskReport>({
    queryKey: ["reports", id],
    queryFn: async () => {
      const res = await authFetch(`/api/reports/${id}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await authFetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useFavoriteReport() {
  const queryClient = useQueryClient();

  return useMutation<{ favorited: boolean }, Error, string>({
    mutationFn: async (id) => {
      const res = await authFetch(`/api/reports/${id}/favorite`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle favorite");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDownloadReportPdf() {
  return useMutation<Blob, Error, string>({
    mutationFn: async (id) => {
      const token = getToken();
      const res = await fetch(`/api/reports/${id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      return res.blob();
    },
  });
}

export interface ShareReportInput {
  id: string;
  expires_in_days?: number;
}

export function useShareReport() {
  return useMutation<{ share_url: string }, Error, ShareReportInput>({
    mutationFn: async (input) => {
      const res = await authFetch(`/api/reports/${input.id}/share`, {
        method: "POST",
        body: JSON.stringify({ expires_in_days: input.expires_in_days ?? 7 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create share link");
      return data;
    },
  });
}
