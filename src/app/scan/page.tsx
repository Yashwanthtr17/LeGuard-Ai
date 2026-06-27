"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { JURISDICTIONS } from "@/lib/ai";

const SCAN_STAGES = [
  { label: "Uploading document...", range: [0, 15] },
  { label: "Extracting text from document...", range: [15, 30] },
  { label: "Analyzing legal structure...", range: [30, 50] },
  { label: "AI reviewing for risks & hidden threats...", range: [50, 80] },
  { label: "Generating plain-English report...", range: [80, 95] },
  { label: "Finalizing analysis...", range: [95, 100] },
];

function getStage(progress: number): string {
  for (const s of SCAN_STAGES) {
    if (progress >= s.range[0] && progress < s.range[1]) return s.label;
  }
  return "Finalizing analysis...";
}

export default function ScanPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jurisdiction, setJurisdiction] = useState("auto");
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const router = useRouter();
  const fileRef = useRef<File | null>(null);
  const progressRef = useRef(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startProgressAnimation() {
    progressRef.current = 0;
    setProgress(0);
    animRef.current = setInterval(() => {
      progressRef.current += Math.random() * 2 + 0.5;
      if (progressRef.current >= 99) {
        progressRef.current = 99;
        if (animRef.current) clearInterval(animRef.current);
      }
      setProgress(Math.min(progressRef.current, 99));
    }, 300);
  }

  function completeProgress() {
    if (animRef.current) clearInterval(animRef.current);
    progressRef.current = 100;
    setProgress(100);
  }

  async function handleFileSelect(file: File) {
    setFileName(file.name);
    setError(null);
    fileRef.current = file;
    setIsScanning(true);
    startProgressAnimation();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jurisdiction", jurisdiction);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Scan failed");
      }

      completeProgress();
      setTimeout(() => router.push(`/scan/${data.id}`), 600);
    } catch (err) {
      if (animRef.current) clearInterval(animRef.current);
      setProgress(0);
      setIsScanning(false);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleBrowseClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.docx,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-gradient-to-b from-surface-hover/30 to-surface-hover/60 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center animate-scale-in">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Sign in to continue</h2>
          <p className="text-slate-600 text-sm mb-6">
            You need to sign in or create an account before you can upload and analyze legal documents.
          </p>
          <Link
            href="/login?redirect=/scan"
            className="inline-block w-full py-3 bg-gradient-to-br from-primary to-primary-light text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
          >
            Sign In / Sign Up
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            It takes just a few seconds to create an account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-surface-hover/20 via-surface-hover/30 to-white">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs sm:text-sm font-medium text-primary mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
            New Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Document Analysis</h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl px-2">
            Upload a legal document and select the jurisdiction to analyze against.
          </p>
        </div>

        {!isScanning ? (
          <div className="w-full space-y-5 sm:space-y-6 animate-fade-in-up stagger-1">
            <div className="bg-white/80 backdrop-blur-sm p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Jurisdiction for Analysis
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                }}
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                The document will be analyzed based on the selected country&apos;s laws and legal framework.
              </p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragOver
                  ? "border-primary bg-gradient-to-br from-primary/5 via-primary/[0.02] to-accent/5 scale-[1.01] shadow-lg shadow-primary/10"
                  : "border-slate-300 bg-white/80 hover:border-primary/40 hover:bg-slate-50/50 hover:shadow-md"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDragOver ? "bg-primary/15 scale-110" : "bg-slate-100"
                }`}>
                  <svg className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                    isDragOver ? "text-primary" : "text-slate-400"
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    {isDragOver ? "Drop your file here" : "Upload your legal document"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isDragOver ? "We'll handle the rest" : "Drag and drop your PDF, DOCX, or TXT file here"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-light text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 text-sm sm:text-base"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 sm:p-4 text-danger text-sm animate-scale-in">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 animate-scale-in">
            <div className="flex items-center gap-3 mb-2 justify-center">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse-soft" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center">
                Analyzing your document
              </h2>
            </div>
            {fileName && (
              <p className="text-sm text-slate-500 text-center mb-6 sm:mb-8 truncate max-w-full px-4">
                {fileName}
              </p>
            )}

            <div className="space-y-5 sm:space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                  <span className="text-primary font-semibold text-xs sm:text-sm">
                    {getStage(progress)}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-primary to-primary-light"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
                {SCAN_STAGES.map((stage, i) => {
                  const stageStart = stage.range[0];
                  const isActive = progress >= stageStart;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-primary/5 to-primary/[0.02] text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-primary to-primary-light text-white shadow-sm"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isActive ? (
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium">{stage.label}</span>
                    </div>
                  );
                })}
              </div>

              {progress < 100 && (
                <div className="flex justify-center gap-1.5 pt-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-pulse-soft"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              )}

              {progress === 100 && (
                <div className="flex items-center justify-center gap-2 text-success text-sm font-semibold pt-2 animate-fade-in">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analysis complete! Redirecting...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
