"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Modal } from "@/components/ui/Modal";

function getPasswordStrength(pw: string) {
  const len = pw.length;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const types = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  if (len === 0) return { label: "", color: "", percent: 0 };
  if (len < 6) return { label: "Weak", color: "bg-danger", percent: 16 };
  if (len < 8) return { label: "Fair", color: "bg-orange-500", percent: 32 };
  if (len < 12 && types >= 2) return { label: "Good", color: "bg-warning", percent: 50 };
  if (len < 12) return { label: "Fair", color: "bg-orange-500", percent: 32 };
  if (len < 15 && types >= 3) return { label: "Strong", color: "bg-success", percent: 75 };
  if (len < 15) return { label: "Good", color: "bg-warning", percent: 50 };
  if (types === 4) return { label: "Very Strong", color: "bg-emerald-500", percent: 100 };
  if (types >= 3) return { label: "Strong", color: "bg-success", percent: 75 };
  return { label: "Good", color: "bg-warning", percent: 50 };
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="2" width="9.25" height="9.25" fill="#F25022" />
      <rect x="12.75" y="2" width="9.25" height="9.25" fill="#7FBA00" />
      <rect x="2" y="12.75" width="9.25" height="9.25" fill="#00A4EF" />
      <rect x="12.75" y="12.75" width="9.25" height="9.25" fill="#FFB900" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

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
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [modalContent, setModalContent] = useState<"privacy" | "terms" | null>(null);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(searchParams.get("redirect") || "/dashboard");
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  const switchMode = useCallback((newMode: "signin" | "signup" | "forgot") => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  }, []);

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
    setSuccess(null);
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
          setSuccess("If this email is registered, you will receive a password reset link.");
          setTimeout(() => switchMode("signin"), 2500);
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
      if (!agreeTerms) { setError("You must agree to the Privacy Policy and Terms & Conditions."); setSubmitting(false); return; }
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
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => router.replace("/dashboard"), 1200);
      }
    }
  }

  function handleSocialLogin(provider: string) {
    alert(`${provider} sign-in coming soon`);
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-noise opacity-20" />
        <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-16 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center gap-3 mb-8">
            <ShieldIcon className="w-10 h-10 text-accent" />
            <span className="text-3xl font-bold text-white">
              LeGuard<span className="text-accent">-AI</span>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Your AI-powered legal guardian</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            &ldquo;Understand every clause, every risk. Upload any contract, NDA, or policy &mdash; get a plain-English risk analysis in seconds.&rdquo;
          </p>
          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-white/20" />
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
            </div>
            <div className="h-px w-12 bg-white/20" />
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 text-left">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-white/60 text-sm">Documents analysed</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">99.2%</div>
              <div className="text-white/60 text-sm">Accuracy rate</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">&lt;30s</div>
              <div className="text-white/60 text-sm">Avg. analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center gap-2">
              <ShieldIcon className="w-7 h-7 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                LeGuard<span className="text-accent">-AI</span>
              </span>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {mode === "signin" ? "Welcome back" : mode === "forgot" ? "Reset your password" : "Create your account"}
            </h1>
            <p className="text-subtle text-sm mb-6">
              {mode === "signin" ? "Sign in to analyse your legal documents" : mode === "forgot" ? "We'll send you a reset link" : "Start reviewing contracts with AI"}
            </p>

            {/* Tab Toggle */}
            {mode !== "forgot" && (
              <div className="flex bg-surface-hover rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "signin" ? "bg-surface text-foreground shadow-sm" : "text-subtle hover:text-foreground"}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === "signup" ? "bg-surface text-foreground shadow-sm" : "text-subtle hover:text-foreground"}`}
                >
                  Sign Up
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sign Up: Full Name */}
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-surface"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-surface"
                />
              </div>

              {/* Password */}
              {mode !== "forgot" && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? "Min 8 characters" : "Enter your password"}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {mode === "signup" && password.length > 0 && (
                    <div className="mt-2 animate-fade-in">
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-subtle mt-1">{strength.label}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Sign Up) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-subtle"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Sign In extras: Remember Me + Forgot Password */}
              {mode === "signin" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-surface"
                    />
                    <span className="text-sm text-subtle">Remember me</span>
                  </label>
                  <button type="button" onClick={() => switchMode("forgot")} className="text-sm text-primary font-semibold hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Sign Up: Agree to Terms */}
              {mode === "signup" && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-surface mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-subtle">
                    I have read and agree to the{" "}
                    <button type="button" onClick={() => setModalContent("privacy")} className="text-primary font-semibold hover:underline">
                      Privacy Policy
                    </button>{" "}
                    and{" "}
                    <button type="button" onClick={() => setModalContent("terms")} className="text-primary font-semibold hover:underline">
                      Terms & Conditions
                    </button>
                  </span>
                </label>
              )}

              {/* Error */}
              {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm animate-scale-in flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="bg-success/10 border border-success/30 rounded-xl p-3 text-success text-sm animate-scale-in flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || (mode === "signup" && !agreeTerms)}
                className="w-full py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    {mode === "signin" ? "Signing in..." : mode === "forgot" ? "Sending..." : "Creating account..."}
                  </span>
                ) : (
                  mode === "signin" ? "Sign In" : mode === "forgot" ? "Send Reset Link" : "Create Account"
                )}
              </button>

              {/* Social Login (Sign In only) */}
              {mode === "signin" && (
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted">or continue with email</span>
                  </div>
                </div>
              )}

              {mode === "signin" && (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Google")}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm font-semibold hover:bg-surface-hover transition-all"
                  >
                    <GoogleLogo />
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("GitHub")}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm font-semibold hover:bg-surface-hover transition-all"
                  >
                    <GitHubLogo />
                    Continue with GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Microsoft")}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm font-semibold hover:bg-surface-hover transition-all"
                  >
                    <MicrosoftLogo />
                    Continue with Microsoft
                  </button>
                </div>
              )}
            </form>

            {/* Bottom navigation */}
            <p className="text-sm text-subtle text-center mt-6">
              {mode === "forgot" ? (
                <button onClick={() => switchMode("signin")} className="text-accent font-semibold hover:underline">
                  Back to sign in
                </button>
              ) : (
                <>
                  {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => switchMode(mode === "signin" ? "signup" : "signin")} className="text-accent font-semibold hover:underline">
                    {mode === "signin" ? "Create one →" : "Sign in"}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Modal open={modalContent === "privacy"} onClose={() => setModalContent(null)} title="Privacy Policy" maxWidth="max-w-2xl">
        <div className="space-y-4 text-sm text-subtle">
          <p>
            At LeGuard-AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <h3 className="text-foreground font-semibold text-base">Information We Collect</h3>
          <p>
            We collect information you provide directly to us, including your name, email address, and any legal documents you upload for analysis. We also automatically collect certain technical information about your device and usage patterns.
          </p>
          <h3 className="text-foreground font-semibold text-base">How We Use Your Information</h3>
          <p>
            Your information is used to provide and improve our AI-powered legal document analysis services, communicate with you about your account, and ensure the security of our platform.
          </p>
          <h3 className="text-foreground font-semibold text-base">Data Security</h3>
          <p>
            We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and strict access controls to protect your data.
          </p>
          <h3 className="text-foreground font-semibold text-base">Contact</h3>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@leguard-ai.com.
          </p>
        </div>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal open={modalContent === "terms"} onClose={() => setModalContent(null)} title="Terms & Conditions" maxWidth="max-w-2xl">
        <div className="space-y-4 text-sm text-subtle">
          <p>
            Welcome to LeGuard-AI. By accessing or using our platform, you agree to be bound by these Terms & Conditions.
          </p>
          <h3 className="text-foreground font-semibold text-base">Acceptance of Terms</h3>
          <p>
            By creating an account and using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
          </p>
          <h3 className="text-foreground font-semibold text-base">Service Description</h3>
          <p>
            LeGuard-AI provides AI-powered legal document analysis. While we strive for accuracy, our analyses are for informational purposes only and do not constitute legal advice.
          </p>
          <h3 className="text-foreground font-semibold text-base">User Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to upload malicious content or use the service for any illegal purpose.
          </p>
          <h3 className="text-foreground font-semibold text-base">Limitation of Liability</h3>
          <p>
            LeGuard-AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the service.
          </p>
        </div>
      </Modal>
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
