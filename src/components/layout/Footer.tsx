import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/60 mt-auto relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.015] to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6">
          <div className="sm:col-span-2 md:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-primary">LeGuard</span>{" "}
              <span className="text-slate-800">AI</span>
            </Link>
            <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-sm leading-relaxed">
              The Digital Curator. A scholarly, premium, and authoritative editorial experience for legal document review.
            </p>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2 sm:space-y-3">
              <li>
                <Link href="/privacy" className="text-sm sm:text-base text-slate-500 hover:text-primary transition-all duration-200 block py-1 hover:translate-x-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm sm:text-base text-slate-500 hover:text-primary transition-all duration-200 block py-1 hover:translate-x-0.5">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimers" className="text-sm sm:text-base text-slate-500 hover:text-primary transition-all duration-200 block py-1 hover:translate-x-0.5">
                  Legal Disclaimers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-2 sm:space-y-3">
              <li>
                <Link href="/pricing" className="text-sm sm:text-base text-slate-500 hover:text-primary transition-all duration-200 block py-1 hover:translate-x-0.5">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-sm sm:text-base text-slate-500 hover:text-primary transition-all duration-200 block py-1 hover:translate-x-0.5">
                  New Scan
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-sm sm:text-base text-slate-500 hover:text-primary transition-all duration-200 block py-1 hover:translate-x-0.5">
                  History
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 border-t border-slate-200/60 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm sm:text-base text-slate-400">
            &copy; {new Date().getFullYear()} LeGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
