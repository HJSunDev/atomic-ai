import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProviderWrapper } from "@/components/providers/theme-provider";

import { Toaster } from "sonner";
import { AuthGuardProvider } from "@/components/providers/auth-guard-provider";

// 定义 Geist Sans 字体
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 定义 Geist Mono 字体
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js 应用",
  description: "使用 Next.js 创建的应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      > 
        <ConvexClientProvider>
          <ThemeProviderWrapper>
            <AuthGuardProvider>
              <Toaster position="bottom-center" />
              {children}
            </AuthGuardProvider>
          </ThemeProviderWrapper>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
