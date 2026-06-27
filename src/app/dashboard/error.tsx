"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-background px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-slate-500 mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
