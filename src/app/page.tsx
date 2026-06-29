"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Dropzone } from "../components/ui/Dropzone";
import { useReveal } from "@/lib/use-reveal";

function RevealSection({ children, className = "", delay = "" }: { children: React.ReactNode; className?: string; delay?: string }) {
  const { ref, isVisible } = useReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${delay} ${className}`}>
      {children}
    </div>
  );
}

function StepCard({ number, icon, title, description, delay }: { number: string; icon: React.ReactNode; title: string; description: string; delay: string }) {
  const { ref, isVisible } = useReveal();
  return (
    <div ref={ref} className={`relative flex flex-col items-center text-center p-6 sm:p-8 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${delay}`}>
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 ring-1 ring-primary/10">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg shadow-primary/20">
        {number}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-subtle leading-relaxed max-w-sm">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: string }) {
  const { ref, isVisible } = useReveal();
  return (
    <div ref={ref} className={`group p-6 sm:p-8 rounded-2xl bg-surface glass border border-border hover:border-primary/20 transition-all duration-500 ease-out card-hover ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${delay}`}>
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 ring-1 ring-primary/5">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-subtle leading-relaxed">{description}</p>
    </div>
  );
}

function DocCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl bg-surface glass border border-border hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function CountryCard({ flag, name }: { flag: string; name: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-surface glass border border-border hover:border-primary/20 transition-all duration-300 cursor-default">
      <span className="text-xl sm:text-2xl">{flag}</span>
      <span className="text-xs sm:text-sm font-medium text-foreground">{name}</span>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${i < rating ? "text-yellow-400" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ name, title, quote, rating, delay }: { name: string; title: string; quote: string; rating: number; delay: string }) {
  const { ref, isVisible } = useReveal();
  const initials = name.split(" ").map(n => n[0]).join("");
  return (
    <div ref={ref} className={`p-6 sm:p-8 rounded-2xl bg-surface glass border border-border hover:border-primary/20 transition-all duration-500 ease-out card-hover ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${delay}`}>
      <StarRating rating={rating} />
      <p className="text-sm sm:text-base text-subtle leading-relaxed mt-4 sm:mt-5 mb-5 sm:mb-6">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm sm:text-base font-bold text-primary">
          {initials}
        </div>
        <div>
          <p className="text-sm sm:text-base font-semibold text-foreground">{name}</p>
          <p className="text-xs sm:text-sm text-muted">{title}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ name, price, period, description, features, highlighted, cta, delay }: {
  name: string; price: string; period: string; description: string; features: string[]; highlighted?: boolean; cta: string; delay: string;
}) {
  const { ref, isVisible } = useReveal();
  return (
    <div ref={ref} className={`relative flex flex-col p-6 sm:p-8 rounded-2xl transition-all duration-500 ease-out card-hover ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${delay} ${highlighted ? "bg-foreground text-background ring-2 ring-primary scale-[1.02] sm:scale-105 shadow-2xl shadow-primary/20" : "bg-surface glass border border-border hover:border-primary/20"}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full shadow-lg shadow-primary/20">
          Most Popular
        </div>
      )}
      <h3 className={`text-lg font-bold ${highlighted ? "text-background" : "text-foreground"}`}>{name}</h3>
      <div className="mt-3 sm:mt-4 flex items-baseline gap-1">
        <span className={`text-3xl sm:text-4xl font-bold tracking-tight ${highlighted ? "text-background" : "text-foreground"}`}>{price}</span>
        {period && <span className={`text-sm ${highlighted ? "text-background/60" : "text-muted"}`}>/{period}</span>}
      </div>
      <p className={`text-sm mt-2 ${highlighted ? "text-background/70" : "text-subtle"}`}>{description}</p>
      <ul className="mt-5 sm:mt-6 space-y-2.5 sm:space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? "text-background" : "text-primary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className={highlighted ? "text-background/80" : "text-subtle"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/analyse"
        className={`mt-6 sm:mt-8 w-full inline-flex items-center justify-center font-medium transition-all duration-200 ease-out rounded-xl h-11 sm:h-12 text-sm sm:text-base active:scale-[0.97] ${
          highlighted
            ? "bg-background text-foreground hover:bg-background/90 shadow-md"
            : "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg hover:shadow-primary/20"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function FAQItem({ question, answer, open, onToggle }: { question: string; answer: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-4 sm:py-5 text-left gap-4"
        onClick={onToggle}
      >
        <span className="text-sm sm:text-base font-semibold text-foreground">{question}</span>
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 text-subtle flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-96 pb-4 sm:pb-5" : "max-h-0"}`}>
        <p className="text-sm sm:text-base text-subtle leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28 text-center overflow-hidden bg-noise">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-[500px] h-[500px] sm:w-[900px] sm:h-[900px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
          <div className="w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-accent/8 via-accent/3 to-transparent rounded-full blur-3xl absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: "2s" }} />
          <div className="w-[250px] h-[250px] sm:w-[450px] sm:h-[450px] bg-gradient-to-br from-primary/5 via-primary/2 to-transparent rounded-full blur-3xl absolute bottom-1/4 right-1/4 -translate-x-1/2 translate-y-1/2 animate-float-slow" style={{ animationDelay: "4s" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs sm:text-sm font-medium text-primary mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
              AI-Powered Legal Analysis
            </div>
          </RevealSection>

          <RevealSection delay="delay-100">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 sm:mb-8 leading-tight">
              Your AI-Powered <span className="text-gradient">Legal Guardian</span>
            </h1>
          </RevealSection>

          <RevealSection delay="delay-200">
            <p className="text-lg sm:text-xl md:text-2xl text-subtle mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              Understand every clause, every risk. Upload any contract, NDA, or policy &mdash; get a plain-English risk analysis in seconds.
            </p>
          </RevealSection>

          <RevealSection delay="delay-300">
            <div className="bg-white/70 dark:bg-foreground/5 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/40 dark:border-border/40">
              <Dropzone onFileSelect={() => router.push('/analyse')} />
            </div>
          </RevealSection>

          <RevealSection delay="delay-400">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-8 sm:mt-12 text-xs sm:text-sm text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Trusted by 10,000+ users
              </div>
              <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Analyzed 50,000+ documents
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-28 bg-surface-hover/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It <span className="text-gradient">Works</span>
              </h2>
              <p className="text-base sm:text-lg text-subtle max-w-2xl mx-auto">
                Three simple steps to understand any legal document
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
            <div className="hidden md:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
            <StepCard
              number="1"
              delay="delay-100"
              icon={
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              }
              title="Upload"
              description="Drag & drop your document or browse files. We support PDF, DOCX, and TXT formats."
            />
            <StepCard
              number="2"
              delay="delay-200"
              icon={
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="AI Analysis"
              description="Our AI scans every clause, cross-references against country laws, and identifies hidden risks."
            />
            <StepCard
              number="3"
              delay="delay-300"
              icon={
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Get Report"
              description="Receive a plain English report with risk scores, actionable insights, and negotiation tips."
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need to <span className="text-gradient">Stay Protected</span>
              </h2>
              <p className="text-base sm:text-lg text-subtle max-w-2xl mx-auto">
                Comprehensive legal analysis powered by advanced AI
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              delay="delay-100"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              }
              title="Legal Analysis"
              description="Cross-references every clause against jurisdictional law across 150+ countries worldwide."
            />
            <FeatureCard
              delay="delay-200"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
              title="Risk Detection"
              description="Identifies dangerous, ambiguous, and hidden clauses that could expose you to liability."
            />
            <FeatureCard
              delay="delay-300"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Plain English Reports"
              description="No legal jargon. Every clause is explained in simple, actionable language you can understand."
            />
            <FeatureCard
              delay="delay-100"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Financial Risk Analysis"
              description="Spots monetary risks, hidden fees, auto-renewal clauses, and unfavorable financial terms."
            />
            <FeatureCard
              delay="delay-200"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Privacy Protection"
              description="Flags data privacy issues, GDPR compliance gaps, and overly broad data collection clauses."
            />
            <FeatureCard
              delay="delay-300"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Negotiation Tips"
              description="Get actionable suggestions and alternative phrasing to strengthen your position in negotiations."
            />
          </div>
        </div>
      </section>

      {/* ── Supported Documents ── */}
      <section className="py-16 sm:py-28 bg-surface-hover/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Analyze Any <span className="text-gradient">Legal Document</span>
              </h2>
              <p className="text-base sm:text-lg text-subtle max-w-2xl mx-auto">
                Support for all major document types across jurisdictions
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              label="Contracts"
            />
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
              label="NDAs"
            />
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              label="Employment"
            />
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
              label="Rental / Lease"
            />
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              label="Privacy Policies"
            />
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              label="Loan Agreements"
            />
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
              label="Government Docs"
            />
            <DocCard
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              label="Insurance Policies"
            />
          </div>
        </div>
      </section>

      {/* ── Supported Countries ── */}
      <section className="py-16 sm:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Global <span className="text-gradient">Coverage</span>
              </h2>
              <p className="text-base sm:text-lg text-subtle max-w-2xl mx-auto">
                Legal analysis aligned with laws across 150+ jurisdictions
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4">
            <CountryCard flag="🇺🇸" name="United States" />
            <CountryCard flag="🇬🇧" name="United Kingdom" />
            <CountryCard flag="🇨🇦" name="Canada" />
            <CountryCard flag="🇦🇺" name="Australia" />
            <CountryCard flag="🇮🇳" name="India" />
            <CountryCard flag="🇩🇪" name="Germany" />
            <CountryCard flag="🇫🇷" name="France" />
            <CountryCard flag="🇸🇬" name="Singapore" />
            <CountryCard flag="🇦🇪" name="UAE" />
            <CountryCard flag="🇧🇷" name="Brazil" />
          </div>

          <RevealSection delay="delay-200">
            <div className="mt-8 sm:mt-10 text-center">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface glass border border-border rounded-full text-sm font-medium text-subtle">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                +150 Countries Covered
              </span>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 sm:py-28 bg-surface-hover/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Trusted by <span className="text-gradient">Professionals</span>
              </h2>
              <p className="text-base sm:text-lg text-subtle max-w-2xl mx-auto">
                See what our users are saying about their experience
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <TestimonialCard
              delay="delay-100"
              name="Sarah Mitchell"
              title="Startup Founder"
              rating={5}
              quote="I used to pay hundreds to lawyers just to review contracts. LeGuard AI caught a hidden auto-renewal clause that would have cost me thousands. Absolutely indispensable."
            />
            <TestimonialCard
              delay="delay-200"
              name="James Rodriguez"
              title="Freelance Designer"
              rating={5}
              quote="The plain English explanations are a game-changer. I finally understand what I'm signing without needing a law degree. The risk score feature gives me peace of mind."
            />
            <TestimonialCard
              delay="delay-300"
              name="Priya Sharma"
              title="Small Business Owner"
              rating={5}
              quote="LeGuard flagged data privacy issues in a vendor contract that my previous lawyer missed. The negotiation tips helped me get better terms. Highly recommended."
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 sm:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simple, Transparent <span className="text-gradient">Pricing</span>
              </h2>
              <p className="text-base sm:text-lg text-subtle max-w-2xl mx-auto">
                Start free, upgrade when you need more
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto items-start">
            <PricingCard
              delay="delay-100"
              name="Freemium"
              price="$0"
              period=""
              description="Get started with a basic analysis"
              features={[
                "1 document analysis per month",
                "Basic risk score",
                "Plain English summary",
                "Email support",
              ]}
              cta="Get Started"
            />
            <PricingCard
              delay="delay-200"
              name="Single Scan"
              price="$9.99"
              period="one-time"
              description="Deep analysis for one document"
              highlighted
              features={[
                "Comprehensive document analysis",
                "Detailed risk breakdown",
                "Country-specific law check",
                "Negotiation suggestions",
                "Exportable PDF report",
              ]}
              cta="Analyze Now"
            />
            <PricingCard
              delay="delay-300"
              name="Pro"
              price="$49.99"
              period="month"
              description="Unlimited analysis for professionals"
              features={[
                "Unlimited document analyses",
                "Priority processing",
                "AI negotiation assistant",
                "Comparison & version tracking",
                "Team sharing & collaboration",
                "Dedicated support",
              ]}
              cta="Go Pro"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-28 bg-surface-hover/30 border-y border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
              <p className="text-base sm:text-lg text-subtle max-w-2xl mx-auto">
                Everything you need to know about LeGuard AI
              </p>
            </div>
          </RevealSection>

          <RevealSection delay="delay-100">
            <div className="bg-surface glass border border-border rounded-2xl p-4 sm:p-6 lg:p-8">
              {[
                {
                  q: "What documents can I analyze?",
                  a: "LeGuard AI supports PDF, DOCX, and TXT files. You can analyze contracts, NDAs, employment agreements, rental/lease agreements, privacy policies, loan agreements, government documents, insurance policies, and more. Our AI is trained to understand a wide variety of legal document structures.",
                },
                {
                  q: "How accurate is the AI?",
                  a: "Our AI achieves over 95% accuracy in clause identification and risk detection across supported jurisdictions. It is continuously trained on thousands of legal documents and updated regularly to reflect changes in laws and regulations across 150+ countries.",
                },
                {
                  q: "Is my data secure?",
                  a: "Absolutely. All documents are encrypted in transit (TLS 1.3) and at rest (AES-256). We never share your documents with third parties, and you can delete your documents at any time. We are compliant with GDPR, CCPA, and SOC 2 standards.",
                },
                {
                  q: "Do I still need a lawyer?",
                  a: "LeGuard AI is designed to help you understand legal documents, but it does not replace legal advice from a qualified attorney. Think of it as a first line of defense that helps you identify risks before consulting a lawyer, saving you time and money.",
                },
                {
                  q: "What countries are supported?",
                  a: "We currently support legal analysis for 150+ countries including the United States, United Kingdom, Canada, Australia, India, Germany, France, Singapore, UAE, Brazil, and many more. Our AI cross-references clauses against local laws and regulations specific to each jurisdiction.",
                },
              ].map((item, i) => (
                <FAQItem
                  key={i}
                  question={item.q}
                  answer={item.a}
                  open={openFAQ === i}
                  onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                />
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealSection>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-accent p-8 sm:p-16 lg:p-20 shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl absolute -top-20 -right-20" />
                <div className="w-48 h-48 sm:w-72 sm:h-72 bg-white/5 rounded-full blur-3xl absolute -bottom-20 -left-20" />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  Ready to understand your legal documents?
                </h2>
                <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                  Join thousands of users who protect themselves with AI-powered legal analysis. No credit card required.
                </p>
                <Link
                  href="/analyse"
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary font-semibold rounded-xl text-base sm:text-lg hover:bg-white/90 hover:shadow-xl hover:shadow-white/20 hover:scale-105 transition-all duration-300 ease-out active:scale-[0.97]"
                >
                  Start Your First Analysis Free
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}
