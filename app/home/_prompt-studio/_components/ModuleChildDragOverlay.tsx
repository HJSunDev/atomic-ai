"use client";

import type { GridItem } from './types';

interface ModuleChildDragOverlayProps {
  child: GridItem;
}

export function ModuleChildDragOverlay({ child }: ModuleChildDragOverlayProps) {
  return (
    <div
      className="group relative flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-2 py-1.5 shadow-lg text-sm cursor-grabbing"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[13px] text-foreground/90 leading-tight truncate">{child.title}</div>
      </div>
      {/* 右侧操作按钮区域 - 保持与原始子模块相同的占位尺寸 */}
      <div className="ml-2 flex items-center">
        <div className="h-6 w-6" />
      </div>
    </div>
  );
}


