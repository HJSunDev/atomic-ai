"use client";

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { GridItem } from './types';

/**
 * 可拖拽的子模块组件，使用 useSortable 以获得兄弟项位移和占位
 * 
 * 使用虚拟 ID 进行拖拽识别
 */
export function SortableChildItem({ child, parentVirtualId, index }: { child: GridItem, parentVirtualId: string, index: number }) {
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: child.virtualId,
    data: { type: 'child', parentId: parentVirtualId, index, child },
  });

  // 拖拽样式
  const style = {
    // 使用覆盖层时，让原元素保持占位，不再跟随鼠标
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 0 : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`group relative flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-2 py-1.5 shadow-sm text-sm cursor-grab hover:shadow-md transition-colors ${isOver && !isDragging ? 'ring-2 ring-neutral-300/50' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[13px] text-foreground/90 leading-tight truncate">{child.title || "无标题"}</div>
      </div>
      {/* 右侧操作按钮区域 */}
      <div className="ml-2 flex items-center">
        {/* 提升为顶层模块按钮 */}
        <button
          className="h-6 w-6 flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            // 将该事件暴露到 PromptBoard 组件（使用虚拟 ID）
            window.dispatchEvent(new CustomEvent('promote-to-top', { 
              detail: { parentId: parentVirtualId, childId: child.virtualId }
            }));
          }}
          title="提升为顶层模块"
        >
          {/* 使用 arrow-up-right 图标 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}


