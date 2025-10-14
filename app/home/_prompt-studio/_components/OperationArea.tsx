"use client";

import { useDroppable } from '@dnd-kit/core';
import type { GridItem } from './types';
import { ModuleCardWrapper } from './ModuleCardWrapper';
import { OperationCardContent } from './OperationCardContent';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eraser } from 'lucide-react';

// 创建操作区组件，可以作为放置目标
export function OperationArea({ items, onClear, onDelete, onSave }: { items: GridItem[], onClear: () => void, onDelete: (id: string) => void, onSave: (item: GridItem) => void }) {
  // 使用useDroppable钩子使元素成为放置目标
  const { setNodeRef, isOver } = useDroppable({ id: 'operation-area' });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 p-6 rounded-lg border-2 ${isOver ? 'border-neutral-300 bg-[#422303]/5' : 'border-dashed border-gray-300'} transition-colors min-h-[200px] mb-8 relative group`}
    >
      {/* 将控件固定在右上角，并采用半透明容器，避免在内容上造成强烈视觉竞争 */}
      <div className="absolute right-4 top-4 z-10 opacity-50 group-hover:opacity-100 transition-opacity">
        {/* 使用轻量的工具栏样式，既可见又不喧宾夺主 */}
        <div className="flex items-center gap-1 rounded-md bg-white/40 backdrop-blur-sm border border-border/30 shadow-none px-1 py-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                    aria-label="清空操作区"
                    onClick={onClear}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>清空操作区</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">操作区</h2>
      {/* 临时颜色预览：仅保留 3 个候选方案 */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {/* 方案1：neutral-300 + /5 */}
        <div className="rounded-md border-2 border-neutral-300 bg-[#422303]/5 h-10 flex items-center justify-center text-xs text-[#422303]/70">neutral-300 + /5</div>
        {/* 方案2：neutral-200 + /4 */}
        <div className="rounded-md border-2 border-neutral-200 bg-[#422303]/4 h-10 flex items-center justify-center text-xs text-[#422303]/70">neutral-200 + /4</div>
        {/* 方案3：glass + subtle ring */}
        <div className="rounded-md border border-neutral-300/70 bg-white/40 backdrop-blur-[3px] ring-1 ring-[#422303]/10 h-10 flex items-center justify-center text-xs text-neutral-700/90">glass + subtle ring</div>
      </div>
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


