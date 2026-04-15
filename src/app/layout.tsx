import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";

import { ATELIER_THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

const themeBootstrapScript = `(function(){try{var k=${JSON.stringify(ATELIER_THEME_STORAGE_KEY)};var v=localStorage.getItem(k);document.documentElement.classList.toggle("dark",v==="dark");}catch(e){}})();`;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goodbye Bad Habits",
  description: "Web task board and agenda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={`${inter.className} flex min-h-full flex-col bg-ds-surface text-ds-on-surface transition-colors duration-300`}
      >
        <Script id="atelier-theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrapScript}
        </Script>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
