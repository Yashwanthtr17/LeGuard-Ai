"use client";

import { Button } from "@/components/ui/Button";

export default function Pricing() {
  return (
    <div className="flex-1 bg-surface-hover/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Transparent, Premium Pricing</h1>
          <p className="text-xl text-slate-600">
            Choose the level of analysis that fits your needs. 
            From single document reviews to full-scale enterprise curation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Freemium */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Freemium Preview</h3>
            <p className="text-slate-500 mb-6 min-h-[48px]">Basic surface-level review with locked premium insights.</p>
            <div className="text-4xl font-bold text-slate-900 mb-8">$0</div>
            <ul className="space-y-4 mb-8 text-slate-600">
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Basic Statutory Check
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-3">✕</span> Commercial Layer Analysis
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-3">✕</span> Semantic Rewording
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-3">✕</span> Bulk Export
              </li>
            </ul>
            <Button variant="outline" className="w-full">Get Started</Button>
          </div>

          {/* Single Scan */}
          <div className="bg-white rounded-3xl p-8 border-2 border-accent relative shadow-xl transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-slate-900 px-4 py-1 rounded-full text-sm font-bold shadow-sm">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Single Scan</h3>
            <p className="text-slate-500 mb-6 min-h-[48px]">Comprehensive multi-layered analysis for one document.</p>
            <div className="text-4xl font-bold text-slate-900 mb-8">$9.99<span className="text-lg text-slate-500 font-normal">/scan</span></div>
            <ul className="space-y-4 mb-8 text-slate-600">
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Full Statutory Check
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Commercial Layer Analysis
              </li>
              <li className="flex items-center">
                <span className="text-primary mr-3">✓</span> Semantic Rewording
              </li>
              <li className="flex items-center text-slate-400">
                <span className="mr-3">✕</span> Bulk Export
              </li>
            </ul>
            <Button variant="accent" className="w-full mb-3 text-lg py-3">Pay with PayPal</Button>
            <p className="text-xs text-center text-slate-400">Secure 1-click checkout</p>
          </div>

          {/* Pro Subscription */}
          <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl text-white">
            <h3 className="text-2xl font-bold text-white mb-2">Pro Subscription</h3>
            <p className="text-slate-400 mb-6 min-h-[48px]">Unlimited scans and bulk management for professionals.</p>
            <div className="text-4xl font-bold text-white mb-8">$49.99<span className="text-lg text-slate-400 font-normal">/mo</span></div>
            <ul className="space-y-4 mb-8 text-slate-300">
              <li className="flex items-center">
                <span className="text-accent mr-3">✓</span> Unlimited Scans
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-3">✓</span> All Analysis Layers
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-3">✓</span> Bulk Export (ZIP/PDF)
              </li>
              <li className="flex items-center">
                <span className="text-accent mr-3">✓</span> Custom Retention Rules
              </li>
            </ul>
            <Button variant="primary" className="w-full mb-3 text-lg py-3">Subscribe via PayPal</Button>
            <p className="text-xs text-center text-slate-500">Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
