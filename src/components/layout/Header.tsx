"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  )
    return null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", auth: true },
    { href: "/analyse", label: "New Analysis", auth: false },
    { href: "/reports", label: "Reports", auth: true },
    { href: "/subscription", label: "Subscription", auth: true },
    { href: "/pricing", label: "Pricing", auth: false },
  ];

  const isAdmin =
    typeof window !== "undefined" &&
    localStorage.getItem("leguard_admin") === "true";

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="group flex items-center gap-1.5"
            >
              <svg
                className="w-7 h-7 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-primary">LeGuard</span>
                <span className="text-accent">-AI</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-subtle hover:text-primary hover:bg-surface-hover"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  pathname.startsWith("/admin")
                    ? "text-accent bg-accent/5"
                    : "text-subtle hover:text-accent hover:bg-surface-hover"
                }`}
              >
                Admin
                {pathname.startsWith("/admin") && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-subtle hover:text-foreground hover:bg-surface-hover transition-colors"
              aria-label="Toggle theme"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 bg-surface-hover backdrop-blur-sm px-3 py-1.5 rounded-xl border border-border hover:bg-surface-hover/80 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-subtle hover:text-danger font-medium transition-colors px-3 py-1.5 rounded-xl hover:bg-danger/5"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-subtle hover:text-foreground rounded-xl hover:bg-surface-hover transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-10 h-10 rounded-xl text-subtle hover:bg-surface-hover transition-colors flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}
              />
              <span
                className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-foreground hover:bg-surface-hover hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname.startsWith("/admin")
                    ? "text-accent bg-accent/5"
                    : "text-foreground hover:bg-surface-hover hover:text-accent"
                }`}
              >
                Admin
              </Link>
            )}
            <hr className="border-border my-3" />
            {isAuthenticated && user ? (
              <div className="px-4 py-2 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-subtle">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-colors text-sm"
                  >
                    {theme === "light" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {theme === "light" ? "Dark Mode" : "Light Mode"}
                  </button>
                  <Link
                    href="/settings"
                    className="flex-1 flex items-center justify-center py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-colors text-sm"
                  >
                    Settings
                  </Link>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-sm text-danger font-semibold bg-danger/5 hover:bg-danger/10 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-colors text-sm"
                  >
                    {theme === "light" ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {theme === "light" ? "Dark" : "Light"}
                  </button>
                </div>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-hover transition-colors text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-2.5 bg-gradient-to-br from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
