"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AuthUser } from "@/types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("leguard_token");
}

async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

export function useProfile() {
  return useQuery<AuthUser | null>({
    queryKey: ["user"],
    queryFn: async () => {
      const token = getToken();
      if (!token) return null;
      const res = await authFetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 60_000,
    retry: false,
  });
}

export interface UpdatePasswordInput {
  current_password: string;
  new_password: string;
}

export function useUpdatePassword() {
  return useMutation<AuthUser, Error, UpdatePasswordInput>({
    mutationFn: async (input) => {
      const res = await authFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password update failed");
      return data;
    },
  });
}

export function useUpdateTheme() {
  return useMutation<void, Error, string>({
    mutationFn: async (theme) => {
      const res = await authFetch("/api/settings/theme", {
        method: "PUT",
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Theme update failed");
      }
    },
  });
}

export function useDeleteAccount() {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await authFetch("/api/auth/me", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Account deletion failed");
      }
    },
  });
}

export function useExportData() {
  return useMutation<Blob, Error, void>({
    mutationFn: async () => {
      const token = getToken();
      const res = await fetch("/api/auth/export", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Export failed");
      return res.blob();
    },
  });
}
