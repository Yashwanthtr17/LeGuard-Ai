"use client";

import { useRouter } from "next/navigation";
import { useReveal } from "@/lib/use-reveal";
import { Dropzone } from "../components/ui/Dropzone";

function RevealSection({ children, className = "", delay = "" }: { children: React.ReactNode; className?: string; delay?: string }) {
  const { ref, isVisible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${delay} ${className}`}
    >
      {children}
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: string }) {
  const { ref, isVisible } = useReveal();
  return (
    <div
      ref={ref}
      className={`group p-6 sm:p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-xl border border-slate-100 hover:border-primary/20 transition-all duration-500 ease-out card-hover ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${delay}`}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
      <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center relative overflow-hidden bg-noise">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-[500px] h-[500px] sm:w-[900px] sm:h-[900px] bg-gradient-to-br from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float-slow" />
          <div className="w-[350px] h-[350px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-accent/8 via-accent/3 to-transparent rounded-full blur-3xl absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: "2s" }} />
          <div className="w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bg-gradient-to-br from-purple-500/5 via-primary/3 to-transparent rounded-full blur-3xl absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 animate-float-slow" style={{ animationDelay: "4s" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs sm:text-sm font-medium text-primary mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
              AI-Powered Legal Analysis
            </div>
          </RevealSection>

          <RevealSection delay="delay-100">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 sm:mb-8 leading-tight">
              The Digital <span className="text-gradient italic">Curator</span>
            </h1>
          </RevealSection>

          <RevealSection delay="delay-200">
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
              A scholarly, premium, and authoritative editorial experience for legal document review.
              Multi-layered analysis through Statutory, Commercial, and Semantic lenses.
            </p>
          </RevealSection>

          <RevealSection delay="delay-300">
            <div className="bg-white/70 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/40 hover:shadow-primary/5 transition-shadow duration-500">
              <Dropzone onFileSelect={() => router.push('/scan')} />
            </div>
          </RevealSection>
        </div>
      </section>

      <section className="py-16 sm:py-28 bg-gradient-to-b from-surface-hover/30 via-surface-hover/50 to-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Three Layers of <span className="text-gradient">Intelligence</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Every document is analyzed through multiple lenses to provide comprehensive insights
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <FeatureCard
              delay="delay-100"
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
              title="Statutory Layer"
              description="Cross-references against jurisdictional law globally (India, US, UK)."
            />
            <FeatureCard
              delay="delay-200"
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="Commercial Layer"
              description="Extracts financial obligations, dates, liabilities, and core business terms."
            />
            <FeatureCard
              delay="delay-300"
              icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              title="Semantic Layer"
              description="Analyzes underlying intent, detects contradictory statements, and suggests rewordings."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
