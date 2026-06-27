"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, isAuthenticated, resetPassword } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(searchParams.get("redirect") || "/scan");
    }
  }, [isAuthenticated, router, searchParams]);

  if (isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      setSubmitting(true);
      const err = await resetPassword(email.trim());
      setSubmitting(false);
      if (err) {
        setError(err);
      } else {
        setResetSent(true);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    if (mode === "signin") {
      const err = await login(email.trim(), password);
      setSubmitting(false);
      if (err) {
        setError(err);
      } else {
        router.replace(searchParams.get("redirect") || "/scan");
      }
    } else {
      const result = await signup(name.trim(), email.trim(), password);
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
      } else if (result.needsConfirmation) {
        setSignedUp(true);
      } else {
        router.replace(searchParams.get("redirect") || "/scan");
      }
    }
  }

  if (signedUp) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-gradient-to-b from-surface-hover/30 to-surface-hover/60 px-4 py-8 sm:py-12">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Check your email</h1>
            <p className="text-sm text-slate-600 mb-2">
              We sent a confirmation link to <strong className="text-slate-800">{email}</strong>.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Click the link in the email to verify your account, then sign in.
            </p>
            <button
              onClick={() => { setSignedUp(false); setMode("signin"); setEmail(""); setPassword(""); }}
              className="text-primary font-semibold hover:underline text-sm transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-gradient-to-b from-surface-hover/30 to-surface-hover/60 px-4 py-8 sm:py-12">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Reset link sent</h1>
            <p className="text-sm text-slate-600 mb-2">
              Check your email for a password reset link.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
            <button
              onClick={() => { setResetSent(false); setMode("signin"); }}
              className="text-primary font-semibold hover:underline text-sm transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] bg-gradient-to-b from-surface-hover/30 via-surface-hover/20 to-surface-hover/50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-8">
          <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 rounded-full" />
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
            </h1>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm">
              {mode === "signin"
                ? "Sign in to analyze your legal documents"
                : mode === "signup"
                  ? "Sign up to start reviewing contracts"
                  : "Enter your email to receive a reset link"}
            </p>
          </div>

          {mode !== "forgot" && (
            <div className="flex bg-slate-100 rounded-xl p-1 mb-5 sm:mb-6">
              <button
                onClick={() => { setMode("signin"); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  mode === "signin"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 bg-white/50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 bg-white/50"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(null); }}
                      className="text-xs text-primary font-semibold hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 bg-white/50"
                />
              </div>
            )}

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm animate-scale-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-br from-primary to-primary-light text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] active:scale-[0.98]"
            >
              {submitting
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign In"
                  : mode === "signup"
                    ? "Create Account"
                    : "Send Reset Link"}
            </button>
          </form>

          {mode === "forgot" && (
            <p className="text-xs text-slate-400 text-center mt-6">
              Remember your password?{" "}
              <button
                onClick={() => { setMode("signin"); setError(null); }}
                className="text-primary font-semibold hover:underline transition-colors"
              >
                Sign in
              </button>
            </p>
          )}

          {mode !== "forgot" && (
            <p className="text-xs text-slate-400 text-center mt-6">
              {mode === "signin"
                ? "No account? "
                : "Already have an account? "}
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                className="text-primary font-semibold hover:underline transition-colors"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
