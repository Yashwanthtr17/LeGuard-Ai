"use client";

import { Button } from "@/components/ui/Button";

export default function Pricing() {
  return (
    <div className="flex-1 bg-gradient-to-b from-surface-hover/30 via-surface-hover/20 to-white py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs sm:text-sm font-medium text-primary mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
            Simple Pricing
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
            Transparent, <span className="text-gradient">Premium</span> Pricing
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 px-2">
            Choose the level of analysis that fits your needs.
            From single document reviews to full-scale enterprise curation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 card-hover animate-fade-in-up stagger-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Freemium Preview</h3>
            <p className="text-sm sm:text-base text-slate-500 mb-5 sm:mb-6">Basic surface-level review with locked premium insights.</p>
            <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 sm:mb-8">$0</div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base text-slate-600">
              <li className="flex items-center">
                <span className="text-primary mr-2 sm:mr-3 shrink-0">&#10003;</span> Basic Statutory Check
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-2 sm:mr-3 shrink-0">&#10005;</span> Commercial Layer Analysis
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-2 sm:mr-3 shrink-0">&#10005;</span> Semantic Rewording
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-2 sm:mr-3 shrink-0">&#10005;</span> Bulk Export
              </li>
            </ul>
            <Button variant="outline" fullWidth>Get Started</Button>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 border-accent/60 relative shadow-xl sm:-translate-y-4 card-hover animate-fade-in-up stagger-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-accent to-accent-hover text-slate-900 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap animate-float">
              Most Popular
            </div>
            <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 rounded-full" />
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Single Scan</h3>
            <p className="text-sm sm:text-base text-slate-500 mb-5 sm:mb-6">Comprehensive multi-layered analysis for one document.</p>
            <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 sm:mb-8">$9.99<span className="text-base sm:text-lg text-slate-500 font-normal">/scan</span></div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base text-slate-600">
              <li className="flex items-center">
                <span className="text-primary mr-2 sm:mr-3 shrink-0">&#10003;</span> Full Statutory Check
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-2 sm:mr-3 shrink-0">&#10003;</span> Commercial Layer Analysis
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-2 sm:mr-3 shrink-0">&#10003;</span> Semantic Rewording
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-2 sm:mr-3 shrink-0">&#10005;</span> Bulk Export
              </li>
            </ul>
            <Button variant="accent" fullWidth size="lg">Pay with PayPal</Button>
            <p className="text-[10px] sm:text-xs text-center text-slate-400 mt-2 sm:mt-3">Secure 1-click checkout</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl text-white card-hover animate-fade-in-up stagger-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Pro Subscription</h3>
            <p className="text-sm sm:text-base text-slate-400 mb-5 sm:mb-6">Unlimited scans and bulk management for professionals.</p>
            <div className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">$49.99<span className="text-base sm:text-lg text-slate-400 font-normal">/mo</span></div>
            <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-sm sm:text-base text-slate-300">
              <li className="flex items-center">
                <span className="text-accent mr-2 sm:mr-3 shrink-0">&#10003;</span> Unlimited Scans
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2 sm:mr-3 shrink-0">&#10003;</span> All Analysis Layers
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2 sm:mr-3 shrink-0">&#10003;</span> Bulk Export (ZIP/PDF)
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-2 sm:mr-3 shrink-0">&#10003;</span> Custom Retention Rules
              </li>
            </ul>
            <Button variant="primary" fullWidth size="lg">Subscribe via PayPal</Button>
            <p className="text-[10px] sm:text-xs text-center text-slate-500 mt-2 sm:mt-3">Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
