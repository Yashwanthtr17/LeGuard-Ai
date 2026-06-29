import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-background px-4">
      <div className="glass rounded-2xl p-8 sm:p-10 max-w-md w-full text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636zM12 11V7m0 0a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-subtle text-sm mb-8">
          You don&apos;t have permission to access this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
