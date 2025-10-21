"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
// 引入 uuid 用于生成唯一 id
import { v4 as uuidv4 } from 'uuid';
// 导入预览面板组件
import { PromptPreviewPanel } from './PromptPreviewPanel';
// 导入 toast 提示
import { toast } from 'sonner';
// 导入新手指引组件
import { TutorialOverlay } from './TutorialOverlay';
import { useDocumentStore } from '@/store/home/documentStore';
import { useRouter } from 'next/navigation';
// 导入 Convex 查询接口
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Doc } from '@/convex/_generated/dataModel';



// 拆分后的类型与工具函数
import type { GridItem } from './types';
import { insertChildModule, reorderChildModules } from './helpers';
// 拆分后的子组件
import { ModuleCardWrapper } from './ModuleCardWrapper';
import { GridCardContent } from './GridCardContent';
import { OperationArea } from './OperationArea';
import { ModuleCardDragOverlay } from './ModuleCardDragOverlay';
import { ModuleChildDragOverlay } from './ModuleChildDragOverlay';
import { EmptyGridState } from './EmptyGridState';


/**
 * 将后端文档数据转换为前端 GridItem 格式
 * 
 * 转换规则：
 * - 网格区卡片的 virtualId === documentId（无需生成新 ID）
 * - 卡片仅展示缩略信息（标题、描述等），不包含块内容
 * - 网格区卡片无子模块
 */
function convertDocumentToGridItem(doc: Doc<"documents">): GridItem {
  return {
    // 网格区：虚拟 ID 等于真实 ID
    virtualId: doc._id,
    documentId: doc._id,
    
    // 基础字段
    title: doc.title,
    
    // 元数据
    description: doc.description,
    promptPrefix: doc.promptPrefix,
    promptSuffix: doc.promptSuffix,
    referenceCount: doc.referenceCount,
    
    // 网格区卡片无子模块
    children: [],
  };
}


export function PromptBoard() {
  // 添加客户端渲染状态
  const [isMounted, setIsMounted] = useState(false);
  
  // 从后端查询文档列表
  const documentsData = useQuery(api.prompt.queries.listDocuments);
  
  // 网格区显示的文档列表（从后端数据转换而来）
  const gridDocuments = useMemo(() => {
    if (!documentsData) {
      return [];
    }
    return documentsData.map(convertDocumentToGridItem);
  }, [documentsData]);

  // 存储操作区中的项目
  const [operationItems, setOperationItems] = useState<GridItem[]>([]);

  // 当前正在拖拽的模块 ID
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  // 当前正在拖拽的子模块（用于覆盖层）
  const [draggingChild, setDraggingChild] = useState<{ parentId: string; child: GridItem } | null>(null);
  
  // 正在正在拖动的 模块 （操作区或网格区）
  // 使用虚拟 ID 查找正在拖动的模块
  const draggingItem = draggingItemId
    ? gridDocuments.find(item => item.virtualId === draggingItemId) || operationItems.find(item => item.virtualId === draggingItemId) || null
    : null;
  
  // 跟踪鼠标是否真正进入了操作区
  const [enteredOperationArea, setEnteredOperationArea] = useState(false);
  
  // 记录当前正在拖动的网格区模块ID（无拖动时为null）
  const [gridDraggingId, setGridDraggingId] = useState<string | null>(null);
  
  // 控制操作区显示/隐藏
  const [showOperationArea, setShowOperationArea] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 文档查看器
  const openDocument = useDocumentStore(state => state.openDocument);
  const router = useRouter();
  
  // 控制预览面板显示状态
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  // 当前预览的模块
  const [previewItem, setPreviewItem] = useState<GridItem | null>(null);
  
  // 新手指引相关状态
  const [showTutorial, setShowTutorial] = useState(false);
  // 教程动画时强制显示操作区
  const [tutorialForceShowOperation, setTutorialForceShowOperation] = useState(false);



  // 在客户端加载后再渲染组件
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 新手指引初始化逻辑
  useEffect(() => {
    if (!isMounted) return;
    
    // 检查用户是否已经看过新手指引
    const hasSeenTutorial = localStorage.getItem('prompt-board-tutorial-seen');
    if (!hasSeenTutorial) {
      // 延迟1秒显示教程，让用户先看到界面
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  }, [isMounted]);

  // 监听 gridDraggingId 和 operationItems 控制操作区显示/隐藏
  useEffect(() => {
    // 只要有拖拽、有内容或教程强制显示就显示
    if (gridDraggingId || operationItems.length > 0 || tutorialForceShowOperation) {
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
  }, [gridDraggingId, operationItems.length, tutorialForceShowOperation]);

  // 处理操作区模块-子模块提升到顶层
  const handlePromoteToTop = useCallback((event: Event) => {
    const { parentId, childId } = (event as CustomEvent).detail;
    
    // 使用函数式更新，确保总是基于最新的状态
    setOperationItems(prevItems => {
      // 查找要提升的子模块和其父模块（使用虚拟 ID）
      const parentModule = prevItems.find(item => item.virtualId === parentId);
      if (!parentModule) return prevItems; // 未找到则返回原状态
      
      const childModule = parentModule.children.find(child => child.virtualId === childId);
      if (!childModule) return prevItems; // 未找到则返回原状态
      
      // 从父模块中移除子模块
      const updatedItems = prevItems.map(item => {
        if (item.virtualId === parentId) {
          return {
            ...item,
            children: item.children.filter(child => child.virtualId !== childId)
          };
        }
        return item;
      });
      
      // 为子模块创建一个新的顶层模块
      const newTopModule: GridItem = {
        ...childModule,
        virtualId: uuidv4(), // 生成新的虚拟 ID
        documentId: childModule.documentId, // 保留真实 ID
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
  }, []); // 空依赖数组，只运行一次

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
    // 设置当前被拖拽项的虚拟 ID
    setDraggingItemId(event.active.id as string);
    // 重置操作区进入状态
    setEnteredOperationArea(false);

    // 判断是否为网格区模块（使用虚拟 ID）
    const isGridItem = gridDocuments.some(item => item.virtualId === event.active.id);
    if (isGridItem) {
      setGridDraggingId(event.active.id as string);
    }

    // 如果是子模块排序，记录子模块用于 DragOverlay
    const data = event.active.data?.current as any;
    if (data?.type === 'child' && data?.child && data?.parentId) {
      setDraggingChild({ parentId: data.parentId, child: data.child as GridItem });
    }
  };
  
  // 拖拽结束/取消时重置
  const resetGridDragging = () => setGridDraggingId(null);

  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    // over 表示拖拽释放时鼠标悬停的目标区域信息（可能为 null，表示未悬停在任何 droppable 区域）
    // active 表示当前被拖拽的元素信息（即拖拽源）
    const { over, active } = event;
    
    // 处理子模块排序（useSortable 模式）
    if (active.data.current?.type === 'child' && over && over.id) {
      // 获取子模块数据
      const activeData = active.data.current as { type: string; parentId: string; index: number };
      // 获取目标模块数据
      const overData = (over.data.current as { type?: string; parentId?: string; index?: number }) || {};
      // 检查是否为同一个父模块
      const sameParent = overData.parentId ? overData.parentId === activeData.parentId : true;

      if (sameParent && active.id !== over.id) {
        // 获取父模块（使用虚拟 ID）
        const parent = operationItems.find(i => i.virtualId === activeData.parentId);
        // 如果父模块存在，则重新排序
        if (parent) {
          // 获取旧索引和新索引（使用虚拟 ID）
          const oldIndex = parent.children.findIndex(c => c.virtualId === active.id);
          const newIndex = parent.children.findIndex(c => c.virtualId === over.id);
          // 如果旧索引和新索引不同，则重新排序
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setOperationItems(prev => reorderChildModules(prev, activeData.parentId, String(active.id), newIndex));
          }
        }else{
          // 如果父模块不存在，则不进行排序
          toast.error('父模块不存在', {
            position: 'top-center',
          });
        }
      }
    }
    // 如果拖拽释放目标为操作区的模块，则将模块插入到目标模块的children中
    else if (over && typeof over.id === 'string' && over.id.startsWith('operation-item-')) {
      // 获取目标模块的虚拟 ID
      const targetVirtualId = over.id.replace('operation-item-', '');
      
      // 判断拖拽源是网格区还是操作区（使用虚拟 ID）
      const draggedFromGrid = gridDocuments.find(item => item.virtualId === active.id);
      const draggedFromOperation = operationItems.find(item => item.virtualId === active.id);
      
      // 检查层级限制：只检查被拖拽模块是否有子模块，如果有则不能作为子模块
      if (draggedFromGrid && draggedFromGrid.children && draggedFromGrid.children.length > 0) {
        toast.error('暂不支持多级嵌套', {
          position: 'top-center',
        });
      }
      else if (draggedFromOperation && draggedFromOperation.children && draggedFromOperation.children.length > 0) {
        toast.error('暂不支持多级嵌套', {
          position: 'top-center',
        });
      }
      else if (draggedFromGrid) {
        // 拖拽源来自网格区：生成副本，virtualId 用 uuid，保留 documentId
        const copy: GridItem = { 
          ...draggedFromGrid, 
          virtualId: uuidv4(),
          documentId: draggedFromGrid.documentId,
          children: [],
        };
        setOperationItems(prevItems => insertChildModule(prevItems, targetVirtualId, copy));
      } else if (draggedFromOperation && draggedFromOperation.virtualId !== targetVirtualId) {
        // 拖拽源来自操作区，且不是自己拖到自己：先移除，再插入
        let newItems = operationItems.filter(item => item.virtualId !== draggedFromOperation.virtualId);
        newItems = insertChildModule(newItems, targetVirtualId, draggedFromOperation);
        setOperationItems(newItems);
      }
    // 如果拖拽释放目标为操作区，则将模块插入到操作区
    } else if (enteredOperationArea) {
      // 从网格区拖拽副本到操作区
      const draggedItem = gridDocuments.find(item => item.virtualId === active.id);
      // 如果找到被拖拽的项目
      if (draggedItem) {
        // 生成副本，virtualId 用 uuid，保留 documentId
        const copy: GridItem = { 
          ...draggedItem, 
          virtualId: uuidv4(),
          documentId: draggedItem.documentId,
        };
        // 将副本添加到操作区
        setOperationItems(prevItems => [...prevItems, copy]);
      }
    }
    // 清除当前被拖拽项
    setDraggingItemId(null);
    resetGridDragging();
    setDraggingChild(null);
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

  // 删除操作区顶层模块（使用虚拟 ID）
  const handleDeleteOperationItem = useCallback((virtualId: string) => {
    setOperationItems(prev => prev.filter(item => item.virtualId !== virtualId));
  }, []);

  // 保存操作区模块到网格区
  // TODO: 需要调用后端 createDocument 和 createReferenceBlock 接口
  const handleSaveToGrid = useCallback((item: GridItem) => {
    // 后端保存成功后，Convex 会自动刷新 gridDocuments 数据
    toast.error('保存功能待实现：需要调用后端接口', {
      position: 'top-center',
    });
    // 从操作区移除
    setOperationItems(prevItems => prevItems.filter(i => i.virtualId !== item.virtualId));
  }, []);

  // 删除网格区模块（使用虚拟 ID，实际等于 documentId）
  const handleDeleteGridItem = useCallback((virtualId: string) => {
    // TODO: 需要调用后端 deleteDocument 接口
    // 后端删除成功后，Convex 会自动刷新 gridDocuments 数据
    toast.error('删除功能待实现：需要调用后端接口', {
      position: 'top-center',
    });
  }, []);

  // 处理模块点击事件：打开全局文档查看器
  const handleItemClick = useCallback((item: GridItem) => {
    openDocument({
      initialData: {
        title: item.title,
        description: item.description || '',
        content: '', // 内容需要通过 getDocumentWithBlocks 查询获取
      },
      onNavigateToFullscreen: () => router.push('/home/prompt-document'),
    });
  }, [openDocument, router]);

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

  // 处理关闭新手指引
  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false);
    setTutorialForceShowOperation(false);
    // 记录用户已经看过教程
    localStorage.setItem('prompt-board-tutorial-seen', 'true');
  }, []);

  // 处理教程中的操作区显示控制
  const handleTutorialOperationArea = useCallback((show: boolean) => {
    setTutorialForceShowOperation(show);
  }, []);

  // 服务端渲染时返回一个占位符
  if (!isMounted) {
    return (
      <div className="h-[1500px] mb-[20px] bg-gray-100 p-6 rounded-lg overflow-hidden relative max-w-[70rem] w-full mx-auto">
        <h2 className="text-xl font-bold mb-6">模块加载中...</h2>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      <main className={`h-auto rounded-lg w-full mx-auto`}>
        
        
        {/* 操作区显示控制 */}
        {showOperationArea && (
          <OperationArea
            items={operationItems}
            onClear={() => setOperationItems([])}
            onDelete={handleDeleteOperationItem}
            onSave={handleSaveToGrid}
          />
        )}

        {/* 使用网格布局显示卡片列表，限制最多4行高度并内部滚动 */}
        <article
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 max-w-[44.3rem] w-full mx-auto max-h-[14rem] overflow-y-auto p-3"
          style={{ gridAutoRows: 'min-content' }}
        >
          {gridDocuments.length === 0 ? (
            <EmptyGridState />
          ) : (
            gridDocuments.map(item => (
              <ModuleCardWrapper
                key={item.virtualId}
                item={item}
                onClick={() => handleItemClick(item)}
              >
                <GridCardContent 
                  item={item}
                  onDelete={handleDeleteGridItem}
                  onPreview={() => handlePreviewClick(item)}
                />
              </ModuleCardWrapper>
            ))
          )}
        </article>

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
        {draggingChild ? (
          <ModuleChildDragOverlay child={draggingChild.child} />
        ) : draggingItem ? (
          <ModuleCardDragOverlay item={draggingItem} />
        ) : null}
      </DragOverlay>
      
      {/* 新手指引覆盖层 */}
      <TutorialOverlay
        isVisible={showTutorial}
        onClose={handleCloseTutorial}
        onShowOperationArea={handleTutorialOperationArea}
      />
    </DndContext>
  );
}
