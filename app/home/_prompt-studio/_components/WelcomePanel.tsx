"use client";

// 欢迎面板：顶部欢迎与功能概览占位模块
export const WelcomePanel = () => {
  return (
    <section className="px-6 pt-6 max-w-[50rem] w-full mx-auto mt-[5rem] bg-blue-100">
      {/* 顶部标题占位 */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">欢迎 👋</h1>
      </div>

      {/* 上方两列卡片占位布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[15rem]">
        {/* 左侧工具卡片占位 */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">工具</h2>
            <span className="text-xs text-gray-500">更多 ›</span>
          </div>
          {/* 工具图标网格占位 */}
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

        {/* 右侧画图/视频卡片占位 */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold">画图</h2>
            <span className="text-xs text-gray-500">更多 ›</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* 子卡片占位 */}
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="h-24 rounded-md bg-white border mb-2" />
              <div className="h-3 w-24 bg-white border rounded" />
            </div>
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="h-24 rounded-md bg-white border mb-2" />
              <div className="h-3 w-24 bg-white border rounded" />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};


