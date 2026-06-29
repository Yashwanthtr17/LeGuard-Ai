"use client";

import { useQuery } from "@tanstack/react-query";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("leguard_token");
}

async function authFetch(url: string): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { headers });
}

export interface AdminStats {
  total_users: number;
  total_reports: number;
  total_analyses: number;
  active_users_today: number;
  avg_risk_score: number;
  storage_used_mb: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in: string | null;
  total_reports: number;
  plan: string;
}

export interface AdminReport {
  id: string;
  user_id: string;
  user_email: string;
  document_name: string;
  risk_level: string;
  created_at: string;
  deleted: boolean;
}

export interface AdminAnalytics {
  signups_over_time: Array<{ date: string; count: number }>;
  analyses_over_time: Array<{ date: string; count: number }>;
  risk_distribution: Record<string, number>;
  popular_jurisdictions: Array<{ jurisdiction: string; count: number }>;
}

export interface AiUsageRecord {
  date: string;
  total_requests: number;
  total_tokens: number;
  avg_response_time_ms: number;
}

export interface AdminLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  details: string;
  ip_address: string | null;
  created_at: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await authFetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
  });
}

export function useAdminUsers(options?: PaginationOptions) {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.search) params.set("search", options.search);
  const qs = params.toString();

  return useQuery<{ users: AdminUser[]; total: number; page: number; total_pages: number }>({
    queryKey: ["admin", "users", options],
    queryFn: async () => {
      const res = await authFetch(`/api/admin/users${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}

export function useAdminReports(options?: PaginationOptions) {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.search) params.set("search", options.search);
  const qs = params.toString();

  return useQuery<{ reports: AdminReport[]; total: number; page: number; total_pages: number }>({
    queryKey: ["admin", "reports", options],
    queryFn: async () => {
      const res = await authFetch(`/api/admin/reports${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });
}

export function useAdminAnalytics() {
  return useQuery<AdminAnalytics>({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await authFetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });
}

export function useAdminAiUsage(options?: PaginationOptions) {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  const qs = params.toString();

  return useQuery<{ usage: AiUsageRecord[]; total: number }>({
    queryKey: ["admin", "ai-usage", options],
    queryFn: async () => {
      const res = await authFetch(`/api/admin/ai-usage${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch AI usage");
      return res.json();
    },
  });
}

export function useAdminLogs(options?: PaginationOptions) {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.search) params.set("search", options.search);
  const qs = params.toString();

  return useQuery<{ logs: AdminLog[]; total: number; page: number; total_pages: number }>({
    queryKey: ["admin", "logs", options],
    queryFn: async () => {
      const res = await authFetch(`/api/admin/logs${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });
}
