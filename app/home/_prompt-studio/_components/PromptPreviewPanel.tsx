"use client";

import { useState } from 'react';
import { X, MoreHorizontal, GripVertical } from 'lucide-react';
import type { GridItem } from './types';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PromptPreviewPanelProps {
  item: GridItem;
  onClose: () => void;
}

interface Block {
  id: string;
  type: 'text' | 'reference';
  content?: string;
  referenceTitle?: string;
  referenceContent?: string;
  order: number;
}

// 可排序的块组件
function SortableBlockItem({ block }: { block: Block }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    zIndex: isDragging ? 100 : 'auto',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative border border-transparent hover:rounded-md hover:border-neutral-300/70 hover:bg-white/40 hover:backdrop-blur-[3px] hover:ring-1 hover:ring-[#422303]/10 group ${
        isDragging ? 'cursor-grabbing opacity-70 shadow-2xl' : 'cursor-grab'
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-[3px] transition-opacity duration-150 group-hover:opacity-0 ${
          block.type === 'text'
            ? 'bg-[#e5e7eb]'
            : 'bg-[repeating-linear-gradient(to_bottom,_#e5e7eb_0_6px,_transparent_6px_12px)]'
        }`}
      />
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 p-1 rounded transition-opacity pointer-events-none">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="py-4 px-5">
        {block.type === 'text' ? (
          block.content || <span className="text-gray-400 italic">暂无内容...</span>
        ) : (
          block.referenceContent
        )}
      </div>
    </div>
  );
}

export function PromptPreviewPanel({ item, onClose }: PromptPreviewPanelProps) {
  // 将模块结构转换为块结构（临时方案）
  // TODO: 后续需要调用 getDocumentWithBlocks 查询获取真实的块内容
  const initialBlocks: Block[] = [
    {
      id: 'main-block',
      type: 'text',
      // 临时使用 description 作为预览内容
      content: item.description || '暂无描述信息',
      order: 0
    },
    ...item.children.map((child, index) => ({
      id: `ref-${child.virtualId}`,
      type: 'reference' as const,
      referenceTitle: child.title,
      // 临时使用 description 作为预览内容
      referenceContent: child.description || '暂无描述信息',
      order: index + 1
    }))
  ];

  // 使用状态管理块列表，以便支持排序
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 仅当拖拽到有效目标且位置发生变化时才执行
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        // 查找拖拽项和目标项的索引
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        // 返回重新排序后的数组
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-8">
      <div className="bg-white rounded-lg shadow-2xl w-[54rem] h-[84vh] flex flex-col overflow-hidden">
        {/* Notion 风格的简洁头部 */}
        <header className="relative flex items-center justify-between px-3 py-2 min-h-[48px]">
          <div className="flex items-center pl-3">
            {/* 标题 */}
            <h1 className="text-[20px] font-[550] text-gray-900 leading-tight">
              {item.title || '无标题'}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            {/* 更多操作按钮 */}
            <button
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 focus:outline-none focus:bg-gray-100 cursor-pointer"
              aria-label="更多操作"
              title="更多操作"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {/* 关闭按钮 */}
            <button
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 focus:outline-none focus:bg-gray-100 cursor-pointer"
              onClick={onClose}
              aria-label="关闭"
              title="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>
        
        {/* 内容区：按块显示 */}
        <main className="flex-1 overflow-auto px-24">
          <article className="max-w-[40rem] mx-auto pt-8 pb-12 font-serif text-[16px] leading-[1.75] text-neutral-800 antialiased">
            {/* 前置信息 */}
            <section className="text-sm text-neutral-600 mb-6">
              你是一个专业的AI助手，请根据以下要求回答用户的问题。始终保持礼貌、专业和有帮助的态度。回答应该准确、简洁且易于理解。
            </section>

            {/* 内容块列表 */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((block) => block.id)}
                // 使用垂直列表排序策略
                strategy={verticalListSortingStrategy}
              >
                <section className="space-y-1">
                  {blocks.map((block) => (
                    <SortableBlockItem key={block.id} block={block} />
                  ))}
                </section>
              </SortableContext>
            </DndContext>

            {/* 后置信息 */}
            <section className="text-sm text-neutral-600 mt-6">
              请用中文回答。如果用户的问题比较复杂，请提供详细的解释。如果用户要求提供代码示例，请确保代码正确、可运行。
            </section>

            {/* 空状态提示 */}
            {blocks.length === 0 && (
              <section className="py-20">
                <div className="text-center text-gray-400">
                  <p className="text-base font-serif">暂无内容</p>
                </div>
              </section>
            )}
          </article>
        </main>
      </div>
    </div>
  );
} 