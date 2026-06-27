"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(searchParams.get("redirect") || "/dashboard");
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Please enter your email address.");
        setSubmitting(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = await res.json();
        setSubmitting(false);
        if (data.error) {
          setError(data.message);
        } else {
          setError(null);
          setMode("signin");
          alert("If this email is registered, you will receive a password reset link.");
        }
      } catch {
        setError("Network error. Please try again.");
        setSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      setSubmitting(false);
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) { setError("Please enter your full name."); setSubmitting(false); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters."); setSubmitting(false); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); setSubmitting(false); return; }
    }

    if (mode === "signin" && password.length < 8) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    if (mode === "signin") {
      const err = await login(email.trim(), password, rememberMe);
      setSubmitting(false);
      if (err) {
        setError(err);
      } else {
        router.replace(searchParams.get("redirect") || "/dashboard");
      }
    } else {
      const err = await signup(name.trim(), email.trim(), password);
      setSubmitting(false);
      if (err) {
        setError(err);
      } else {
        router.replace("/dashboard");
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-white to-background">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-noise opacity-20" />
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center gap-3 mb-8">
            <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-3xl font-bold text-white">
              LeGuard<span className="text-accent">-AI</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Your AI-powered legal guardian</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            &ldquo;Understand every clause, every risk. Upload any contract, NDA, or policy &mdash; get a plain-English risk analysis in seconds.&rdquo;
          </p>
          <div className="mt-12 flex justify-center gap-4">
            <div className="w-2 h-2 rounded-full bg-accent/60" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center gap-2">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-2xl font-bold text-primary">
                LeGuard<span className="text-accent">-AI</span>
              </span>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {mode === "signin" ? "Welcome back" : mode === "forgot" ? "Reset your password" : "Create your account"}
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              {mode === "signin" ? "Sign in to analyse your legal documents" : mode === "forgot" ? "We'll send you a reset link" : "Start reviewing contracts with AI"}
            </p>

            {mode !== "forgot" && (
            <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode("signin"); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Sign Up
              </button>
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-white" />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-white" />
              </div>

              {mode !== "forgot" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Min 8 characters" : "Enter your password"} className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-white" />
                </div>
              )}

              {mode === "signin" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30" />
                    <span className="text-sm text-slate-600">Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setMode("forgot"); setError(null); }} className="text-sm text-primary font-semibold hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm animate-scale-in">
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]">
                    {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {mode === "signin" ? "Signing in..." : mode === "forgot" ? "Sending..." : "Creating account..."}
                  </span>
                ) : (
                  mode === "signin" ? "Sign In" : mode === "forgot" ? "Send Reset Link" : "Create Account"
                )}
              </button>
            </form>

            <p className="text-sm text-slate-500 text-center mt-6">
              {mode === "forgot" ? (
                <button onClick={() => { setMode("signin"); setError(null); }} className="text-accent font-semibold hover:underline">
                  Back to sign in
                </button>
              ) : (
                <>
                  {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }} className="text-accent font-semibold hover:underline">
                    {mode === "signin" ? "Create one →" : "Sign in"}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
