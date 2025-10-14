"use client";

import { useDroppable } from '@dnd-kit/core';
import type { GridItem } from './types';
import { SortableChildItem } from './SortableChildItem';

interface OperationCardContentProps {
  item: GridItem;
  onDelete?: (id: string) => void;
  onSave?: (item: GridItem) => void;
}

/**
 * 操作区卡片内容组件
 * 
 * 职责：渲染操作区域中卡片的完整UI内容
 */
export function OperationCardContent({ item, onDelete, onSave }: OperationCardContentProps) {
  
  // 来自 ModuleCardContent 的逻辑 (isOperationAreaItem = true)
  const { setNodeRef: setChildAreaRef, isOver: isChildAreaOver } = useDroppable({
    id: `child-area-${item.id}`,
    data: {
      type: 'child-area',
      parentId: item.id
    }
  });
  const isOperationAreaItem = true;

  return (
    <>
      {/* 右上角操作按钮：与网格卡片一致，默认弱化，悬停/聚焦时增强，避免干扰主体内容 */}
      <div className="absolute top-2 right-1 flex gap-[4px] z-20 opacity-60 group-hover:opacity-100 transition-opacity">
        {onSave && (
          <button
            className="h-[26px] w-[26px] flex items-center justify-center rounded-[6px] text-[#807d78]/70 hover:text-[#807d78] bg-transparent hover:bg-[#422303]/8 transition-colors duration-150 cursor-pointer border border-transparent hover:border-[#422303]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#422303]/30 focus-visible:ring-offset-0"
            title="保存到网格列表"
            onClick={e => {
              e.stopPropagation();
              onSave(item);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            className="h-[26px] w-[26px] flex items-center justify-center rounded-[6px] text-[#807d78]/70 hover:text-[#807d78] bg-transparent hover:bg-[#422303]/8 transition-colors duration-150 cursor-pointer border border-transparent hover:border-[#422303]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#422303]/30 focus-visible:ring-offset-0"
            title="删除此模块"
            onClick={e => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* 卡片主体内容 */}
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <p className="text-sm">{item.content}</p>
      {/* 子模块区域 */}
      <div
        ref={setChildAreaRef}
        className={`mt-4 flex flex-col items-stretch justify-start min-h-[48px] border border-neutral-200 ${isChildAreaOver ? 'bg-neutral-50' : 'bg-white'} rounded-lg px-1 py-1 transition-colors`}
      >
        {/* 操作区下的子模块渲染为可拖拽，否则保持原样 */}
        {item.children && item.children.length > 0 ? (
          <div className="flex flex-col gap-[4px]">
            {item.children.map((child, index) => (
              isOperationAreaItem
                ? <SortableChildItem key={child.id} child={child} parentId={item.id} index={index} />
                : (
                  <div
                    key={child.id}
                    className="group flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-3 py-2.5 shadow-sm text-sm hover:shadow-md transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-neutral-800">{child.title}</div>
                      <div className="text-[13px] text-neutral-500 mt-0.5">{child.content}</div>
                    </div>
                    {/* 右上角预留操作按钮空间 */}
                    <div className="ml-2 h-6 w-6 flex items-center justify-center text-neutral-400 group-hover:text-neutral-600">
                      <span className="material-icons text-base">more_vert</span>
                    </div>
                  </div>
                )
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-10 text-[13px] text-neutral-400">拖拽子模块到此处</div>
        )}
      </div>
    </>
  );
}

