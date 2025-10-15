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
      className={`p-[8px] pb-[20px] rounded-lg border-2 ${isOver ? 'border-dashed border-gray-300' : 'border-gray-200/70'} transition-colors min-h-[200px] mb-4 relative group max-w-[47rem] w-full mx-auto`}
    >
      <header className="flex justify-end pt-[2px] pr-[4px] items-center opacity-50 group-hover:opacity-100 transition-opacity">
        {/* 使用轻量的工具栏样式，既可见又不喧宾夺主 */}
        <div className="flex items-center gap-1 rounded-md bg-white/40 backdrop-blur-sm border border-border/30 shadow-none px-1 py-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
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
      </header>
      {/* 可以拖动的提示词模块卡片：使用网格保证每行卡片数量一致并自动撑满 */}
      <article className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-[4px] ">
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
      </article>
    </div>
  );
}


