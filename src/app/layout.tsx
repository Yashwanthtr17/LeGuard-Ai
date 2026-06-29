import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AuthProvider } from "../lib/auth-context";
import { AuthGuard } from "../components/layout/AuthGuard";
import { ThemeProvider } from "../lib/theme-context";
import { CookieConsent } from "../components/ui/CookieConsent";
import { QueryProvider } from "@/lib/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LeGuard-AI | AI-Powered Legal Document Risk Analysis",
  description:
    "Upload any legal document and get a plain-English risk analysis powered by AI. Understand every clause, every risk, before you sign.",
  keywords: [
    "legal document analysis",
    "AI contract review",
    "risk analysis",
    "NDA review",
    "contract analyzer",
    "legal AI",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('leguard_theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <AuthGuard>
                <Header />
                <main className="flex-grow flex flex-col relative z-0">
                  {children}
                </main>
                <Footer />
                <CookieConsent />
              </AuthGuard>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
