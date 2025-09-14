"use client";

import { TestBlock } from "./_components/TestBlock";
import { PromptBoard } from "./_components/PromptBoard";
import { DocumentViewer } from "./_components/DocumentViewer";
import { usePromptStore } from "@/store/home/promptStore";

export const PromptStudioModule = () => {
  // 当前选中的提示词文档
  const selectedPrompt = usePromptStore((state) => state.selectedPrompt);
  // 清除当前选中提示词文档状态的函数
  const clearSelectedPrompt = usePromptStore((state) => state.clearSelectedPrompt);

  return (
    <main className="relative w-full h-full bg-muted/20 overflow-y-auto bg-red-100">

      {/* 页面标题与说明 */}
      <section className="px-6 max-w-[70rem] w-full mx-auto">

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


      {/* 搜索区*/}
      <section className="px-6 max-w-[70rem] w-full mx-auto"> 
        
      </section>
      
      {/* 提示词管理区 */}
      <PromptBoard />


      {/* 全局挂载区 */}
      {/* 文档视图容器 */}
      <DocumentViewer />


    </main>
  );
};
