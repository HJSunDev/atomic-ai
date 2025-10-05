"use client";

import type { GridItem } from './types';
import { File } from 'lucide-react';

/**
 * 模块卡片右下角的摘要信息徽章
 *
 * 职责：显示该模块包含的子模块数量
 * 仅在模块包含子模块时渲染
 */
export function SummaryBadge({ item }: { item: GridItem }) {
  // 当没有子模块时，不渲染任何内容
  if (!item.children || item.children.length === 0) {
    return null;
  }

  return (
    // 使用绝对定位将徽章放置在父容器（ModuleCardWrapper）的右下角，与Card区的样式保持一致
    <div className="absolute bottom-[-1] right-[0.5]">
      <div className="flex items-center gap-[4px] bg-white rounded-[6px] px-1 py-[2px] border border-border/50 shadow-sm">
        <File className="w-[10px] h-[10px] text-muted-foreground/70" />
        <span className="text-[12px] text-black leading-none">
          {item.children.length}
        </span>
      </div>
    </div>
  );
}
