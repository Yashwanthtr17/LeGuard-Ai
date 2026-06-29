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

export interface DocumentSummary {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  analyzed: boolean;
}

export interface DocumentsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

export interface DocumentsResponse {
  documents: DocumentSummary[];
  total: number;
  page: number;
  total_pages: number;
}

export function useDocuments(options?: DocumentsOptions) {
  const params = new URLSearchParams();
  if (options?.search) params.set("search", options.search);
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  const qs = params.toString();

  return useQuery<DocumentsResponse>({
    queryKey: ["documents", options],
    queryFn: async () => {
      const res = await authFetch(`/api/documents${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });
}

export function useDocument(id: string) {
  return useQuery<DocumentSummary & { text_preview?: string }>({
    queryKey: ["documents", id],
    queryFn: async () => {
      const res = await authFetch(`/api/documents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch document");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, Error, FormData>({
    mutationFn: async (formData) => {
      const token = getToken();
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await authFetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
