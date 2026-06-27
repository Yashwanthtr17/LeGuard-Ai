import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AuthProvider } from "../lib/auth-context";
import { AuthGuard } from "../components/layout/AuthGuard";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LeGuard-AI | AI-Powered Legal Document Risk Analysis",
  description: "Upload any legal document and get a plain-English risk analysis powered by AI. Understand every clause, every risk.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E3A5F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <AuthGuard>
            <Header />
            <main className="flex-grow flex flex-col relative z-0">
              {children}
            </main>
            <Footer />
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
