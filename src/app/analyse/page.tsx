"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-auth";
import { useAnalyzeDocument } from "@/lib/hooks/use-analyses";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ConfigurationForm } from "@/components/analyzer/ConfigurationForm";
import { AnalysisProgress } from "@/components/analyzer/AnalysisProgress";

const PROGRESS_LABELS = [
  "Extracting document text…",
  "Identifying legal clauses…",
  "Cross-referencing legal framework…",
  "Calculating risk score…",
  "Generating your report…",
];

export default function AnalysePage() {
  const { data: user, isLoading: authLoading } = useUser();
  const router = useRouter();
  const analyzeMutation = useAnalyzeDocument();


  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("Contract / Agreement");
  const [country, setCountry] = useState("United States");
  const [focusAreas, setFocusAreas] = useState<string[]>(["liability", "termination"]);
  const [sensitivity, setSensitivity] = useState("standard");
  const [progressIndex, setProgressIndex] = useState(0);

  const isScanning = analyzeMutation.isPending;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/analyse");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setProgressIndex(prev => Math.min(prev + 1, PROGRESS_LABELS.length - 1));
    }, 3000);
    return () => {
      clearInterval(interval);
      setProgressIndex(0);
    };
  }, [isScanning]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const msg = rejections[0]?.errors[0]?.message || "File not supported. Please upload PDF, DOCX, or image (max 10 MB).";
    setError(msg);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  async function handleAnalyse() {
    if (!file) return;
    setError(null);
    try {
      const reportId = await analyzeMutation.mutateAsync({
        file,
        jurisdiction: country,
        document_type: documentType,
        focus_areas: focusAreas.join(", "),
      });
      router.push(`/report/${reportId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
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

  if (!user) return null;

  const displayError = error || (analyzeMutation.isError ? analyzeMutation.error.message : null);

  return (
    <div className="flex-1 bg-gradient-to-b from-background to-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s ? "bg-primary text-white" : "bg-surface text-subtle border border-border"
              }`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? "text-primary" : "text-subtle"} hidden sm:block`}>
                {s === 1 ? "Upload" : s === 2 ? "Configure" : "Analyse"}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {isScanning ? (
          <AnalysisProgress fileName={file?.name || ""} progressLabel={PROGRESS_LABELS[progressIndex]} />
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {step === 1 && (
              <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">Upload your document</h2>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                    isDragActive
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border hover:border-primary/40 hover:bg-surface-hover/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-foreground">{file.name}</p>
                      <p className="text-sm text-subtle">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-sm text-danger font-semibold hover:underline"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-14 h-14 bg-surface-hover rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">Drag & drop your document here</p>
                        <p className="text-sm text-subtle mt-1">or click to browse</p>
                      </div>
                      <button
                        type="button"
                        className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-light text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer text-sm"
                      >
                        Browse Files
                      </button>
                      <p className="text-xs text-muted">Supported: PDF, DOCX, DOC, TXT, PNG, JPG (max 10 MB)</p>
                    </div>
                  )}
                </div>
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
