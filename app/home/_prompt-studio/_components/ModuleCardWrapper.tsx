"use client";

import { CSS } from '@dnd-kit/utilities';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { GridItem } from './types';

interface ModuleCardWrapperProps {
  item: GridItem;
  isOperationAreaItem?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

/**
 * 模块卡片容器组件
 * 
 * 职责：负责卡片的拖拽行为、放置目标能力、外层DOM结构和样式
 * 具体的内容渲染通过 children 传入，实现内容和行为的分离
 */
export function ModuleCardWrapper({ 
  item, 
  isOperationAreaItem = false, 
  onClick,
  children
}: ModuleCardWrapperProps) {
  const { attributes, listeners, setNodeRef: setDragNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  let setDropNodeRef: ((node: HTMLElement | null) => void) | undefined = undefined;
  let isOver = false;
  let activeDragInfo: any = undefined;
  
  if (isOperationAreaItem) {
    const drop = useDroppable({ id: `operation-item-${item.id}` });
    setDropNodeRef = drop.setNodeRef;
    isOver = drop.isOver;
    activeDragInfo = drop.active?.data?.current;
  }

  // 检查当前拖拽的是否为该卡片自己的子模块
  const isDraggingOwnChild = activeDragInfo && 
    activeDragInfo.type === 'child' && 
    activeDragInfo.parentId === item.id;

  const style = {
    // 拖动时不应用 transform，让元素留在原地作为占位符
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    boxShadow: isOver && !isDragging && !isDraggingOwnChild ? '0 0 0 3px rgb(212 212 212 / 0.5)' : undefined,
    zIndex: isDragging ? 50 : undefined,
    // 拖动时显示为半透明占位符
    opacity: isDragging ? 0.4 : 1,
    pointerEvents: isDragging ? 'none' : 'auto',
  } as React.CSSProperties;

  // 组合 ref：既要支持拖拽（draggable），又要支持放置（droppable）
  function composedRef(node: any) {
    setDragNodeRef(node);
    if (setDropNodeRef) setDropNodeRef(node);
  }

  return (
    <div
      ref={composedRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[#422303]/3 p-3 rounded-lg shadow cursor-pointer transition-shadow hover:shadow-lg flex flex-col relative group ${isOver && !isDragging && !isDraggingOwnChild ? 'ring-2 ring-neutral-300/50' : ''}`}
      onClick={(e) => {
        // 如果点击的是按钮，不触发卡片点击事件
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onClick?.();
      }}
    >
      {children}
      
      {/* 拖拽经过时的提示遮罩，仅在悬停时显示，且排除正在拖动的项目本身和自己的子模块 */}
      {isOver && !isDragging && !isDraggingOwnChild && (
        <div className="absolute inset-0 bg-neutral-50/80 backdrop-blur-sm flex items-center justify-center text-neutral-700 text-sm font-medium pointer-events-none rounded-lg z-10">
          松开以添加为子模块
        </div>
      )}
    </div>
  );
}

