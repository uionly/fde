import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SessionProvider } from "@/components/auth/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "FDE Learning Lab", template: "%s · FDE Learning Lab" },
  description: "Practice Forward Deployed Engineering through interactive enterprise AI simulations, technical playgrounds, and customer missions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a className="sr-only z-[100] rounded-md bg-background px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring" href="#main-content">Skip to main content</a>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <SessionProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1" id="main-content">{children}</main>
              <SiteFooter />
            </div>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
