"use client";

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  return (
    <>
      {/* 头部：标题与操作按钮同行，按钮靠右 */}
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-foreground leading-tight flex-1 truncate pr-2">{item.title}</h3>
        <div className="flex gap-[1px] opacity-60 group-hover:opacity-100 transition-opacity" style={{ transform: 'translateX(6px)' }}>
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
      </header>

      <p className="text-[13px] text-muted-foreground/80 leading-relaxed truncate" title={item.content}>{item.content}</p>
      {/* 子模块区域 */}
      <div
        className="mt-1 flex flex-col items-stretch min-h-[48px] border border-neutral-200 bg-white rounded-lg px-[3px] py-[3px] transition-colors"
      >
        {/* 操作区下的子模块渲染为可拖拽，否则保持原样 */}
        {item.children && item.children.length > 0 ? (
          <SortableContext
            items={item.children.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-[4px]">
              {item.children.map((child, index) => (
                <SortableChildItem key={child.id} child={child} parentId={item.id} index={index} />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 text-center">
            <span className="text-xs text-neutral-400">暂无子模块</span>
          </div>
        )}
      </div>
    </>
  );
}

