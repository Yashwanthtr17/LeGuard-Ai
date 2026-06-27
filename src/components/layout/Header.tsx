"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) return null;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", auth: true },
    { href: "/analyse", label: "New Analysis", auth: false },
    { href: "/reports", label: "Reports", auth: true },
    { href: "/pricing", label: "Pricing", auth: false },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="group flex items-center gap-1.5">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/5"
                      : "text-slate-600 hover:text-primary hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/settings" className="flex items-center gap-2 bg-slate-50/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200/60 hover:bg-slate-100 transition-colors">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.full_name}</span>
                </Link>
                <button onClick={logout} className="text-sm text-slate-500 hover:text-danger font-medium transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary rounded-xl hover:bg-slate-50 transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="px-5 py-2 bg-gradient-to-br from-primary to-primary-light text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden relative w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center" aria-label="Toggle menu">
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link key={link.href} href={link.href} className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "text-primary bg-primary/5" : "text-slate-700 hover:bg-slate-50 hover:text-primary"}`}>
                  {link.label}
                </Link>
              );
            })}
            <hr className="border-slate-100 my-3" />
            {isAuthenticated && user ? (
              <div className="px-4 py-2 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{user.full_name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <Link href="/settings" className="block w-full text-center py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Settings
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full py-2.5 text-sm text-danger font-semibold bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 bg-gradient-to-br from-primary to-primary-light text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 text-sm">
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
