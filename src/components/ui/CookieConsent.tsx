"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "leguard_cookie_consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function acceptAll() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "all");
    setShow(false);
  }

  function acceptEssential() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "essential");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <div className="glass-strong rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium">
              We use cookies to enhance your experience.
            </p>
            <p className="text-xs text-subtle mt-1">
              By continuing, you agree to our{" "}
              <Link href="/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>
              ,{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , and{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={acceptEssential}
              className="flex-1 sm:flex-none px-4 py-2 border border-border text-foreground text-sm font-semibold rounded-xl hover:bg-surface-hover transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={acceptAll}
              className="flex-1 sm:flex-none px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
