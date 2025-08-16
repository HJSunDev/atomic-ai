"use client";

import type { GridItem } from './types';

/**
 * 拖拽时的模块预览，显示卡片标题和内容
 */
export function ModuleDragPreview({ item }: { item: GridItem | null }) {
  if (!item) return null;
  return (
    <div
      className={`bg-white rounded-lg shadow-xl border-2 border-blue-500 cursor-grabbing flex flex-col items-start justify-center px-5 py-3 select-none`}
      style={{ minHeight: '72px', maxHeight: '96px', opacity: 0.97 }}
   >
      {/* 只显示标题和内容，内容超出省略 */}
      <div className="text-base font-bold mb-1 truncate w-full" title={item.title}>{item.title}</div>
      <div className="text-xs text-gray-700 opacity-80 truncate w-full" title={item.content}>{item.content}</div>
    </div>
  );
}


