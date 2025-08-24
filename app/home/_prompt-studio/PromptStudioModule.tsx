"use client";

import { TestBlock } from "./_components/TestBlock";
import { PromptBoard } from "./_components/PromptBoard";
import { WelcomePanel } from "./_components/WelcomePanel";
import { EditorPanel } from "./_components/EditorPanel";
import { usePromptStore } from "@/store/home/promptStore";

export const PromptStudioModule = () => {
  // 获取当前选择的提示词模块
  const selectedPrompt = usePromptStore((state) => state.selectedPrompt);
  const clearSelectedPrompt = usePromptStore(
    (state) => state.clearSelectedPrompt
  );

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
      {/* 全局挂载：通用编辑面板（Notion 风格） */}
      <EditorPanel />
      {/* 欢迎面板 */}
      <WelcomePanel />

      {/* 页面标题与说明 */}
      <section className="px-6 pt-6 max-w-[70rem] w-full mx-auto">
        <h2 className="text-2xl font-bold mb-8">功能卡片</h2>
        <p className="mb-6 text-gray-600">将下方卡片拖动到上方操作区</p>

        {/* 当前选择的提示词模块指示器 */}
        {selectedPrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-sm text-blue-600 font-medium">
                当前选择的提示词模块：
              </span>
              <span className="ml-2 font-bold">{selectedPrompt.title}</span>
            </div>
            <button
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
              onClick={clearSelectedPrompt}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              清除选择
            </button>
          </div>
        )}
      </section>

      {/* 提示词管理区 */}
      <PromptBoard />

      {/* 模块广场  */}
      <section className="px-6 pt-6 max-w-[70rem] w-full mx-auto">
        <h2 className="text-2xl font-bold mb-8">模块广场</h2>
        <PlaceholderCardStrip />
      </section>

      {/* artifact广场  */}
      <section className="px-6 pt-6 max-w-[70rem] w-full mx-auto">
        <h2 className="text-2xl font-bold mb-8">artifact广场</h2>
        <PlaceholderCardStrip />
      </section>
    </main>
  );
};
