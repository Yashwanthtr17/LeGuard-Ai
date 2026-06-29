import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-background px-4">
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-md w-full text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Forbidden</h1>
        <p className="text-subtle text-sm mb-8">
          You don&apos;t have the required permissions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
