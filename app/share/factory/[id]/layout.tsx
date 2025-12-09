import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Factory App Share | Atomic AI",
  description: "View and interact with AI-generated apps shared via Atomic AI Factory.",
};

export default function ShareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

