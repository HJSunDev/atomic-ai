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
  
  // 无论是 网格区卡片 还是 操作区卡片，都需要 可拖拽
  // 使用虚拟 ID 作为拖拽标识
  const { attributes, listeners, setNodeRef: setDragNodeRef, transform, 
    // 是否正在被拖拽
    isDragging 
  } = useDraggable({
    id: item.virtualId,
  });

  let setDropNodeRef: ((node: HTMLElement | null) => void) | undefined = undefined;
  // 是否有元素悬停在当前卡片上
  let isOver = false;
  // 当前正在被拖拽的元素信息（仅操作区卡片需要）
  let draggingItemInfo: any = undefined;
  
  // 如果是操作区卡片，则需要 可放置
  // 使用虚拟 ID 作为 droppable 标识
  if (isOperationAreaItem) {
    const drop = useDroppable({ id: `operation-item-${item.virtualId}` });
    setDropNodeRef = drop.setNodeRef;
    // 是否有元素悬停在当前卡片上
    isOver = drop.isOver;
    // 获取正在被拖拽的元素信息（drop.active 是 dnd-kit 提供的全局拖拽源）
    draggingItemInfo = drop.active?.data?.current;
  }

  // 判断是否正在拖拽自己的子模块（用于排除子模块排序时的覆盖层显示）
  const isDraggingOwnChild = draggingItemInfo && 
    draggingItemInfo.type === 'child' && 
    draggingItemInfo.parentId === item.virtualId;

  // 全局 over 对象：当前鼠标悬停的 droppable 区域信息，放置区对象的信息
  const { over } = useDndContext();

  // 当前鼠标是否选停在 操作区卡片的一个子模块上
  // 因为操作区子模块列表是一个排序区，会干扰 所属操作区卡片的 isOver 状态,当光标进入子模块，所属操作区卡片的 isOver 状态为 false，所以需要把 悬停在 子模块 上 的状态单独处理
  const isOverChildModule = Boolean(
  	over &&
  	(over as any).data &&
  	(over as any).data.current &&
  	(over as any).data.current.type === 'child' && 
  	(over as any).data.current.parentId === item.virtualId
  );

  // 是否显示"松开以添加为子模块"的覆盖层提示
  // 当鼠标悬停在操作区卡片或其子模块上，且不是正在拖拽自己的子模块时，显示覆盖层提示
  const shouldShowDropOverlay = (isOver || isOverChildModule) && !isDraggingOwnChild;

  const style = {
    // 拖动时不应用 transform，让元素留在原地作为占位符
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    boxShadow: shouldShowDropOverlay && !isDragging ? '0 0 0 3px rgb(212 212 212 / 0.5)' : undefined,
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
      className={`bg-[#422303]/3 p-3 rounded-[14px] shadow cursor-pointer transition-shadow hover:shadow-lg flex flex-col relative group ${shouldShowDropOverlay && !isDragging ? 'ring-2 ring-neutral-300/50' : ''}`}
      onClick={(e) => {
        // 如果点击的是按钮，不触发卡片点击事件
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onClick?.();
      }}
    >
      {children}
      
      {/* 显示"松开以添加为子模块"的覆盖层提示 */}
      {shouldShowDropOverlay && !isDragging && (
        <div className="absolute inset-0 bg-neutral-50/80 backdrop-blur-sm flex items-center justify-center text-neutral-700 text-sm font-medium pointer-events-none rounded-lg z-30">
          释放添加为子模块
        </div>
      )}
    </div>
  );
}

