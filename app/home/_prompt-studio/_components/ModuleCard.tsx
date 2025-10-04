"use client";

import type { GridItem } from './types';
import { ModuleCardWrapper } from './ModuleCardWrapper';
import { GridCardContent } from './GridCardContent';
import { OperationCardContent } from './OperationCardContent';

/**
 * 模块卡片组件（向后兼容的包装器）
 *
 * 该组件通过组合 ModuleCardWrapper（负责拖拽行为）和不同的内容组件
 * （GridCardContent/OperationCardContent）来实现功能。
 * 
 * 职责：作为一个便捷的包装器，提供向后兼容的接口
 *
 * @param item - 当前渲染的网格项数据
 * @param isOperationAreaItem - 是否为操作区的卡片，决定渲染哪种内容组件
 */
export function ModuleCard({ 
  item, 
  isOperationAreaItem = false, 
  onDelete, 
  onSave,
  onClick,
  onPreview
}: { 
  item: GridItem, 
  isOperationAreaItem?: boolean, 
  onDelete?: (id: string) => void, 
  onSave?: (item: GridItem) => void,
  onClick?: () => void,
  onPreview?: () => void
}) {
  return (
    <ModuleCardWrapper 
      item={item} 
      isOperationAreaItem={isOperationAreaItem}
      onClick={onClick}
    >
      {isOperationAreaItem ? (
        <OperationCardContent 
          item={item} 
          onDelete={onDelete} 
          onSave={onSave}
        />
      ) : (
        <GridCardContent 
          item={item} 
          onDelete={onDelete} 
          onPreview={onPreview}
        />
      )}
    </ModuleCardWrapper>
  );
}


