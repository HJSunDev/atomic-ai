"use client";

import type { GridItem } from './types';

/**
 * 拖拽时的模块预览，显示卡片标题和描述
 */
export function ModuleCardDragOverlay({ item }: { item: GridItem | null }) {
  if (!item) return null;
  return (
    <div
      className={`bg-white/95 backdrop-blur-[1px] rounded-xl border border-neutral-200 shadow-sm ring-1 ring-black/5 cursor-grabbing flex flex-col items-start justify-center px-4 py-3 select-none transition-shadow`}
      style={{ minHeight: '80px', maxHeight: '112px', opacity: 0.98 }}
   >
      <div className="text-[15px] leading-snug tracking-tight font-semibold text-neutral-900 mb-1.5 truncate w-full" title={item.title || "无标题"}>{item.title || "无标题"}</div>
      {item.description && (
        <div className="text-[13px] leading-snug text-neutral-600 truncate w-full" title={item.description}>{item.description}</div>
      )}
    </div>
  );
}
