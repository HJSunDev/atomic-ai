"use client";

import { useDroppable } from '@dnd-kit/core';
import type { GridItem } from './types';
import { SortableChildItem } from './SortableChildItem';


export function ModuleCardContent({ item, isOperationAreaItem = false }: { item: GridItem, isOperationAreaItem?: boolean }) {
  // 创建子模块区域的 droppable 区域
  // 仅在操作区的模块中启用子模块排序功能
  let setChildAreaRef: ((node: HTMLElement | null) => void) | undefined = undefined;
  let isChildAreaOver = false;

  if (isOperationAreaItem) {
    const { setNodeRef, isOver } = useDroppable({
      id: `child-area-${item.id}`,
      data: {
        type: 'child-area',
        parentId: item.id
      }
    });
    setChildAreaRef = setNodeRef;
    isChildAreaOver = isOver;
  }

  return (
    <>
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <p className="text-sm">{item.content}</p>
      {/* 子模块区域 */}
      <div
        ref={setChildAreaRef}
        className={`mt-4 flex flex-col items-stretch justify-start min-h-[48px] border-2 border-dashed ${isChildAreaOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'} rounded px-2 py-2`}
      >
        {/* 操作区下的子模块渲染为可拖拽，否则保持原样 */}
        {item.children && item.children.length > 0 ? (
          <div className="flex flex-col gap-2">
            {item.children.map((child, index) => (
              isOperationAreaItem
                ? <SortableChildItem key={child.id} child={child} parentId={item.id} index={index} />
                : (
                  <div
                    key={child.id}
                    className="relative flex items-center justify-between bg-white border border-gray-200 rounded pl-4 pr-2 py-2 shadow-sm text-sm"
                  >
                    {/* 左侧竖线，突出层级关系 */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-200 rounded-l" style={{height: '100%'}}></div>
                    <div>
                      <span className="font-medium text-gray-700">{child.title}</span>
                      <span className="ml-2 text-gray-400">{child.content}</span>
                    </div>
                    {/* 右上角预留操作按钮空间 */}
                    <div className="ml-2 h-6 flex items-center justify-center opacity-30 bg-red-100">
                      <span className="material-icons text-base">more_vert</span>
                    </div>
                  </div>
                )
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-10 text-gray-300 text-xs">暂无子模块</div>
        )}
      </div>
    </>
  );
}


