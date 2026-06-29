"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase";
import type { AuthUser } from "@/types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("leguard_token");
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("leguard_token", token);
  } else {
    localStorage.removeItem("leguard_token");
  }
}

async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (options?.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }
  return fetch(url, { ...options, headers });
}

interface LoginInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface LoginResponse {
  token: string;
  refresh_token: string;
  user: AuthUser;
}

interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
  default_country?: string;
}

interface RegisterResponse {
  token: string;
  user: AuthUser;
}

interface UpdateProfileInput {
  full_name?: string;
  default_country?: string;
  risk_sensitivity?: string;
  onboarding_complete?: boolean;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setToken(data.token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: async (input) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setToken(data.token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      setToken(null);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useUser() {
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

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, UpdateProfileInput>({
    mutationFn: async (input) => {
      const res = await authFetch("/api/auth/me", {
        method: "PUT",
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useOAuthSignIn() {
  return useMutation<void, Error, string>({
    mutationFn: async (provider: string) => {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw new Error(error.message);
    },
  });
}
