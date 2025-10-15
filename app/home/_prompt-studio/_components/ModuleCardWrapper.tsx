"use client";

import { CSS } from '@dnd-kit/utilities';
import { useDroppable, useDraggable, useDndContext } from '@dnd-kit/core';
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

  // 使用全局 DnD 上下文，识别是否正悬停在该卡片的子区域（child-area 或 child-drop）
  const { over } = useDndContext();
  const isOverDescendant = Boolean(
    over &&
    (over as any).data &&
    (over as any).data.current &&
    (
      // 子模块区域空白处（用于接收新子模块）
      ((over as any).data.current.type === 'child-area' && (over as any).data.current.parentId === item.id) ||
      // 子模块之间的排序占位（用于重排）
      ((over as any).data.current.type === 'child-drop' && (over as any).data.current.parentId === item.id)
    )
  );

  // 统一判定：当悬停在自身或任一子区域时，视为覆盖态（但排除自身子模块拖拽时的排序场景）
  const isOverSelfOrDescendant = (isOver || isOverDescendant) && !isDraggingOwnChild;

  const style = {
    // 拖动时不应用 transform，让元素留在原地作为占位符
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    boxShadow: isOverSelfOrDescendant && !isDragging ? '0 0 0 3px rgb(212 212 212 / 0.5)' : undefined,
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
      className={`bg-[#422303]/3 p-3 rounded-[14px] shadow cursor-pointer transition-shadow hover:shadow-lg flex flex-col relative group ${isOverSelfOrDescendant && !isDragging ? 'ring-2 ring-neutral-300/50' : ''}`}
      onClick={(e) => {
        // 如果点击的是按钮，不触发卡片点击事件
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onClick?.();
      }}
    >
      {children}
      
      {/*  */}
      {isOverSelfOrDescendant && !isDragging && (
        <div className="absolute inset-0 bg-neutral-50/80 backdrop-blur-sm flex items-center justify-center text-neutral-700 text-sm font-medium pointer-events-none rounded-lg z-30">
          松开以添加为子模块
        </div>
      )}
    </div>
  );
}

