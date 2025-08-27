"use client";

import { useDocumentStore } from "@/store/home/documentStore";

// 欢迎面板：顶部欢迎与功能概览占位模块
export const WelcomePanel = () => {
  // 点击"新建模块"时打开文档查看器（创建模式）
  const openCreateModule = () => {
    useDocumentStore.getState().open();
  };

  return (
    <section className="px-6 pt-6 max-w-[50rem] w-full mx-auto mt-[5rem] bg-blue-100">
      {/* 顶部标题占位 */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">欢迎 👋</h1>
      </div>

      {/* 上方两列卡片占位布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[15rem]">
        {/* 左侧功能卡片 */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">功能</h2>
            <span className="text-xs text-gray-500">更多 ›</span>
          </div>
          {/* 功能按钮占位 */}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={openCreateModule} className="h-16 rounded-lg border bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              新建模块
            </button>
            <div className="h-16 rounded-lg border bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              占位
            </div>
            <div className="h-16 rounded-lg border bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              ···
            </div>
          </div>
        </div>

        {/* 右侧快捷卡片占位 */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">快捷</h2>
            <span className="text-xs text-gray-500">更多 ›</span>
          </div>
          {/* 快捷功能图标网格 */}
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 rounded-lg border bg-gray-50 flex items-center justify-center text-xs text-gray-400"
              >
                占位
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};


