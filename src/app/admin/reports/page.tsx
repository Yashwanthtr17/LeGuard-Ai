"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const allReports = [
  { id: "r1", doc: "Employment Agreement.pdf", user: "Sarah Johnson", score: 7.2, risk: "High", date: "2026-06-28", country: "United States", type: "Contract" },
  { id: "r2", doc: "NDA Template.docx", user: "Michael Chen", score: 3.1, risk: "Low", date: "2026-06-28", country: "Canada", type: "NDA" },
  { id: "r3", doc: "Service Contract.pdf", user: "Emma Williams", score: 5.8, risk: "Medium", date: "2026-06-27", country: "United Kingdom", type: "Contract" },
  { id: "r4", doc: "Lease Agreement.pdf", user: "James Rodriguez", score: 8.5, risk: "High", date: "2026-06-27", country: "United States", type: "Lease" },
  { id: "r5", doc: "Privacy Policy.docx", user: "Olivia Brown", score: 2.4, risk: "Low", date: "2026-06-26", country: "Australia", type: "Policy" },
  { id: "r6", doc: "Partnership Agreement.pdf", user: "William Davis", score: 6.0, risk: "Medium", date: "2026-06-25", country: "Singapore", type: "Contract" },
  { id: "r7", doc: "IP Assignment.doc", user: "Sophia Miller", score: 9.1, risk: "High", date: "2026-06-24", country: "United States", type: "IP" },
  { id: "r8", doc: "Terms of Service.pdf", user: "Daniel Wilson", score: 4.5, risk: "Medium", date: "2026-06-23", country: "Canada", type: "Policy" },
  { id: "r9", doc: "Consulting Agreement.docx", user: "Isabella Taylor", score: 3.8, risk: "Low", date: "2026-06-22", country: "Germany", type: "Contract" },
  { id: "r10", doc: "Employment Offer Letter.pdf", user: "Ethan Anderson", score: 6.7, risk: "Medium", date: "2026-06-21", country: "United States", type: "Letter" },
  { id: "r11", doc: "Software License.pdf", user: "Mia Thomas", score: 5.0, risk: "Medium", date: "2026-06-20", country: "United Kingdom", type: "License" },
  { id: "r12", doc: "Master Services Agreement.docx", user: "Alexander Jackson", score: 7.8, risk: "High", date: "2026-06-19", country: "United States", type: "Contract" },
];

const ITEMS_PER_PAGE = 6;

function getRiskColor(score: number): string {
  if (score >= 7) return "text-danger";
  if (score >= 4) return "text-warning";
  return "text-success";
}

function getRiskBadge(score: number): string {
  if (score >= 7) return "bg-danger/10 text-danger";
  if (score >= 4) return "bg-warning/10 text-warning";
  return "bg-success/10 text-success";
}

export default function AdminReports() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [page, setPage] = useState(1);

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

  const riskLevels = ["All", "High", "Medium", "Low"];

  const filtered = allReports.filter((r) => {
    const matchesSearch =
      r.doc.toLowerCase().includes(search.toLowerCase()) ||
      r.user.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === "All" || r.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-subtle text-sm mt-1">All document analysis reports</p>
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
                placeholder="Search by document or user..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              {riskLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => { setRiskFilter(level); setPage(1); }}
                  className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                    riskFilter === level
                      ? "bg-primary/10 text-primary"
                      : "text-subtle hover:bg-surface-hover"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-muted">Document</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted">User</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted hidden md:table-cell">Type</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted">Risk Score</th>
                  <th className="text-left py-3 px-3 font-semibold text-muted hidden lg:table-cell">Date</th>
                  <th className="text-right py-3 px-3 font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${getRiskBadge(r.score).split(" ")[0]} flex items-center justify-center shrink-0`}>
                          <span className={`text-xs font-bold ${getRiskColor(r.score)}`}>
                            {r.score}
                          </span>
                        </div>
                        <span className="font-medium text-foreground max-w-[180px] truncate">{r.doc}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-subtle">{r.user}</td>
                    <td className="py-3 px-3 text-subtle hidden md:table-cell">{r.type}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskBadge(r.score)}`}>
                        {r.risk} ({r.score}/10)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-subtle hidden lg:table-cell">{r.date}</td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-xs font-semibold text-primary hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
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
