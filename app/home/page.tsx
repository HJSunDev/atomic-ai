"use client";

import { DashboardPageWrapper } from "./_components/DashboardPageWrapper";
import { AtomicBlock } from "./_components/AtomicBlock";
import { TestBlock } from "./_components/TestBlock";

export default function DashboardPage() {
  return (
    <DashboardPageWrapper>
      <TestBlock />
      <div className="space-y-6">
        {/* 欢迎区域 */}
        <AtomicBlock />



        {/* 更多内容... */}
      </div>
    </DashboardPageWrapper>
  );
} 