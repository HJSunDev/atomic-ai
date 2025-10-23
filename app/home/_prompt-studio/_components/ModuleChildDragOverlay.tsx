"use client";

import type { GridItem } from './types';

interface ModuleChildDragOverlayProps {
  child: GridItem;
}

export function ModuleChildDragOverlay({ child }: ModuleChildDragOverlayProps) {
  
  const isContentBlock = child.blockType === 'content';
  
  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 shadow-lg text-sm cursor-grabbing ${
        isContentBlock ? 'bg-neutral-50 border border-neutral-200' : 'bg-white border border-neutral-200'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex-1 min-w-0 flex items-center gap-1">
        {isContentBlock && (
          // 内容块的简洁标识：小型页面图标
          <div className="flex-shrink-0 w-5 h-5 rounded bg-neutral-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
        )}
        <div className={`font-medium text-[13px] leading-tight truncate ${isContentBlock ? 'text-neutral-800' : 'text-foreground/90'}`}>{child.title || '无标题'}</div>
      </div>
      {/* 右侧操作按钮区域 - 保持与原始子模块相同的占位尺寸 */}
      <div className="ml-2 flex items-center">
        <div className="h-6 w-6" />
      </div>
    </div>
  );
}


