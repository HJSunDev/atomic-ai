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
      {/* 右上角操作按钮 */}
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

      {/* 卡片主体内容 */}
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <p className="text-sm">{item.content}</p>
      {/* 子模块区域 */}
      <div
        ref={setChildAreaRef}
        className={`mt-4 flex flex-col items-stretch justify-start min-h-[48px] border-2 border-dashed ${isChildAreaOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded px-2 py-2`}
      >
        {/* 操作区下的子模块渲染为可拖拽，否则保持原样 */}
        {item.children && item.children.length > 0 ? (
          <div className="flex flex-col gap-2">
            {item.children.map((child, index) => (
              isOperationAreaItem
                ? <SortableChildItem key={child.id} child={child} parentId={item.id} index={index} />
                : (
                  <div
                    key={child.id}
                    className="relative flex items-center justify-between bg-white border border-gray-200 rounded pl-4 pr-2 py-2 shadow-sm text-sm"
                  >
                    {/* 左侧竖线，突出层级关系 */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-200 rounded-l" style={{height: '100%'}}></div>
                    <div>
                      <span className="font-medium text-gray-700">{child.title}</span>
                      <span className="ml-2 text-gray-400">{child.content}</span>
                    </div>
                    {/* 右上角预留操作按钮空间 */}
                    <div className="ml-2 h-6 flex items-center justify-center opacity-30 bg-red-100">
                      <span className="material-icons text-base">more_vert</span>
                    </div>
                  </div>
                )
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-10 text-gray-300 text-xs">暂无子模块</div>
        )}
      </div>
    </>
  );
}

