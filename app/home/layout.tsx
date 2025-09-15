"use client";

import { ReactNode } from "react";
import { Sidebar } from "./_components/Sidebar";
import { GlobalCatalyst } from "./_components/GlobalCatalyst";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* 侧边栏 - 固定宽度 */}
      <Sidebar />
      {/* 主内容区域 - 占用剩余空间 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      {/* 全场景AI助手 - 右上角固定定位，覆盖整个应用区域 */}
      <GlobalCatalyst />
    </div>
  );
} 