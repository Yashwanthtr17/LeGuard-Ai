"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

interface BillingRecord {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: "paid" | "pending" | "failed";
}

const plans: Plan[] = [
  {
    id: "freemium",
    name: "Freemium Preview",
    price: "$0",
    period: "forever",
    features: [
      "Basic Statutory Check",
      "Surface-level risk summary",
      "1 scan per month",
      "Community support",
    ],
  },
  {
    id: "single-scan",
    name: "Single Scan",
    price: "$9.99",
    period: "per scan",
    features: [
      "Full Statutory Check",
      "Commercial Layer Analysis",
      "Semantic Rewording",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro Subscription",
    price: "$49.99",
    period: "per month",
    features: [
      "Unlimited scans",
      "All analysis layers",
      "Bulk export (ZIP/PDF)",
      "Custom retention rules",
      "Priority support",
      "Team collaboration",
    ],
  },
];

const billingHistory: BillingRecord[] = [
  { id: "1", date: "Jun 1, 2026", plan: "Pro Subscription", amount: "$49.99", status: "paid" },
  { id: "2", date: "May 1, 2026", plan: "Pro Subscription", amount: "$49.99", status: "paid" },
  { id: "3", date: "Apr 1, 2026", plan: "Pro Subscription", amount: "$49.99", status: "paid" },
  { id: "4", date: "Mar 1, 2026", plan: "Single Scan", amount: "$9.99", status: "paid" },
  { id: "5", date: "Feb 15, 2026", plan: "Freemium Preview", amount: "$0.00", status: "paid" },
];

const currentPlanFeatures = [
  "Unlimited scans",
  "All analysis layers",
  "Bulk export (ZIP/PDF)",
  "Custom retention rules",
  "Priority support",
  "Team collaboration",
];

function SectionCard({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface rounded-2xl border border-border p-6 ${className || ""}`}>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="text-sm text-subtle mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-success/10 text-success border border-success/20",
    Expired: "bg-danger/10 text-danger border border-danger/20",
  };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles[status] || styles.Active}`}>
      {status}
    </span>
  );
}

function BillingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    failed: "bg-danger/10 text-danger",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function SubscriptionPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("pro");


  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/subscription");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex-1 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6 pb-16">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Subscription</h1>
          <p className="text-subtle text-sm mt-1">Manage your plan, billing, and payment method</p>
        </div>

        <SectionCard title="Current Plan" description="You are currently on the Pro plan">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">Pro Subscription</h3>
                  <StatusBadge status="Active" />
                </div>
                <p className="text-sm text-subtle mt-0.5">$49.99 / month</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Next billing date</p>
              <p className="text-sm font-semibold text-foreground">July 1, 2026</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Plan Features" description="Features included in your current plan">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentPlanFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover border border-border">
                <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Change Plan" description="Upgrade or downgrade your subscription at any time">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === selectedPlan;
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border-2 p-5 transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface hover:border-primary/30"
                  } ${plan.popular ? "relative" : ""}`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      Recommended
                    </span>
                  )}
                  <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted ml-1">{plan.period}</span>
                  </div>
                  <ul className="space-y-1.5 mb-5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-subtle">
                        <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 text-sm font-semibold rounded-xl border border-border bg-surface text-muted cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className="w-full px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white hover:shadow-lg transition-all"
                    >
                      {plan.price === "$0" ? "Downgrade" : "Upgrade"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted text-center mt-4">Payment integration coming soon. Changes will not be processed yet.</p>
        </SectionCard>

        <SectionCard title="Billing History">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider pb-3 pr-4">Date</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider pb-3 pr-4">Plan</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider pb-3 pr-4">Amount</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 text-foreground font-medium">{row.date}</td>
                    <td className="py-3 pr-4 text-subtle">{row.plan}</td>
                    <td className="py-3 pr-4 text-right text-foreground font-semibold">{row.amount}</td>
                    <td className="py-3 text-right"><BillingStatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Payment Method">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface-hover">
            <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold tracking-wider">VISA</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Visa ending in 4242</p>
              <p className="text-xs text-muted">Expires 12/2028</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-warning bg-warning/10 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <p className="text-xs text-muted mt-3">Payment integration coming soon. This is a placeholder for demonstration.</p>
        </SectionCard>

      </div>
    </div>
  );
}
