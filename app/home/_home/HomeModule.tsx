"use client";

import { WelcomePanel } from "../_prompt-studio/_components/WelcomePanel";
import { DocumentViewer } from "../_prompt-studio/_components/DocumentViewer";
import { usePromptStore } from "@/store/home/promptStore";

export const HomeModule = () => {
  // 当前选中的提示词文档
  const selectedPrompt = usePromptStore((state) => state.selectedPrompt);
  // 清除当前选中提示词文档状态的函数
  const clearSelectedPrompt = usePromptStore((state) => state.clearSelectedPrompt);

  // 一行横向滚动的卡片占位条
  const PlaceholderCardStrip = () => (
    <div className="flex flex-nowrap gap-4 overflow-x-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {Array.from({ length: 10 }).map((_, idx) => (
        <div
          key={idx}
          className="shrink-0 w-56 h-32 rounded-xl border bg-white"
        />
      ))}
    </div>
  );

  return (
    <main className="relative w-full h-full bg-muted/20 overflow-y-auto">

      <section className="px-6 pt-6 max-w-[70rem] w-full mx-auto">
        <h2 className="text-2xl font-bold mb-8">模块广场</h2>
        <PlaceholderCardStrip />
      </section>

      {/* 欢迎面板 */}
      <WelcomePanel />


      {/* 全局挂载区 */}
      {/* 文档视图容器 */}
      <DocumentViewer />
    </main>
  );
};
