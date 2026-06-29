"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export interface Subscription {
  id: string;
  plan: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  description: string;
}

export function useSubscription() {
  return useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await authFetch("/api/subscription");
      if (!res.ok) return null;
      return res.json();
    },
  });
}

export function usePaymentHistory() {
  return useQuery<PaymentRecord[]>({
    queryKey: ["subscription", "payments"],
    queryFn: async () => {
      const res = await authFetch("/api/subscription/payments");
      if (!res.ok) throw new Error("Failed to fetch payment history");
      return res.json();
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation<Subscription, Error, void>({
    mutationFn: async () => {
      const res = await authFetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}

export interface UpdatePlanInput {
  plan: string;
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation<Subscription, Error, UpdatePlanInput>({
    mutationFn: async (input) => {
      const res = await authFetch("/api/subscription/plan", {
        method: "PUT",
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Plan update failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}
