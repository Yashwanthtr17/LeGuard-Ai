"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ["/login", "/register", "/reset-password", "/", "/pricing", "/privacy", "/terms", "/disclaimers"];

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>;
}
