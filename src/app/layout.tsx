import type { Metadata, Viewport } from "next";
import { Noto_Serif } from "next/font/google";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AuthProvider } from "../lib/auth-context";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "LeGuard AI | The Digital Curator",
  description: "High-end, AI-powered contract review platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f8f9ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${notoSerif.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-serif bg-background text-foreground">
        <AuthProvider>
          <Header />
          <main className="flex-grow flex flex-col relative z-0">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
