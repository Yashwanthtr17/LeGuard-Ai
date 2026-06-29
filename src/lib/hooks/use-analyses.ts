"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export interface AnalysisSummary {
  id: string;
  fileName: string;
  documentType: string;
  jurisdiction: string;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
}

export interface AnalysisDetail {
  id: string;
  documentName: string;
  documentType: string;
  jurisdiction: string;
  overallScore: number;
  riskLevel: string;
  verdict: string;
  executiveSummary: string;
  clauses: Array<{
    name: string;
    risk_score: number;
    risk_level: string;
    plain_english: string;
    why_it_matters: string;
    recommendation: string;
    location: string;
  }>;
  countryCompliance: Array<{
    law: string;
    status: string;
    note: string;
  }>;
  redFlags: string[];
  positiveAspects: string[];
  createdAt: string;
}

export interface AnalysesOptions {
  page?: number;
  limit?: number;
}

export function useAnalyses(options?: AnalysesOptions) {
  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  const qs = params.toString();

  return useQuery<AnalysisSummary[]>({
    queryKey: ["analyses", options],
    queryFn: async () => {
      const res = await authFetch(`/api/scan${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch analyses");
      return res.json();
    },
  });
}

export function useAnalysis(id: string) {
  return useQuery<AnalysisDetail>({
    queryKey: ["analyses", id],
    queryFn: async () => {
      const res = await authFetch(`/api/scan/${id}`);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      return res.json();
    },
    enabled: !!id,
  });
}

export interface AnalyzeDocumentInput {
  file: File;
  jurisdiction: string;
  document_type: string;
  focus_areas: string;
}

export function useAnalyzeDocument() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, AnalyzeDocumentInput>({
    mutationFn: async (input) => {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", input.file);
      formData.append("jurisdiction", input.jurisdiction);
      formData.append("document_type", input.document_type);
      formData.append("focus_areas", input.focus_areas);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Analysis failed");
      return data.id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analyses"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
