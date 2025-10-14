"use client";

import { X, MoreHorizontal, GripVertical } from 'lucide-react';
import type { GridItem } from './types';

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

export function PromptPreviewPanel({ item, onClose }: PromptPreviewPanelProps) {
  // 将旧的模块结构转换为新的块结构（过渡方案）
  // 主模块的 content 作为第一个文本块，子模块作为引用块
  const blocks: Block[] = [
    {
      id: 'main-block',
      type: 'text',
      content: item.content,
      order: 0
    },
    ...item.children.map((child, index) => ({
      id: `ref-${child.id}`,
      type: 'reference' as const,
      referenceTitle: child.title,
      referenceContent: child.content,
      order: index + 1
    }))
  ];

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
            <section className="space-y-1">
              {blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`relative transition-all duration-200 border border-transparent hover:rounded-md hover:border-neutral-300/70 hover:bg-white/40 hover:backdrop-blur-[3px] hover:ring-1 hover:ring-[#422303]/10 group cursor-grab active:cursor-grabbing`}
                >
                  <div
                    className={`absolute left-0 top-0 h-full w-[3px] transition-opacity duration-150 group-hover:opacity-0 ${
                      block.type === 'text'
                        ? 'bg-[#e5e7eb]'
                        : 'bg-[repeating-linear-gradient(to_bottom,_#e5e7eb_0_6px,_transparent_6px_12px)]'
                    }`}
                  />
                  <button
                    className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded cursor-grab active:cursor-grabbing transition-colors"
                    aria-label="拖拽排序"
                    title="拖拽排序"
                    type="button"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <div className="py-4 px-5">
                    {block.type === 'text' ? (
                      block.content || <span className="text-gray-400 italic">开始写作...</span>
                    ) : (
                      block.referenceContent
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* 后置信息 */}
            <section className="text-sm text-neutral-600 mt-6">
              请用中文回答。如果用户的问题比较复杂，请提供详细的解释。如果用户要求提供代码示例，请确保代码正确、可运行。
            </section>

            {/* 空状态提示 */}
            {blocks.length === 0 && (
              <section className="py-20">
                <div className="text-center text-gray-400">
                  <p className="text-base font-serif">开始写作...</p>
                </div>
              </section>
            )}
          </article>
        </main>
      </div>
    </div>
  );
} 