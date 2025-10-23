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

  const isContentBlock = child.blockType === 'content';
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 shadow-sm text-sm cursor-grab hover:shadow-md transition-colors ${
        isContentBlock ? 'bg-neutral-50 border border-neutral-200' : 'bg-white border border-neutral-200'
      } ${isOver && !isDragging ? 'ring-2 ring-neutral-300/50' : ''}`}
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
        <div className={`font-medium text-[13px] leading-tight truncate ${isContentBlock ? 'text-neutral-800' : 'text-foreground/90'}`}>
          {child.title || '无标题'}
        </div>
      </div>
      {/* 右侧操作按钮区域（内容块不显示提升按钮） */}
      {!isContentBlock && (
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
      )}
    </div>
  );
}


