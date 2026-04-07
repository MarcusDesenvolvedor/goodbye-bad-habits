import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

import { bauhausSans } from "@/lib/bauhaus-font";

import "./globals.css";

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
      className={`${bauhausSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={`${bauhausSans.className} flex min-h-full flex-col bg-[var(--stitch-bg)] text-[var(--stitch-text)]`}
      >
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
