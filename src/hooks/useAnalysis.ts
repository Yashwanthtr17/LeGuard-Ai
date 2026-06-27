"use client";

import { useCallback } from "react";
import { useAnalysisStore } from "@/store/analysisStore";

export function useAnalysis() {
  const store = useAnalysisStore();

  const analyze = useCallback(async (file: File, jurisdiction: string, documentType: string, focusAreas: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("leguard_token") : null;
    if (!token) {
      store.setError("Authentication required. Please sign in.");
      return;
    }

    store.reset();
    store.setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jurisdiction", jurisdiction);
    formData.append("document_type", documentType);
    formData.append("focus_areas", focusAreas);

    store.setStatus("analyzing");
    store.setProgress(30);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        store.setError(data.message || "Analysis failed");
        return null;
      }

      store.setProgress(100);
      return data.id as string;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error. Please check your connection.";
      store.setError(message);
      return null;
    }
  }, [store]);

  return { ...store, analyze };
}
