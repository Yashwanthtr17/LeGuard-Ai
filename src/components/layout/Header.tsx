import Link from "next/link";
import { Button } from "../ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
              LeGuard <span className="text-slate-800">AI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/scan" className="text-slate-600 hover:text-primary transition-colors font-medium">
              New Scan
            </Link>
            <Link href="/history" className="text-slate-600 hover:text-primary transition-colors font-medium">
              History
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-slate-600 hover:text-primary font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/pricing">
              <Button variant="primary">Get Pro</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
