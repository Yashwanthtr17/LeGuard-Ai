"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showBackupInput, setShowBackupInput] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const challengeToken = typeof window !== "undefined" ? sessionStorage.getItem("2fa_challenge_token") : null;
  const email = typeof window !== "undefined" ? sessionStorage.getItem("2fa_email") : null;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!challengeToken) {
      router.replace("/login");
    }
  }, [challengeToken, router]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) {
      const pasted = value.replace(/\s/g, "").slice(0, 6).split("");
      const newCode = [...code];
      pasted.forEach((char, i) => {
        if (i < 6 && /^\d$/.test(char)) newCode[i] = char;
      });
      setCode(newCode);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d$/.test(value) && value !== "") return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = code.join("");
      const res = await fetch("/api/auth/2fa/verify-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_token: challengeToken, code: token }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid code.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setSubmitting(false);
        return;
      }

      localStorage.setItem("leguard_token", data.token);
      if (data.refresh_token) {
        localStorage.setItem("leguard_refresh_token", data.refresh_token);
      }

      sessionStorage.removeItem("2fa_challenge_token");
      sessionStorage.removeItem("2fa_email");

      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleBackupVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/2fa/verify-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_token: challengeToken, code: backupCode.replace(/-/g, "") }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid backup code.");
        setSubmitting(false);
        return;
      }

      localStorage.setItem("leguard_token", data.token);
      if (data.refresh_token) {
        localStorage.setItem("leguard_refresh_token", data.refresh_token);
      }

      sessionStorage.removeItem("2fa_challenge_token");
      sessionStorage.removeItem("2fa_email");

      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  if (!challengeToken) return null;

  return (
    <div className="min-h-screen flex bg-background">
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
          <h2 className="text-2xl font-bold text-white mb-4">Two-Factor Authentication</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Your account is protected with an extra layer of security. Enter the verification code from your authenticator app to continue.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center gap-2">
              <ShieldIcon className="w-7 h-7 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                LeGuard<span className="text-accent">-AI</span>
              </span>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Verify Your Identity</h1>
                {email && <p className="text-sm text-subtle">{email}</p>}
              </div>
            </div>

            {!showBackupInput ? (
              <form onSubmit={handleSubmit} className="mt-8">
                <p className="text-sm text-subtle mb-6">
                  Enter the 6-digit code from your authenticator app.
                </p>

                <div className="flex gap-2 justify-center mb-6">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold text-foreground bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || code.some((d) => !d)}
                  className="w-full py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify"
                  )}
                </button>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { setShowBackupInput(true); setError(null); }}
                    className="text-sm text-primary font-semibold hover:underline"
                  >
                    Use a backup code instead
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBackupVerify} className="mt-8">
                <p className="text-sm text-subtle mb-6">
                  Enter one of your recovery codes. Each code can only be used once.
                </p>

                <div className="mb-4">
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="XXXXX-XXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-border text-foreground text-sm text-center font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all bg-surface"
                  />
                </div>

                {error && (
                  <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !backupCode.trim()}
                  className="w-full py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify Backup Code"
                  )}
                </button>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { setShowBackupInput(false); setError(null); }}
                    className="text-sm text-primary font-semibold hover:underline"
                  >
                    Use authenticator app instead
                  </button>
                </div>
              </form>
            )}

            <p className="text-xs text-muted text-center mt-8">
              Verification code expires in 5 minutes for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
