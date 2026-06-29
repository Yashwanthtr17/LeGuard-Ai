"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = useMemo(() => [
    "/login", "/register", "/reset-password", "/",
    "/pricing", "/privacy", "/terms", "/disclaimers",
    "/cookies", "/refund", "/acceptable-use", "/data-retention",
    "/security", "/gdpr", "/ccpa", "/401", "/403", "/500", "/offline",
  ], []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router, publicPaths]);

  return <>{children}</>;
}
