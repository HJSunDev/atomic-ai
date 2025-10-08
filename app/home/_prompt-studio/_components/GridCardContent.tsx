"use client";

import type { GridItem } from './types';
import { usePromptStore, PromptModule } from '@/store/home/promptStore';
import { SummaryBadge } from './SummaryBadge';
import { File } from 'lucide-react';

interface GridCardContentProps {
  item: GridItem;
  onDelete?: (id: string) => void;
  onPreview?: () => void;
}

/**
 * 网格区卡片内容组件
 * 
 * 职责：渲染网格区域中卡片的完整UI内容
 */
export function GridCardContent({ item, onDelete, onPreview }: GridCardContentProps) {
  const setSelectedPrompt = usePromptStore(state => state.setSelectedPrompt);

  const handleUsePrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPrompt(item as unknown as PromptModule);
  };

  return (
    <>
      {/* 左上角删除按钮 (hover显示) */}
      {onDelete && (
        <div className="absolute -top-3 -left-3 opacity-0 group-hover:opacity-100 z-20 transition-opacity duration-200">
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

      {/* 右上角按钮区域：默认弱化，悬停或聚焦时增强可用性，避免喧宾夺主 */}
      <div className="absolute top-1 right-1 flex gap-[4px] z-20 opacity-60 group-hover:opacity-100 transition-opacity">
        <button
          className="h-[26px] w-[26px] flex items-center justify-center rounded-[6px] text-[#807d78]/70 hover:text-[#807d78] bg-transparent hover:bg-[#422303]/8 transition-colors duration-150 cursor-pointer border border-transparent hover:border-[#422303]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#422303]/30 focus-visible:ring-offset-0"
          title="预览完整提示词"
          aria-label="预览完整提示词"
          onClick={(e) => {
            e.stopPropagation();
            onPreview?.();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>

        <button
          className="h-[26px] w-[26px] flex items-center justify-center rounded-[6px] text-[#807d78]/70 hover:text-[#807d78] bg-transparent hover:bg-[#422303]/8 transition-colors duration-150 cursor-pointer border border-transparent hover:border-[#422303]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#422303]/30 focus-visible:ring-offset-0"
          title="引用此提示词模块"
          aria-label="引用此提示词模块"
          onClick={handleUsePrompt}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>
      </div>

      {/* 卡片主体内容 */}
      <div className="flex flex-col flex-grow text-[#807d78] text-[12px] whitespace-nowrap ">
        <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
        <span className="truncate mt-[6px]">{item.title}</span>
      </div>

      {/* 摘要徽章 */}
      <SummaryBadge item={item} />
    </>
  );
}

