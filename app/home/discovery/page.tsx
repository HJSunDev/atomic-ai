"use client";

import { useEffect, useMemo } from "react";
import { useSidebarMenuStore } from "@/store/home";
import { useManageAiContext } from "@/hooks/useAiContext";

const DISCOVERY_CONTEXT = {
  id: "discovery-module",
  type: "discovery",
  showCatalyst: false,
  catalystPlacement: "global",
} as const;

export default function DiscoveryPage() {
  const setActiveMenu = useSidebarMenuStore((state) => state.setActiveMenu);

  // 在独立路由内单独挂载AI上下文，保证助手行为场景化
  const context = useMemo(() => DISCOVERY_CONTEXT, []);
  useManageAiContext(context);

  // 确保用户通过深链进入时侧边栏状态与路由保持一致
  useEffect(() => {
    setActiveMenu("discovery");
  }, [setActiveMenu]);

  return (
    <div className="h-full w-full overflow-auto bg-white dark:bg-[#161616]">
      <div className="max-w-6xl mx-auto py-12 px-6 space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">探索与推荐</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
            发现 · 即将上线
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            我们正在为你准备个性化的发现流、趋势洞察与智能筛选，敬请期待。
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101010] p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              智能推荐
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              聚合你的兴趣、团队热点与外部信号，自动生成专属推荐流。
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101010] p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              快速筛选
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              按主题、标签或时间范围即时筛选，搭配AI助理进行二次总结。
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101010] p-6 space-y-3 sm:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              深链分享
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              支持通过链接直达发现页，保持筛选条件与上下文，便于团队协作与复盘。
            </p>
          </div>
        </section>

        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#101010] p-10 text-center space-y-3">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-50">
            我们正在打磨体验，很快与你见面。
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            你可以继续使用其他模块，或通过侧边栏返回主页。
          </p>
        </div>
      </div>
    </div>
  );
}

