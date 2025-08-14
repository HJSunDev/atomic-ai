"use client";

import { CSS } from '@dnd-kit/utilities';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import type { GridItem } from './types';
import { GridItemContent } from './GridItemContent';
import { usePromptStore, PromptModule } from '@/store/home/promptStore';

/**
 * 可拖拽的网格卡片组件
 *
 * 该组件既可以作为拖拽源（可被拖动），也可以作为放置目标（可被拖拽的卡片放入，成为子模块）。
 * 通过 isOperationAreaItem 控制是否启用 droppable 能力（仅操作区的卡片需要）。
 *
 * @param item - 当前渲染的网格项数据
 * @param isOperationAreaItem - 是否为操作区的卡片，决定是否可作为放置目标
 */
export function DraggableGridItem({ 
  item, 
  isOperationAreaItem = false, 
  onDelete, 
  onSave,
  onClick,
  onPreview
}: { 
  item: GridItem, 
  isOperationAreaItem?: boolean, 
  onDelete?: (id: string) => void, 
  onSave?: (item: GridItem) => void,
  onClick?: () => void,
  onPreview?: () => void
}) {
  // 从store获取设置提示词的方法
  const setSelectedPrompt = usePromptStore(state => state.setSelectedPrompt);

  const { attributes, listeners, setNodeRef: setDragNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  let setDropNodeRef: ((node: HTMLElement | null) => void) | undefined = undefined;
  let isOver = false;
  let activeDragInfo: any = undefined;
  
  if (isOperationAreaItem) {
    // 使该卡片成为 droppable 区域，id 唯一标识
    const drop = useDroppable({ id: `operation-item-${item.id}` });
    setDropNodeRef = drop.setNodeRef;
    isOver = drop.isOver;
    // 获取当前拖拽的元素信息
    activeDragInfo = drop.active?.data?.current;
  }

  // 检查当前拖拽的是否为该卡片自己的子模块
  const isDraggingOwnChild = activeDragInfo && 
    activeDragInfo.type === 'child' && 
    activeDragInfo.parentId === item.id;

  // 计算拖拽过程中的样式
  //    - 拖拽时应用 transform
  //    - 被悬停时高亮边框，且排除正在拖动的项目本身和自己的子模块
  const style = {
    transform: CSS.Translate.toString(transform),
    boxShadow: isOver && !isDragging && !isDraggingOwnChild ? '0 0 0 3px #3b82f6' : undefined,
    zIndex: isDragging ? 50 : undefined,
  } as React.CSSProperties;

  // 组合 ref：既要支持拖拽（draggable），又要支持放置（droppable）
  //    需要将 setDragNodeRef 和 setDropNodeRef 同时作用于同一个 DOM 节点
  function composedRef(node: any) {
    setDragNodeRef(node);
    if (setDropNodeRef) setDropNodeRef(node);
  }

  // 处理引用按钮点击事件
  const handleUsePrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPrompt(item as unknown as PromptModule);
  };

  // --- 按钮渲染逻辑 --- 
  // 渲染操作区按钮
  const renderOperationAreaButtons = () => (
    <div className="absolute top-2 right-2 flex gap-2 z-20">
      {onSave && (
        <button
          className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-100 rounded-full transition-colors cursor-pointer"
          title="保存到网格列表"
          onClick={e => {
            e.stopPropagation();
            onSave(item);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
          title="删除此模块"
          onClick={e => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );

  // 渲染网格区按钮
  const renderGridAreaButtons = () => (
    <>
      {onDelete && (
        <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 z-20 transition-opacity duration-200">
          <button
            className="h-7 w-7 flex items-center justify-center text-red-500 bg-white rounded-full transition-all duration-200 cursor-pointer shadow-md transform -rotate-12 opacity-75 hover:opacity-100 hover:rotate-0 hover:scale-110"
            title="删除此模块"
            onClick={e => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      )}

      {/* 右上角按钮区域 (固定显示) */}
      <div className="absolute top-2 right-2 flex gap-1.5 z-20">
        <button
          className="h-7 w-7 flex items-center justify-center text-gray-500 rounded-full transition-colors cursor-pointer hover:bg-teal-100 hover:text-teal-600"
          title="预览完整提示词"
          onClick={(e) => {
            e.stopPropagation();
            onPreview?.();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <button
          className="h-7 w-7 flex items-center justify-center text-gray-500 rounded-full transition-colors cursor-pointer hover:bg-blue-100 hover:text-blue-600"
          title="引用此提示词模块"
          onClick={handleUsePrompt}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <div
      ref={composedRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${item.color} p-4 rounded-lg shadow cursor-pointer transition-shadow hover:shadow-lg flex flex-col relative group ${isOver && !isDragging && !isDraggingOwnChild ? 'ring-2 ring-blue-400' : ''}`}
      onClick={(e) => {
        // 如果点击的是按钮，不触发卡片点击事件
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onClick?.();
      }}
    >
      {/* 根据区域渲染不同的按钮 */}
      {isOperationAreaItem ? renderOperationAreaButtons() : renderGridAreaButtons()}
      
      {/* 渲染卡片内容，传递 isOperationAreaItem */}
      <GridItemContent item={item} isOperationAreaItem={isOperationAreaItem} />
      
      {/* 拖拽经过时的提示遮罩，仅在悬停时显示，且排除正在拖动的项目本身和自己的子模块 */}
      {isOver && !isDragging && !isDraggingOwnChild && (
        <div className="absolute inset-0 bg-blue-100/40 flex items-center justify-center text-blue-600 text-sm font-bold pointer-events-none rounded-lg z-10">
          松开以添加为子模块
        </div>
      )}
    </div>
  );
}


