"use client";

import { useState, useMemo, useEffect } from 'react';
import { X, MoreHorizontal, GripVertical, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { GridItem } from './types';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { jsonToMarkdown } from '@/lib/markdown';

interface PromptPreviewPanelProps {
  item: GridItem;
  onClose: () => void;
}

interface Block {
  id: string;
  type: 'text' | 'reference';
  // Tiptap JSON 内容
  content?: string;
  // Markdown 内容（从 Tiptap JSON 转换而来）
  formattedContent?: string;
  order: number;
}

// 块内容渲染组件（可复用于列表项和拖拽预览）
function BlockContent({ block }: { block: Block }) {
  return (
    <>
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
      <div className="py-4 px-5 markdown-content">
        {block.formattedContent ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {block.formattedContent}
          </ReactMarkdown>
        ) : (
          <span className="text-gray-400 italic">暂无内容...</span>
        )}
      </div>
    </>
  );
}

// 缩略块色块组件 - 极简导航器
function ThumbnailBlockItem({ block, index }: { block: Block; index: number }) {
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
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex items-center gap-2 cursor-grab group ${
        isDragging ? 'opacity-40' : ''
      }`}
    >

      {/* 色块 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded transition-all ${
          block.type === 'text'
            ? 'bg-gray-200 hover:bg-gray-300'
            : 'bg-blue-200 hover:bg-blue-300'
        }`}
      />
      
      {/* 拖拽提示 */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2  ">
        <GripVertical className="h-3 w-3 text-gray-400" />
      </div>
    </div>
  );
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
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative border border-transparent hover:rounded-md hover:border-neutral-300/70 hover:bg-white/40 hover:backdrop-blur-[3px] hover:ring-1 hover:ring-[#422303]/10 group cursor-grab ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <BlockContent block={block} />
    </div>
  );
}

export function PromptPreviewPanel({ item, onClose }: PromptPreviewPanelProps) {

  // 获取文档内容 + 引用块文档内容
  const documentData = useQuery(
    api.prompt.queries.getDocumentWithBlocks,
    { documentId: item.documentId as Id<"documents"> }
  );

  /**
   * 转换为预览块结构
   * 递归处理引用块，展开所有引用文档的内容
   */
  const initialBlocks: Block[] = useMemo(() => {
    if (!documentData) return [];

    const resultBlocks: Block[] = [];
    let blockIdCounter = 0;

    /**
     * 递归处理块列表
     * @param blockList 块列表
     * @param isFromReference 是否来自引用文档（用于区分块类型）
     */
    function processBlocks(blockList: NonNullable<typeof documentData>['blocks'], isFromReference: boolean = false) {
      for (const block of blockList) {
        if (block.type === 'text') {
          // 将 Tiptap JSON 格式的内容转换为 Markdown
          // 容错处理：如果转换失败，使用原始内容（可能是纯文本或其他格式）
          let formattedContent = '';
          if (block.content) {
            try {
              formattedContent = jsonToMarkdown(block.content);
              // 如果转换结果为空，可能是无效的 JSON，保留原始内容用于显示
              if (!formattedContent && block.content.trim()) {
                formattedContent = block.content;
              }
            } catch (error) {
              // 转换失败时，使用原始内容
              console.warn('Failed to convert content to Markdown:', error);
              formattedContent = block.content;
            }
          }
          
          // 内容块：根据是否来自引用文档设置类型
          resultBlocks.push({
            id: `block-${blockIdCounter++}`,
            type: isFromReference ? 'reference' : 'text',
            content: block.content || '',
            formattedContent,
            order: resultBlocks.length,
          });
        } else if (block.type === 'reference' && block.referencedDocument) {
          // 引用块：递归处理，标记为来自引用
          const refDoc = block.referencedDocument;
          processBlocks(refDoc.blocks, true);
        }
      }
    }

    // 开始处理根文档的块
    processBlocks(documentData.blocks);

    return resultBlocks;
  }, [documentData]);

  // 使用状态管理块列表，以便支持拖拽排序
  const [blocks, setBlocks] = useState<Block[]>([]);
  
  // 跟踪正在拖拽的块 ID（用于缩略导航器）
  const [activeThumbnailId, setActiveThumbnailId] = useState<string | null>(null);
  
  // 跟踪正在拖拽的块 ID（用于主内容区）
  const [activeContentId, setActiveContentId] = useState<string | null>(null);

  // 当初始数据加载完成后，更新blocks状态
  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  // 处理缩略导航器拖拽开始事件
  const handleThumbnailDragStart = (event: DragStartEvent) => {
    setActiveThumbnailId(event.active.id as string);
  };

  // 处理缩略导航器拖拽结束事件
  const handleThumbnailDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 仅当拖拽到有效目标且位置发生变化时才执行
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        // 查找拖拽项和目标项的索引
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveThumbnailId(null);
  };

  // 处理主内容区拖拽开始事件
  const handleContentDragStart = (event: DragStartEvent) => {
    setActiveContentId(event.active.id as string);
  };

  // 处理主内容区拖拽结束事件
  const handleContentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    // 重置拖拽状态
    setActiveContentId(null);
  };

  // 获取正在拖拽的块
  const activeContentBlock = activeContentId ? blocks.find((block) => block.id === activeContentId) : null;

  // 加载状态
  const isLoading = documentData === undefined;
  
  // 获取文档标题和前后置信息
  const documentTitle = documentData?.document.title || item.title || '无标题';
  const promptPrefix = documentData?.document.promptPrefix;
  const promptSuffix = documentData?.document.promptSuffix;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-8">
      {/* modal主体 */}
      <div className="bg-white rounded-lg shadow-2xl w-[54rem] h-[84vh] flex flex-col overflow-hidden relative">
        {/* 简洁头部 */}
        <header className="relative flex items-center justify-between px-3 py-2 min-h-[48px]">
          <div className="flex items-center pl-3">
            {/* 标题 */}
            <h1 className="text-[20px] font-[550] text-gray-900 leading-tight">
              {documentTitle}
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
        
        {/* 左侧缩略导航器 - 浮动在左侧居中 */}
        {!isLoading && blocks.length > 1 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleThumbnailDragStart}
            onDragEnd={handleThumbnailDragEnd}
          >
            <aside className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-3">
              <SortableContext
                items={blocks.map((block) => block.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {blocks.map((block, index) => (
                    <ThumbnailBlockItem key={block.id} block={block} index={index} />
                  ))}
                </div>
              </SortableContext>
            </aside>
          </DndContext>
        )}
        
        {/* 内容区：按块显示 */}
        <main className="flex-1 overflow-auto px-24">
          {isLoading ? (
            // 加载状态
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">正在加载文档内容...</p>
              </div>
            </div>
          ) : (
            <article className="max-w-[40rem] mx-auto pt-8 pb-12 font-serif text-[16px] leading-[1.75] text-neutral-800 antialiased">
              {/* 文档前置信息 */}
              {promptPrefix && (
                <section className="text-sm text-neutral-600 mb-6 whitespace-pre-wrap">
                  {promptPrefix}
                </section>
              )}

              {/* 内容块列表 */}
              <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleContentDragStart}
                onDragEnd={handleContentDragEnd}
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
                
                {/* 内容区拖拽预览 */}
                {createPortal(
                  <DragOverlay dropAnimation={null}>
                    {activeContentBlock ? (
                      <div className="relative border border-neutral-300/70 rounded-md bg-white/95 backdrop-blur-[3px] shadow-2xl ring-1 ring-[#422303]/10 cursor-grabbing w-[40rem]">
                        <BlockContent block={activeContentBlock} />
                      </div>
                    ) : null}
                  </DragOverlay>,
                  document.body
                )}
              </DndContext>

              {/* 文档后置信息 */}
              {promptSuffix && (
                <section className="text-sm text-neutral-600 mt-6 whitespace-pre-wrap">
                  {promptSuffix}
                </section>
              )}

              {/* 空状态提示 */}
              {blocks.length === 0 && !promptPrefix && !promptSuffix && (
                <section className="py-20">
                  <div className="text-center text-gray-400">
                    <p className="text-base font-serif">暂无内容</p>
                  </div>
                </section>
              )}
            </article>
          )}
        </main>
      </div>
    </div>
  );
} 