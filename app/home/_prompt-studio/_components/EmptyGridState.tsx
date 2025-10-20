"use client";

/**
 * 网格区空状态组件
 * 
 * 设计原则：
 * - Notion 风格：简洁、优雅、专业
 * - 引导用户操作：通过提示文案引导用户在操作区创建模块
 * - 视觉层次清晰：图标 → 主标题 → 副标题 → 操作提示
 * - 保持一致性：颜色、字体、间距与设计系统对齐
 */
export function EmptyGridState() {
  return (
    <div className="col-span-full h-[5rem] flex flex-col items-center justify-center gap-4 text-center">
      {/* 空状态图标：文档/书籍icon，采用渐变背景营造轻盈感 */}
      <div className="relative">
        {/* 背景光晕效果：增加深度和视觉吸引力 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#422303]/5 to-transparent rounded-full blur-2xl" />
        {/* 主icon：线性设计风格与 Notion 设计语言一致 */}
        <svg
          className="w-16 h-16 text-[#807d78]/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    </div>
  );
}
