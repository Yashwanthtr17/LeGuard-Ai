import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-primary tracking-tight">
              LeGuard <span className="text-slate-800">AI</span>
            </Link>
            <p className="mt-4 text-slate-500 max-w-sm">
              The Digital Curator. A scholarly, premium, and authoritative editorial experience for legal document review.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-base text-slate-500 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-slate-500 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimers" className="text-base text-slate-500 hover:text-primary">
                  Legal Disclaimers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/pricing" className="text-base text-slate-500 hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-base text-slate-500 hover:text-primary">
                  New Scan
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-base text-slate-500 hover:text-primary">
                  History
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-slate-400">
            &copy; {new Date().getFullYear()} LeGuard AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
