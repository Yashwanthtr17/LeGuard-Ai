"use client";

interface AnalysisProgressProps {
  fileName: string;
  progressLabel: string;
}

export function AnalysisProgress({ fileName, progressLabel }: AnalysisProgressProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center animate-scale-in">
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <svg className="w-20 h-20 text-primary animate-pulse-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Analysing your document</h2>
      <p className="text-sm text-slate-500 mb-2">{fileName}</p>
      <p className="text-sm text-accent font-semibold animate-pulse-soft">{progressLabel}</p>
    </div>
  );
}
