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
      className={`relative flex items-center justify-between bg-white border border-gray-200 rounded pl-4 pr-2 py-2 shadow-sm text-sm cursor-grab hover:shadow-md transition ${isOver && !isDragging ? 'ring-2 ring-blue-400' : ''}`}
    >
      {/* 拖拽悬停时的指示器 */}
      {isOver && !isDragging && (
        <div className="absolute inset-x-0 -top-3 h-1.5 bg-blue-500 rounded-full z-10"></div>
      )}
      {/* 左侧竖线，突出层级关系 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-200 rounded-l" style={{height: '100%'}}></div>
      <div>
        <span className="font-medium text-gray-700">{child.title}</span>
        <span className="ml-2 text-gray-400">{child.content}</span>
      </div>
      {/* 右侧操作按钮区域 */}
      <div className="ml-2 flex items-center">
        {/* 提升为顶层模块按钮 */}
        <button
          className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
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


