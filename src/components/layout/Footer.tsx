import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1.5 mb-4">
              <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xl font-bold">
                LeGuard<span className="text-accent">-AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your AI-powered legal guardian. Understand every clause, every risk.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/analyse" className="text-sm text-slate-400 hover:text-accent transition-colors">New Analysis</Link></li>
              <li><Link href="/reports" className="text-sm text-slate-400 hover:text-accent transition-colors">My Reports</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate-400 hover:text-accent transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-slate-400 hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-400 hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimers" className="text-sm text-slate-400 hover:text-accent transition-colors">Legal Disclaimers</Link></li>
              <li><Link href="/cookies" className="text-sm text-slate-400 hover:text-accent transition-colors">Cookie Policy</Link></li>
              <li><Link href="/refund" className="text-sm text-slate-400 hover:text-accent transition-colors">Refund Policy</Link></li>
              <li><Link href="/acceptable-use" className="text-sm text-slate-400 hover:text-accent transition-colors">Acceptable Use</Link></li>
              <li><Link href="/data-retention" className="text-sm text-slate-400 hover:text-accent transition-colors">Data Retention</Link></li>
              <li><Link href="/security" className="text-sm text-slate-400 hover:text-accent transition-colors">Security</Link></li>
              <li><Link href="/gdpr" className="text-sm text-slate-400 hover:text-accent transition-colors">GDPR</Link></li>
              <li><Link href="/ccpa" className="text-sm text-slate-400 hover:text-accent transition-colors">CCPA</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-sm text-slate-400 hover:text-accent transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-sm text-slate-400 hover:text-accent transition-colors">Create Account</Link></li>
              <li><Link href="/settings" className="text-sm text-slate-400 hover:text-accent transition-colors">Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} LeGuard-AI. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            AI-generated reports are for informational purposes only and do not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
