"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
// 拖拽排序核心功能导入
import {
  // 拖拽上下文容器，提供拖拽功能的核心环境
  DndContext,
  // 拖拽过程中显示的覆盖层组件
  DragOverlay,
  // 使元素可拖拽的React Hook
  useDraggable,
  // 使元素可作为放置目标的React Hook
  useDroppable,
  // 创建传感器实例的Hook
  useSensor,
  // 创建传感器集合的Hook
  useSensors,
  // 指针设备(鼠标/触摸)传感器
  PointerSensor,
  // 计算最近中心点的碰撞检测策略
  closestCenter,
  // 使用指针位置检测策略
  pointerWithin,
  // 拖拽开始事件类型
  type DragStartEvent,
  // 拖拽结束事件类型
  type DragEndEvent,
  // 拖拽经过事件类型
  type DragOverEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
// 引入 uuid 用于生成唯一 id
import { v4 as uuidv4 } from 'uuid';
// 导入PromptDetailPanel组件
import { PromptDetailPanel } from './PromptDetailPanel';
// 导入promptStore
import { usePromptStore, PromptModule } from '@/store/home/promptStore';
// 导入预览面板组件
import { PromptPreviewPanel } from './PromptPreviewPanel';

// 定义网格项的数据类型，支持最多两级结构
interface GridItem {
  id: string;
  title: string;
  content: string;
  color: string;
  children: GridItem[];
}

// 可拖拽的子模块组件（仅用于操作区）
function DraggableChildItem({ child, parentId, index }: { child: GridItem, parentId: string, index: number }) {
  // 生成唯一id，格式为 child-父id-子id
  const dragId = `child-${parentId}-${child.id}`;
  // 使子模块可拖拽
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: { type: 'child', parentId, child, index },
  });
  
  // 创建可放置区域，用于子模块间排序
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `child-drop-${parentId}-${child.id}`,
    data: {
      type: 'child-drop',
      parentId,
      childId: child.id,
      index
    }
  });
  
  // 拖拽样式
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    transition: isDragging ? 'none' : 'transform 0.2s',
  };
  
  // 组合 ref
  const composedRef = (node: any) => {
    setNodeRef(node);
    setDropRef(node);
  };
  
  return (
    <div
      ref={composedRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`relative flex items-center justify-between bg-white border border-gray-200 rounded pl-4 pr-2 py-2 shadow-sm text-sm cursor-grab hover:shadow-md transition ${isOver && !isDragging ? 'ring-2 ring-blue-400' : ''}`}
    >
      {/* 拖拽悬停时的指示器 */}
      {isOver && !isDragging && (
        <div className="absolute inset-x-0 -top-3 h-1.5 bg-blue-500 rounded-full z-10"></div>
      )}
      {/* 左侧竖线，突出层级关系 */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-200 rounded-l" style={{height: '100%'}}></div>
      <div>
        <span className="font-medium text-gray-700">{child.title}</span>
        <span className="ml-2 text-gray-400">{child.content}</span>
      </div>
      {/* 右侧操作按钮区域 */}
      <div className="ml-2 flex items-center">
        {/* 提升为顶层模块按钮 */}
        <button
          className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
          onClick={(e) => {
            // 阻止事件冒泡，避免触发拖拽
            e.stopPropagation();
            // 将该事件暴露到 NewBlock 组件
            window.dispatchEvent(new CustomEvent('promote-to-top', { 
              detail: { parentId, childId: child.id }
            }));
          }}
          title="提升为顶层模块"
        >
          {/* 使用 arrow-up-right 图标 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * 可拖拽的网格卡片组件
 *
 * 该组件既可以作为拖拽源（可被拖动），也可以作为放置目标（可被拖拽的卡片放入，成为子模块）。
 * 通过 isOperationAreaItem 控制是否启用 droppable 能力（仅操作区的卡片需要）。
 *
 * @param item - 当前渲染的网格项数据
 * @param isOperationAreaItem - 是否为操作区的卡片，决定是否可作为放置目标
 */
function DraggableGridItem({ 
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
  // 从store获取设置提示词的方法
  const setSelectedPrompt = usePromptStore(state => state.setSelectedPrompt);

  // 1. 使当前卡片可拖拽，获取拖拽相关属性和方法
  //    isDragging 表示当前是否正在拖拽
  const { attributes, listeners, setNodeRef: setDragNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  // 2. 仅操作区的卡片才需要 droppable 能力（可作为子模块放置目标）
  //    setDropNodeRef 用于设置 droppable 区域的 ref
  //    isOver 表示当前是否有拖拽项悬停在该卡片上
  let setDropNodeRef: ((node: HTMLElement | null) => void) | undefined = undefined;
  let isOver = false;
  let activeDragInfo: any = undefined;
  
  if (isOperationAreaItem) {
    // 使该卡片成为 droppable 区域，id 唯一标识
    const drop = useDroppable({ id: `operation-item-${item.id}` });
    setDropNodeRef = drop.setNodeRef;
    isOver = drop.isOver;
    // 获取当前拖拽的元素信息
    activeDragInfo = drop.active?.data?.current;
  }

  // 检查当前拖拽的是否为该卡片自己的子模块
  const isDraggingOwnChild = activeDragInfo && 
    activeDragInfo.type === 'child' && 
    activeDragInfo.parentId === item.id;

  // 3. 计算拖拽过程中的样式
  //    - 拖拽时应用 transform
  //    - 被悬停时高亮边框，且排除正在拖动的项目本身和自己的子模块
  const style = {
    transform: CSS.Translate.toString(transform),
    boxShadow: isOver && !isDragging && !isDraggingOwnChild ? '0 0 0 3px #3b82f6' : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  // 4. 组合 ref：既要支持拖拽（draggable），又要支持放置（droppable）
  //    需要将 setDragNodeRef 和 setDropNodeRef 同时作用于同一个 DOM 节点
  function composedRef(node: any) {
    setDragNodeRef(node);
    if (setDropNodeRef) setDropNodeRef(node);
  }

  // 处理引用按钮点击事件
  const handleUsePrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 将当前模块设置为全局选中的提示词
    setSelectedPrompt(item as unknown as PromptModule);
  };

  return (
    <div
      ref={composedRef}
      style={style}
      {...listeners} // 绑定拖拽事件监听器
      {...attributes} // 绑定拖拽相关属性
      className={`${item.color} p-4 rounded-lg shadow cursor-pointer transition-shadow hover:shadow-lg flex flex-col relative group ${isOver && !isDragging && !isDraggingOwnChild ? 'ring-2 ring-blue-400' : ''}`}
      onClick={(e) => {
        // 如果点击的是按钮，不触发卡片点击事件
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onClick?.();
      }}
    >
      {/* 预览按钮 - 固定显示在右上角 */}
      {!isOperationAreaItem && (
        <button
          className="absolute top-2 right-[80px] h-7 w-7 flex items-center justify-center text-gray-400 hover:text-teal-500 hover:bg-teal-100 rounded-full transition-colors cursor-pointer z-20"
          title="预览完整提示词"
          onClick={(e) => {
            e.stopPropagation();
            onPreview?.();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      )}

      {/* 右上角操作按钮区域 */}
      {isOperationAreaItem ? (
        <div className="absolute top-2 right-2 flex gap-2 z-20">
          {/* 保存按钮 */}
          {onSave && (
            <button
              className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-100 rounded-full transition-colors cursor-pointer"
              title="保存到网格列表"
              onClick={e => {
                e.stopPropagation();
                onSave(item);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            </button>
          )}
          {/* 删除按钮 */}
          {onDelete && (
            <button
              className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
              title="删除此模块"
              onClick={e => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      ) : (
        // 网格列表区的按钮区域，仅在hover状态显示
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
          {/* 引用按钮 */}
          <button
            className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-100 rounded-full transition-colors cursor-pointer"
            title="引用此提示词模块"
            onClick={handleUsePrompt}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
          {/* 删除按钮 */}
          {onDelete && (
            <button
              className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
              title="从列表中删除"
              onClick={e => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      )}
      {/* 渲染卡片内容，传递 isOperationAreaItem */}
      <GridItemContent item={item} isOperationAreaItem={isOperationAreaItem} />
      {/* 拖拽经过时的提示遮罩，仅在悬停时显示，且排除正在拖动的项目本身和自己的子模块 */}
      {isOver && !isDragging && !isDraggingOwnChild && (
        <div className="absolute inset-0 bg-blue-100/40 flex items-center justify-center text-blue-600 text-sm font-bold pointer-events-none rounded-lg z-10">
          松开以添加为子模块
        </div>
      )}
    </div>
  );
}

/**
 * 拖拽时的覆盖层，仅显示卡片标题和内容，固定尺寸，避免遮挡目标卡片
 */
function DragOverlayItem({ item }: { item: GridItem | null }) {
  if (!item) return null;
  return (
    <div
      className={`${item.color} rounded-lg shadow-xl border-2 border-blue-500 cursor-grabbing flex flex-col items-start justify-center px-5 py-3 select-none`}
      style={{ minHeight: '72px', maxHeight: '96px', opacity: 0.97 }}
    >
      {/* 只显示标题和内容，内容超出省略 */}
      <div className="text-base font-bold mb-1 truncate w-full" title={item.title}>{item.title}</div>
      <div className="text-xs text-gray-700 opacity-80 truncate w-full" title={item.content}>{item.content}</div>
    </div>
  );
}

// 创建操作区组件，可以作为放置目标
function OperationArea({ items, onClear, onDelete, onSave }: { items: GridItem[], onClear: () => void, onDelete: (id: string) => void, onSave: (item: GridItem) => void }) {
  // 使用useDroppable钩子使元素成为放置目标
  const { setNodeRef, isOver } = useDroppable({
    id: 'operation-area',
  });

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
            <DraggableGridItem key={item.id} item={item} isOperationAreaItem={true} onDelete={onDelete} onSave={onSave} />
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

// 插入子模块的辅助函数（仅支持两级结构）
function insertChildModule(
  items: GridItem[],
  parentId: string,
  child: GridItem
): GridItem[] {
  // 只在顶层查找目标父模块
  return items.map(item => {
    if (item.id === parentId) {
      // 找到目标父模块，插入子模块到children末尾
      return {
        ...item,
        children: [...item.children, child],
      };
    } else {
      // 其他模块保持不变
      return item;
    }
  });
}

// 在同一父模块内重新排序子模块的辅助函数
function reorderChildModules(
  items: GridItem[],
  parentId: string,
  childId: string,
  newIndex: number
): GridItem[] {
  return items.map(item => {
    if (item.id === parentId) {
      // 找到目标父模块
      const currentChildren = [...item.children];
      // 找到要移动的子模块
      const childIndex = currentChildren.findIndex(child => child.id === childId);
      
      if (childIndex !== -1) {
        // 删除原位置的子模块
        const [movedChild] = currentChildren.splice(childIndex, 1);
        // 插入到新位置
        currentChildren.splice(newIndex, 0, movedChild);
        
        // 返回更新后的父模块
        return {
          ...item,
          children: currentChildren,
        };
      }
    }
    return item;
  });
}

function GridItemContent({ item, isOperationAreaItem = false, parentId }: { item: GridItem, isOperationAreaItem?: boolean, parentId?: string }) {
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
                ? <DraggableChildItem key={child.id} child={child} parentId={item.id} index={index} />
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

export function NewBlock() {
  // 添加客户端渲染状态
  const [isMounted, setIsMounted] = useState(false);
  
  // 模拟数据 - 网格项列表，支持两级结构
  const [items, setItems] = useState<GridItem[]>([
    {
      id: '1',
      title: '文本生成',
      content: '生成各种类型的创意文本',
      color: 'bg-blue-100',
      children: [
        {
          id: '1-1',
          title: '短文本生成',
          content: '快速生成短句',
          color: 'bg-blue-50',
          children: [], 
        },
        {
          id: '1-2',
          title: '长文本生成',
          content: '生成长篇文章',
          color: 'bg-blue-50',
          children: [],
        },
      ],
    },
    {
      id: '2',
      title: '图像描述',
      content: '从图像中提取文本描述',
      color: 'bg-green-100',
      children: [],
    },
    {
      id: '3',
      title: '代码助手',
      content: '帮助编写和调试代码',
      color: 'bg-yellow-100',
      children: [], 
    },
    {
      id: '4',
      title: '翻译工具',
      content: '在不同语言之间进行翻译',
      color: 'bg-purple-100',
      children: [],
    },
    {
      id: '5',
      title: '摘要生成',
      content: '从长文本中提取关键信息',
      color: 'bg-pink-100',
      children: [],
    },
    {
      id: '6',
      title: '问答系统',
      content: '回答用户提出的各种问题',
      color: 'bg-orange-100',
      children: [],
    },
  ]);

  // 存储操作区中的项目
  const [operationItems, setOperationItems] = useState<GridItem[]>([]);

  // 当前被拖拽的项目状态
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // 获取当前被拖拽的项目数据
  // 由于操作区和网格区 id 可能不同，需分别查找
  const activeItem = activeId
    ? items.find(item => item.id === activeId) || operationItems.find(item => item.id === activeId) || null
    : null;
  
  // 跟踪鼠标是否真正进入了操作区
  const [enteredOperationArea, setEnteredOperationArea] = useState(false);
  
  // 记录当前正在拖动的网格区模块ID（无拖动时为null）
  const [gridDraggingId, setGridDraggingId] = useState<string | null>(null);
  
  // 控制操作区显示/隐藏
  const [showOperationArea, setShowOperationArea] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 控制详情面板显示状态
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  // 当前选中的模块
  const [selectedItem, setSelectedItem] = useState<GridItem | null>(null);
  
  // 控制预览面板显示状态
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  // 当前预览的模块
  const [previewItem, setPreviewItem] = useState<GridItem | null>(null);

  // 获取当前选择的提示词模块
  const selectedPrompt = usePromptStore(state => state.selectedPrompt);
  const clearSelectedPrompt = usePromptStore(state => state.clearSelectedPrompt);

  // 在客户端加载后再渲染组件
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 监听 gridDraggingId 和 operationItems 控制操作区显示/隐藏
  useEffect(() => {
    // 只要有拖拽或有内容就显示
    if (gridDraggingId || operationItems.length > 0) {
      setShowOperationArea(true);
      // 有内容或拖拽时清除隐藏定时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    } else {
      // 没有内容且没有拖拽，延迟隐藏
      hideTimerRef.current = setTimeout(() => {
        setShowOperationArea(false);
      }, 800); // 800ms后隐藏
    }
    // 组件卸载时清理定时器
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [gridDraggingId, operationItems.length]);

  // 处理操作区模块-子模块提升到顶层
  const handlePromoteToTop = useCallback((event: Event) => {
    const { parentId, childId } = (event as CustomEvent).detail;
    
    // 使用函数式更新，确保总是基于最新的状态
    setOperationItems(prevItems => {
      // 查找要提升的子模块和其父模块
      const parentModule = prevItems.find(item => item.id === parentId);
      if (!parentModule) return prevItems; // 未找到则返回原状态
      
      const childModule = parentModule.children.find(child => child.id === childId);
      if (!childModule) return prevItems; // 未找到则返回原状态
      
      // 从父模块中移除子模块
      const updatedItems = prevItems.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: item.children.filter(child => child.id !== childId)
          };
        }
        return item;
      });
      
      // 为子模块创建一个新的顶层模块
      const newTopModule: GridItem = {
        ...childModule,
        id: uuidv4() // 生成新ID避免冲突
      };
      
      // 将新的顶层模块添加到操作区
      return [...updatedItems, newTopModule];
    });
  }, []); // 空依赖数组，确保函数只创建一次

  // 仅在组件挂载和卸载时设置/清除事件监听
  useEffect(() => {
    // 注册自定义事件监听
    window.addEventListener('promote-to-top', handlePromoteToTop);
    
    // 清理函数
    return () => {
      window.removeEventListener('promote-to-top', handlePromoteToTop);
    };
  }, []); // 空依赖数组，确保效果只运行一次

  // 配置拖拽传感器
  // 使用useSensors组合多个传感器配置
  const sensors = useSensors(
    // 使用指针传感器(支持鼠标/触摸屏操作)
    useSensor(PointerSensor, {
      // 激活约束配置，防止误触
      activationConstraint: {
        // 设置最小拖动距离为8像素，只有移动超过这个距离才会触发拖拽
        // 这样可以避免点击时意外触发拖拽操作
        distance: 8,
      },
    })
    // 可以在这里添加更多传感器类型，如:
    // useSensor(KeyboardSensor, {...})
    // 用于支持键盘操作的拖拽
  );
  
  // 处理拖拽开始事件
  const handleDragStart = (event: DragStartEvent) => {
    // 设置当前被拖拽项的ID
    setActiveId(event.active.id as string);
    // 重置操作区进入状态
    setEnteredOperationArea(false);

    // 判断是否为网格区模块
    const isGridItem = items.some(item => item.id === event.active.id);
    if (isGridItem) {
      setGridDraggingId(event.active.id as string);
    }
  };
  
  // 拖拽结束/取消时重置
  const resetGridDragging = () => setGridDraggingId(null);

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    // over 表示拖拽释放时鼠标悬停的目标区域信息（可能为 null，表示未悬停在任何 droppable 区域）
    // active 表示当前被拖拽的元素信息（即拖拽源）
    const { over, active } = event;
    
    // 处理子模块排序
    if (active.id.toString().startsWith('child-') && over && over.id.toString().startsWith('child-drop-')) {
      const activeData = active.data.current as { type: string; parentId: string; child: GridItem; index: number };
      const overData = over.data.current as { type: string; parentId: string; childId: string; index: number };
      
      // 确保是同一个父模块内的排序
      if (activeData.parentId === overData.parentId && activeData.child.id !== overData.childId) {
        setOperationItems(prevItems => 
          reorderChildModules(prevItems, overData.parentId, activeData.child.id, overData.index)
        );
      }
    }
    // 如果拖拽释放目标为操作区的模块，则将模块插入到目标模块的children中
    else if (over && typeof over.id === 'string' && over.id.startsWith('operation-item-')) {
      // 获取目标模块id
      const targetId = over.id.replace('operation-item-', '');
      // 判断拖拽源是网格区还是操作区
      const draggedFromGrid = items.find(item => item.id === active.id);
      const draggedFromOperation = operationItems.find(item => item.id === active.id);
      if (draggedFromGrid) {
        // 拖拽源来自网格区：生成副本，id用uuid，插入到目标模块children
        const copy = { ...draggedFromGrid, id: uuidv4() };
        setOperationItems(prevItems => insertChildModule(prevItems, targetId, copy));
      } else if (draggedFromOperation && draggedFromOperation.id !== targetId) {
        // 拖拽源来自操作区，且不是自己拖到自己：先移除，再插入
        let newItems = operationItems.filter(item => item.id !== draggedFromOperation.id);
        newItems = insertChildModule(newItems, targetId, draggedFromOperation);
        setOperationItems(newItems);
      }
    } else if (enteredOperationArea) {
      // 原有逻辑：从网格区拖拽副本到操作区
      const draggedItem = items.find(item => item.id === active.id);
      // 如果找到被拖拽的项目
      if (draggedItem) {
        // 生成副本，id 用 uuid 保证唯一
        const copy = { ...draggedItem, id: uuidv4() };
        // 将副本添加到操作区
        setOperationItems(prevItems => [...prevItems, copy]);
      }
    }
    // 清除当前被拖拽项
    setActiveId(null);
    resetGridDragging();
  };

  // 处理拖拽经过事件
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    // 当拖拽经过操作区时设置标志
    if (over && over.id === 'operation-area') {
      console.log('Entering operation area');
      setEnteredOperationArea(true);
    }else{
      console.log('Leaving operation area');
      setEnteredOperationArea(false);
    }
  };

  // 删除操作区顶层模块
  const handleDeleteOperationItem = useCallback((id: string) => {
    setOperationItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // 修改handleSaveToGrid函数，保存后同时从操作区移除
  const handleSaveToGrid = useCallback((item: GridItem) => {
    // 保存到网格列表
    setItems((prevItems: GridItem[]) => [...prevItems, { ...item, id: uuidv4() }]);
    // 从操作区移除
    setOperationItems(prevItems => prevItems.filter(i => i.id !== item.id));
  }, []);

  // 新增handleDeleteGridItem函数，从网格列表中删除模块
  const handleDeleteGridItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  // 处理模块点击事件
  const handleItemClick = useCallback((item: GridItem) => {
    setSelectedItem(item);
    setShowDetailPanel(true);
  }, []);

  // 处理关闭详情面板
  const handleCloseDetailPanel = useCallback(() => {
    setShowDetailPanel(false);
    setSelectedItem(null);
  }, []);

  // 处理保存编辑后的模块
  const handleSaveItem = useCallback((updatedItem: GridItem) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  }, []);

  // 处理预览按钮点击事件
  const handlePreviewClick = useCallback((item: GridItem) => {
    setPreviewItem(item);
    setShowPreviewPanel(true);
  }, []);
  
  // 处理关闭预览面板
  const handleClosePreviewPanel = useCallback(() => {
    setShowPreviewPanel(false);
    setPreviewItem(null);
  }, []);

  // 服务端渲染时返回一个占位符
  if (!isMounted) {
    return (
      <div className="h-[1500px] mb-[20px] bg-gray-100 p-6 rounded-lg overflow-hidden relative">
        <h2 className="text-xl font-bold mb-6">功能卡片加载中...</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      // 使用指针位置检测策略
      collisionDetection={pointerWithin}
      // 监听拖拽开始事件
      onDragStart={handleDragStart}
      // 监听拖拽结束事件
      onDragEnd={handleDragEnd}
      // 监听拖拽经过事件
      onDragOver={handleDragOver}
    >
      <main className={`h-auto bg-gray-100 p-6 rounded-lg`}>
        <h2 className="text-2xl font-bold mb-8">功能卡片</h2>
        <p className="mb-6 text-gray-600">将下方卡片拖动到上方操作区</p>
        
        {/* 当前选择的提示词模块指示器 */}
        {selectedPrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-sm text-blue-600 font-medium">当前选择的提示词模块：</span>
              <span className="ml-2 font-bold">{selectedPrompt.title}</span>
            </div>
            <button
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
              onClick={clearSelectedPrompt}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              清除选择
            </button>
          </div>
        )}
        
        {/* 操作区显示控制 */}
        {showOperationArea && (
          <OperationArea
            items={operationItems}
            onClear={() => setOperationItems([])}
            onDelete={handleDeleteOperationItem}
            onSave={handleSaveToGrid}
          />
        )}
        
        {/* 使用网格布局显示卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            // 拖拽时在原位置渲染半透明占位卡片
            activeId === item.id ? (
              <div
                key={item.id}
                className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-200 opacity-40 flex flex-col justify-center items-center min-h-[120px] transition-all"
                style={{ minHeight: '120px', minWidth: '100%' }}
              >
                {/* 占位卡片内容，可为空或加提示 */}
              </div>
            ) : (
              <DraggableGridItem 
                key={item.id} 
                item={item} 
                onDelete={handleDeleteGridItem}
                onClick={() => handleItemClick(item)}
                onPreview={() => handlePreviewClick(item)}
              />
            )
          ))}
        </div>

        {/* 使用PromptDetailPanel组件 */}
        {showDetailPanel && selectedItem && (
          <PromptDetailPanel
            item={selectedItem}
            onClose={handleCloseDetailPanel}
            onSave={handleSaveItem}
          />
        )}
        
        {/* 使用PromptPreviewPanel组件 */}
        {showPreviewPanel && previewItem && (
          <PromptPreviewPanel
            item={previewItem}
            onClose={handleClosePreviewPanel}
          />
        )}
      </main>

      {/* 拖拽时显示的覆盖层元素 */}
      <DragOverlay>
        {activeItem ? <DragOverlayItem item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
