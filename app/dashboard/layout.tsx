"use client";

import { ReactNode } from "react";
import { Sidebar } from "./_components/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 侧边栏 - 固定宽度 */}
      <Sidebar />
      {/* 直接渲染页面内容 */}
      {children}
    </div>
  );
} 