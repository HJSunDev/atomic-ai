"use client";

import type { GridItem } from './types';
import { ModuleCardContent } from './ModuleCardContent';

interface OperationCardContentProps {
  item: GridItem;
  onDelete?: (id: string) => void;
  onSave?: (item: GridItem) => void;
}

/**
 * 操作区卡片内容组件
 * 
 * 职责：渲染操作区域中卡片的UI内容，包括按钮和主体内容
 */
export function OperationCardContent({ item, onDelete, onSave }: OperationCardContentProps) {
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
      <ModuleCardContent item={item} isOperationAreaItem={true} />
    </>
  );
}

