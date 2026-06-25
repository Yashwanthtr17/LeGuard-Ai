"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AnalysisResults() {
  const [activeLayer, setActiveLayer] = useState<"statutory" | "commercial" | "semantic">("semantic");
  const [isFreemiumMode, setIsFreemiumMode] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5rem)] bg-surface-hover/30 overflow-hidden">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/history" className="text-slate-500 hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">MSA_Global_Tech_Corp_2026.pdf</h1>
          <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-semibold">Analyzed</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Mock Toggle for Demo */}
          <div className="flex items-center mr-4 border-r border-slate-200 pr-4">
            <span className="text-sm text-slate-500 mr-2">Demo View:</span>
            <Button 
              variant={isFreemiumMode ? "outline" : "primary"} 
              size="sm" 
              onClick={() => setIsFreemiumMode(!isFreemiumMode)}
            >
              {isFreemiumMode ? "Freemium" : "Premium"}
            </Button>
          </div>
          
          <Button variant="outline" size="sm">
            <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Document Viewer */}
        <div className="flex-1 overflow-y-auto p-8 bg-white/50 relative">
          <div className="max-w-3xl mx-auto bg-white p-12 shadow-sm border border-slate-200 min-h-full font-serif text-slate-800 leading-relaxed text-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">MASTER SERVICE AGREEMENT</h2>
            <p className="mb-4">
              This Master Service Agreement (the &ldquo;Agreement&rdquo;) is entered into as of June 25, 2026, by and between <strong>Global Tech Corp</strong> (&ldquo;Client&rdquo;) and <strong>Service Provider LLC</strong> (&ldquo;Provider&rdquo;).
            </p>
            <p className="mb-4">
              <span className={`p-1 rounded transition-colors ${activeLayer === 'commercial' ? 'bg-warning/20 border border-warning/40' : ''}`}>
                1. PAYMENT TERMS: Client agrees to pay Provider within ninety (90) days of invoice receipt. Late payments will incur a 1.5% monthly interest fee.
              </span>
            </p>
            <p className="mb-4">
              <span className={`p-1 rounded transition-colors ${activeLayer === 'statutory' ? 'bg-danger/20 border border-danger/40' : ''}`}>
                2. GOVERNING LAW: This agreement shall be governed by the laws of the State of California, excluding its conflict of laws principles. Any disputes shall be resolved exclusively in the state courts.
              </span>
            </p>
            <p className="mb-4">
              <span className={`p-1 rounded transition-colors ${activeLayer === 'semantic' ? 'bg-primary/20 border border-primary/40' : ''}`}>
                3. INDEMNIFICATION: Provider shall indemnify, defend, and hold harmless the Client from any and all claims arising from Provider&rsquo;s gross negligence.
              </span>
            </p>
          </div>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="w-[450px] bg-white border-l border-slate-200 flex flex-col shrink-0 relative overflow-hidden">
          {/* Layer Selector */}
          <div className="p-4 border-b border-slate-200 flex space-x-2 bg-slate-50">
            <button 
              onClick={() => setActiveLayer("statutory")}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${activeLayer === "statutory" ? "bg-white shadow-sm text-primary border border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Statutory
            </button>
            <button 
              onClick={() => setActiveLayer("commercial")}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${activeLayer === "commercial" ? "bg-white shadow-sm text-primary border border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Commercial
            </button>
            <button 
              onClick={() => setActiveLayer("semantic")}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${activeLayer === "semantic" ? "bg-white shadow-sm text-primary border border-slate-200" : "text-slate-500 hover:bg-slate-100"}`}
            >
              Semantic
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 capitalize">{activeLayer} Layer Analysis</h3>
            
            {activeLayer === "commercial" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-warning/30 bg-warning/5">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-warning mt-0.5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Unfavorable Payment Terms</h4>
                      <p className="text-sm text-slate-600 mt-1">90-day payment terms are significantly above industry standard (typically 30-45 days) and pose a cash flow risk.</p>
                      <div className="mt-3 bg-white p-3 rounded border border-slate-200">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Suggested Rewording</span>
                        <p className="text-sm mt-1">&ldquo;Client agrees to pay Provider within thirty (30) days of invoice receipt.&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeLayer === "statutory" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-danger/30 bg-danger/5">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-danger mt-0.5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Jurisdictional Risk: California</h4>
                      <p className="text-sm text-slate-600 mt-1">Provider is based in NY. Agreeing to CA courts requires litigating out-of-state, increasing costs.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeLayer === "semantic" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-primary mt-0.5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-slate-900">Missing Protection: &ldquo;Ordinary Negligence&rdquo;</h4>
                      <p className="text-sm text-slate-600 mt-1">The indemnification is limited to &ldquo;gross negligence&rdquo;, meaning you are not protected against ordinary mistakes by the Provider.</p>
                      <div className="mt-3 bg-white p-3 rounded border border-slate-200">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Suggested Rewording</span>
                        <p className="text-sm mt-1">&ldquo;...arising from Provider&rsquo;s negligence, gross negligence, or willful misconduct.&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Freemium Paywall Overlay */}
          {isFreemiumMode && (
            <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium Insights Locked</h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Deep semantic analysis and alternative rewordings are available to Pro subscribers or via a Single Scan purchase.
                </p>
                <Link href="/pricing" className="block w-full">
                  <Button variant="accent" className="w-full mb-3">Unlock Analysis ($9.99)</Button>
                </Link>
                <Link href="/pricing" className="text-sm text-slate-500 hover:text-primary transition-colors">
                  View subscription options
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
