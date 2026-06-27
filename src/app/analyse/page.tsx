"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAnalysis } from "@/hooks/useAnalysis";
import { UploadZone } from "@/components/analyzer/UploadZone";
import { ConfigurationForm } from "@/components/analyzer/ConfigurationForm";
import { AnalysisProgress } from "@/components/analyzer/AnalysisProgress";

export default function AnalysePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { status, error: analysisError, analyze } = useAnalysis();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("Contract / Agreement");
  const [country, setCountry] = useState("United States");
  const [focusAreas, setFocusAreas] = useState<string[]>(["liability", "termination"]);
  const [sensitivity, setSensitivity] = useState("standard");

  const isScanning = status === "uploading" || status === "parsing" || status === "analyzing";

  const progressLabels = [
    "Extracting document text…",
    "Identifying legal clauses…",
    "Cross-referencing legal framework…",
    "Calculating risk score…",
    "Generating your report…",
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/analyse");
    }
  }, [isAuthenticated, authLoading, router]);

  async function handleAnalyse() {
    if (!file) return;
    setError(null);
    const reportId = await analyze(file, country, documentType, focusAreas.join(", "));
    if (reportId) {
      router.push(`/report/${reportId}`);
    }
  }

  function toggleFocus(area: string) {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const displayError = error || analysisError;

  return (
    <div className="flex-1 bg-gradient-to-b from-background to-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? "bg-primary text-white" : "bg-slate-200 text-slate-400"
              }`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? "text-primary" : "text-slate-400"} hidden sm:block`}>
                {s === 1 ? "Upload" : s === 2 ? "Configure" : "Analyse"}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {isScanning ? (
          <AnalysisProgress fileName={file?.name || ""} progressLabel={progressLabels[0]} />
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Upload your document</h2>
                <UploadZone
                  file={file}
                  onFileAccepted={(f) => { setFile(f); setError(null); }}
                  onFileRejected={(reason) => setError(reason)}
                />
                {displayError && (
                  <div className="mt-4 bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm">
                    {displayError}
                  </div>
                )}
                <button
                  onClick={() => setStep(2)}
                  disabled={!file}
                  className="mt-6 w-full py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <ConfigurationForm
                documentType={documentType}
                country={country}
                focusAreas={focusAreas}
                sensitivity={sensitivity}
                onDocumentTypeChange={setDocumentType}
                onCountryChange={setCountry}
                onToggleFocus={toggleFocus}
                onSensitivityChange={setSensitivity}
                onBack={() => setStep(1)}
                onAnalyse={handleAnalyse}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
