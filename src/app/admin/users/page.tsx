"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useAdminUsers } from "@/lib/hooks/use-admin";

const ITEMS_PER_PAGE = 5;

function LoadingSkeleton() {
  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="h-8 w-32 bg-surface-hover rounded-lg animate-pulse mb-6" />
        <div className="glass rounded-2xl p-6">
          <div className="h-10 w-full bg-surface-hover rounded-xl animate-pulse mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-hover rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (!authLoading) {
      const isAdmin = localStorage.getItem("leguard_admin") === "true";
      if (!isAuthenticated || !user || !isAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError } = useAdminUsers({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
  });

  if (!mounted || authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = localStorage.getItem("leguard_admin") === "true";
  if (!isAuthenticated || !user || !isAdmin) return null;

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <div className="flex-1 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger font-semibold">Failed to load users.</p>
          <p className="text-sm text-subtle mt-1">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-subtle hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Users</h1>
            <p className="text-subtle text-sm mt-1">Manage all registered users</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <span className="font-medium text-foreground">{total}</span> users found
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-muted">Name</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted">Email</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted hidden md:table-cell">Reports</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted hidden lg:table-cell">Join Date</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-3 border-b border-border/50" colSpan={5}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {u.full_name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{u.full_name}</p>
                            <p className="text-xs text-subtle md:hidden">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-subtle hidden md:inline">{u.total_reports}</span>
                          <span className="text-xs text-subtle hidden lg:inline">{u.created_at?.split("T")[0]}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.plan === "Enterprise" ? "bg-primary/10 text-primary" :
                            u.plan === "Pro" ? "bg-accent/10 text-accent" :
                            "bg-muted/10 text-muted"
                          }`}>
                            {u.plan}
                          </span>
                          <button
                            onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            {expandedId === u.id ? "Hide" : "Details"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted">
                      {debouncedSearch ? "No users match your search." : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-subtle hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-all ${
                      page === p ? "bg-primary text-white" : "text-subtle hover:bg-surface-hover"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-subtle hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
