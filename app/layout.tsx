import type { Metadata } from "next";
import "./globals.css";

import { outfit, generalSans } from "@/public/fonts/fonts";

import { ThemeProvider } from "next-themes";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DEFAULT_SITE_METADATA } from "@/lib/seo-pages";

export const metadata: Metadata = DEFAULT_SITE_METADATA;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${generalSans.className} ${outfit.variable} antialiased`}
      >
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
