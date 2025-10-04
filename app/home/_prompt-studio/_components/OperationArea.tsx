"use client";

import { useDroppable } from '@dnd-kit/core';
import type { GridItem } from './types';
import { ModuleCardWrapper } from './ModuleCardWrapper';
import { OperationCardContent } from './OperationCardContent';

// 创建操作区组件，可以作为放置目标
export function OperationArea({ items, onClear, onDelete, onSave }: { items: GridItem[], onClear: () => void, onDelete: (id: string) => void, onSave: (item: GridItem) => void }) {
  // 使用useDroppable钩子使元素成为放置目标
  const { setNodeRef, isOver } = useDroppable({ id: 'operation-area' });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 p-6 rounded-lg border-2 ${isOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} transition-colors min-h-[200px] mb-8 relative`}
    >
      {/* 操作按钮区域，右上角 */}
      <div className="absolute right-4 top-4 flex gap-2">
        {/* 清空操作区按钮 */}
        <button
          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm border border-red-200 transition"
          onClick={onClear}
        >
          清空操作区
        </button>
      </div>
      <h2 className="text-xl font-bold mb-4">操作区</h2>
      <p className="text-gray-500 mb-4">{items.length > 0 ? '已添加的功能卡片:' : '将功能卡片拖放到此区域'}</p>
      {/* 可以拖动的提示词模块卡片 */}
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {items.map(item => (
            <ModuleCardWrapper
              key={item.id}
              item={item}
              isOperationAreaItem={true}
            >
              <OperationCardContent 
                item={item}
                onDelete={onDelete}
                onSave={onSave}
              />
            </ModuleCardWrapper>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[100px] text-gray-400">
          <p>空操作区 - 拖放卡片到这里</p>
        </div>
      )}
    </div>
  );
}


