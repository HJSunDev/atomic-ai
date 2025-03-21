"use client";

import { DashboardPageWrapper } from "./_components/DashboardPageWrapper";
import { AtomicBlock } from "./_components/AtomicBlock";
import { TestBlock } from "./_components/TestBlock";
import { ClientHopeBlock } from "./_components/HopeBlock";

export default function DashboardPage() {
  return (
    <DashboardPageWrapper>
      <ClientHopeBlock />
      <TestBlock />
      <div className="space-y-6">
        {/* 欢迎区域 */}
        <AtomicBlock />



        {/* 更多内容... */}
      </div>
    </DashboardPageWrapper>
  );
} 