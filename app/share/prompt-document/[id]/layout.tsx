import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Share | Atomic AI",
  description: "View shared documents created with Atomic AI.",
};

export default function ShareLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

