"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAdminStats, useAdminUsers, useAdminReports } from "@/lib/hooks/use-admin";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/admin/users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" },
  { href: "/admin/reports", label: "Reports", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/admin/analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/admin/logs", label: "Logs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/admin/ai-usage", label: "AI Usage", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

function LoadingSkeleton() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="flex">
        <aside className="w-64 shrink-0 min-h-screen border-r border-border bg-surface/50 hidden lg:block">
          <div className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-surface-hover rounded-xl animate-pulse" />
            ))}
          </div>
        </aside>
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="h-8 w-48 bg-surface-hover rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface-hover rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 bg-surface-hover rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({ page: 1, limit: 5 });
  const { data: reportsData, isLoading: reportsLoading } = useAdminReports({ page: 1, limit: 5 });
  const router = useRouter();
  const [mounted] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      const isAdmin = localStorage.getItem("leguard_admin") === "true";
      if (!isAuthenticated || !user || !isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (!mounted || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = localStorage.getItem("leguard_admin") === "true";
  if (!isAuthenticated || !user || !isAdmin) return null;

  if (statsLoading) return <LoadingSkeleton />;

  if (statsError) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger font-semibold">Failed to load dashboard data.</p>
          <p className="text-sm text-subtle mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.total_users.toLocaleString() || "0", change: "", color: "text-primary" },
    { label: "Total Reports", value: stats?.total_reports.toLocaleString() || "0", change: "", color: "text-accent" },
    { label: "Active Today", value: stats?.active_users_today.toLocaleString() || "0", change: "", color: "text-success" },
    { label: "Storage Used", value: `${stats?.storage_used_mb || 0} MB`, change: "", color: "text-warning" },
  ];

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="flex">
        <aside className="w-64 shrink-0 min-h-screen border-r border-border bg-surface/50 hidden lg:block">
          <div className="p-4">
            <div className="flex items-center gap-2 px-3 py-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Admin Panel</p>
                <p className="text-xs text-muted">LeGuard-AI</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = item.href === "/admin" && typeof window !== "undefined" && window.location.pathname === "/admin";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-subtle hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="border-t border-border p-4 mt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-subtle hover:bg-surface-hover hover:text-foreground transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="lg:hidden">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/5 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Admin
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-subtle text-sm mt-1">System overview and key metrics</p>
            </div>
          </div>

          <nav className="flex lg:hidden gap-1 mb-6 overflow-x-auto pb-2">
            {navItems.map((item) => {
              const active = item.href === "/admin";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active ? "bg-primary/10 text-primary" : "text-subtle hover:bg-surface-hover"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-5 card-hover">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted">{stat.label}</p>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Recent Users</h2>
                <Link href="/admin/users" className="text-sm font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-surface-hover rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-semibold text-muted">Name</th>
                        <th className="text-left py-3 px-2 font-semibold text-muted">Email</th>
                        <th className="text-left py-3 px-2 font-semibold text-muted">Date</th>
                        <th className="text-left py-3 px-2 font-semibold text-muted">Plan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.users.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                          <td className="py-3 px-2 font-medium text-foreground">{u.full_name}</td>
                          <td className="py-3 px-2 text-subtle">{u.email}</td>
                          <td className="py-3 px-2 text-subtle">{u.created_at?.split("T")[0]}</td>
                          <td className="py-3 px-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {u.plan}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!usersData?.users || usersData.users.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-muted">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Recent Reports</h2>
                <Link href="/admin/reports" className="text-sm font-semibold text-primary hover:underline">
                  View All
                </Link>
              </div>
              {reportsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-surface-hover rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-semibold text-muted">Document</th>
                        <th className="text-left py-3 px-2 font-semibold text-muted">User</th>
                        <th className="text-left py-3 px-2 font-semibold text-muted">Risk Level</th>
                        <th className="text-left py-3 px-2 font-semibold text-muted">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportsData?.reports.map((r) => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                          <td className="py-3 px-2 font-medium text-foreground max-w-[160px] truncate">{r.document_name}</td>
                          <td className="py-3 px-2 text-subtle">{r.user_email}</td>
                          <td className="py-3 px-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              r.risk_level === "HIGH" ? "bg-danger/10 text-danger" :
                              r.risk_level === "MEDIUM" ? "bg-warning/10 text-warning" :
                              "bg-success/10 text-success"
                            }`}>
                              {r.risk_level}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-subtle">{r.created_at?.split("T")[0]}</td>
                        </tr>
                      ))}
                      {(!reportsData?.reports || reportsData.reports.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-sm text-muted">No reports found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
