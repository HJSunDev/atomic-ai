"use client";

import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { GridItem } from './types';

// 可拖拽的子模块组件（仅用于操作区）
export function SortableChildItem({ child, parentId, index }: { child: GridItem, parentId: string, index: number }) {
  // 生成唯一id，格式为 child-父id-子id
  const dragId = `child-${parentId}-${child.id}`;
  // 使子模块可拖拽
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: { type: 'child', parentId, child, index },
  });

  // 创建可放置区域，用于子模块间排序
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `child-drop-${parentId}-${child.id}`,
    data: {
      type: 'child-drop',
      parentId,
      childId: child.id,
      index
    }
  });

  // 拖拽样式
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    transition: isDragging ? 'none' : 'transform 0.2s',
  } as React.CSSProperties;

  // 组合 ref
  const composedRef = (node: any) => {
    setNodeRef(node);
    setDropRef(node);
  };

  return (
    <div
      ref={composedRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`group relative flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-2 py-1.5 shadow-sm text-sm cursor-grab hover:shadow-md transition-colors ${isOver && !isDragging ? 'ring-2 ring-neutral-300/50' : ''}`}
    >
      <div className="flex-1">
        <div className="font-medium text-neutral-800">{child.title}</div>
      </div>
      {/* 右侧操作按钮区域 */}
      <div className="ml-2 flex items-center">
        {/* 提升为顶层模块按钮 */}
        <button
          className="h-6 w-6 flex items-center justify-center text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            // 将该事件暴露到 NewBlock 组件
            window.dispatchEvent(new CustomEvent('promote-to-top', { 
              detail: { parentId, childId: child.id }
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


