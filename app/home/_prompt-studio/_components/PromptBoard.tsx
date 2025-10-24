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
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { useConvex } from 'convex/react';
// 导入 Dialog 组件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';



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
  
  // Convex 客户端实例
  const convex = useConvex();
  
  // 从后端查询文档列表
  const documentsData = useQuery(api.prompt.queries.listDocuments);
  
  // 创建组合文档的 mutation
  const createComposedDocument = useMutation(api.prompt.mutations.createComposedDocument);
  
  // 删除文档的 mutation
  const deleteDocument = useMutation(api.prompt.mutations.deleteDocument);
  
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
  
  // 删除冲突对话框状态
  const [deleteConflictDialog, setDeleteConflictDialog] = useState<{
    open: boolean;
    documentTitle: string;
    references: Array<{
      blockId: string;
      documentId: string;
      documentTitle: string;
    }>;
  }>({
    open: false,
    documentTitle: '',
    references: [],
  });

  /**
   * 加载文档块结构并转换为子模块
   * 
   * 功能说明：
   * - 获取文档的内容块占位 + 所有引用块的元信息
   * - 转换为可拖拽排序的子模块列表
   * - 每次拖入都重新加载，确保数据最新
   * 
   * 使用方式：
   * - 使用 convex.query() 命令式调用，而非 useQuery Hook
   * - 原因：需要在拖拽完成后按需获取数据，避免 Hook 规则冲突
   * - 返回 Promise，适合在事件回调中使用
   * 
   * @param operationItemVirtualId 操作区卡片的虚拟ID（用于定位更新目标）
   * @param documentId 文档的真实ID（用于查询后端数据）
   */
  const loadDocumentBlocks = useCallback(async (operationItemVirtualId: string, documentId: Id<"documents">) => {
    try {
      // 使用 convex.query() 命令式调用，避免 useQuery Hook 规则限制
      const documentStructure = await convex.query(api.prompt.queries.getDocumentOutline, { documentId });
      
      if (!documentStructure) {
        toast.error('无法加载文档结构', { position: 'top-center' });
        return;
      }

      const children: GridItem[] = documentStructure.items.map(item => {
        if (item.kind === 'content') {
          return {
            virtualId: uuidv4(),
            documentId: documentId,
            title: '文档内容',
            blockType: 'content' as const,
            children: [],
          };
        } else {
          return {
            virtualId: uuidv4(),
            documentId: item.referencedDocument._id,
            title: item.referencedDocument.title,
            description: item.referencedDocument.description,
            promptPrefix: item.referencedDocument.promptPrefix,
            promptSuffix: item.referencedDocument.promptSuffix,
            referenceCount: item.referencedDocument.referenceCount,
            blockType: 'reference' as const,
            children: [],
          };
        }
      });

      setOperationItems(prevItems =>
        prevItems.map(item =>
          item.virtualId === operationItemVirtualId
            ? { ...item, children }
            : item
        )
      );
    } catch (error) {
      console.error('加载文档块结构失败:', error);
      toast.error('加载文档结构失败', { position: 'top-center' });
    }
  }, [convex]);


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
  const handleDragEnd = async (event: DragEndEvent) => {
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
      
      // 【场景1】操作区卡片 → 操作区卡片
      if (draggedFromOperation && draggedFromOperation.virtualId !== targetVirtualId) {
        // 检查是否有引用块（只检查引用块，内容块不影响嵌套限制）
        const hasReferences = draggedFromOperation.children.some(
          child => child.blockType === 'reference'
        );
        
        if (hasReferences) {
          toast.error('暂不支持多级嵌套', {
            position: 'top-center',
          });
        } else {
          // 允许拖入：先移除，再转换为引用块子模块并插入
          let newItems = operationItems.filter(item => item.virtualId !== draggedFromOperation.virtualId);
          // 将操作区顶层卡片转换为引用块子模块
          const referenceChild: GridItem = {
            ...draggedFromOperation,
            blockType: 'reference',  // 作为子模块时标记为引用块
            children: [],  // 作为子模块时清空其子模块列表（避免多级嵌套）
          };
          newItems = insertChildModule(newItems, targetVirtualId, referenceChild);
          setOperationItems(newItems);
        }
      }
      // 【场景2】列表区卡片 → 操作区卡片
      else if (draggedFromGrid) {
        // 异步检查文档是否有引用块
        try {
          // 获取文档的大纲结构（内容块占位 + 引用块元信息）
          const outline = await convex.query(
            api.prompt.queries.getDocumentOutline, 
            { documentId: draggedFromGrid.documentId as Id<"documents"> }
          );
          
          if (!outline) {
            toast.error('无法加载文档结构', { position: 'top-center' });
            return;
          }
          
          // 检查是否有引用块
          const hasReferences = outline.items.some(item => item.kind === 'reference');
          
          if (hasReferences) {
            toast.error('暂不支持多级嵌套', { position: 'top-center' });
            return; // 阻止拖入
          }
          
          // 允许拖入：创建引用块子模块并插入
          const referenceChild: GridItem = { 
            ...draggedFromGrid, 
            virtualId: uuidv4(),
            documentId: draggedFromGrid.documentId,
            blockType: 'reference',  // 作为子模块时标记为引用块
            children: [],  // 作为子模块不需要子模块列表
          };
          setOperationItems(prevItems => insertChildModule(prevItems, targetVirtualId, referenceChild));
          
        } catch (error) {
          console.error('检查文档结构失败:', error);
          toast.error('检查文档结构失败，请重试', { position: 'top-center' });
        }
      }
    } 
    // 如果拖拽释放目标为操作区，则将模块插入到操作区
    else if (enteredOperationArea) {
      // 从网格区拖拽副本到操作区
      const draggedItem = gridDocuments.find(item => item.virtualId === active.id);
      // 如果找到被拖拽的项目
      if (draggedItem) {
        // 生成副本，virtualId 用 uuid，保留 documentId
        const copy: GridItem = { 
          ...draggedItem, 
          virtualId: uuidv4(),
          documentId: draggedItem.documentId,
          children: [],
        };
        // 将副本添加到操作区
        setOperationItems(prevItems => [...prevItems, copy]);
        
        // 异步加载文档块结构并转换为子模块
        loadDocumentBlocks(copy.virtualId, draggedItem.documentId as Id<"documents">);
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
  const handleSaveToGrid = useCallback(async (item: GridItem) => {
    try {
      // 将子模块转换为接口所需的格式，保留原有顺序
      const children = item.children.map(child => ({
        type: child.blockType as "content" | "reference",
        documentId: child.documentId as Id<"documents">,
      }));
      
      const result = await createComposedDocument({
        title: item.title,
        description: item.description,
        promptPrefix: item.promptPrefix,
        promptSuffix: item.promptSuffix,
        children,
      });

      toast.success(
        `保存成功！包含 ${result.contentCount} 个内容块、${result.referenceCount} 个引用块`, 
        { position: 'top-center' }
      );

      // 从操作区移除模块
      setOperationItems(prevItems => prevItems.filter(i => i.virtualId !== item.virtualId));
    } catch (error) {

      toast.error(error instanceof Error ? error.message : '保存失败，请重试', {
        position: 'top-center',
      });
    }
  }, [createComposedDocument]);

  // 删除网格区模块（使用虚拟 ID，实际等于 documentId）
  const handleDeleteGridItem = useCallback(async (virtualId: string) => {
    try {
      // 在网格区，virtualId 等于 documentId
      const documentId = virtualId as Id<"documents">;
      
      // 获取要删除的文档信息（用于显示标题）
      const document = gridDocuments.find(item => item.virtualId === virtualId);
      const documentTitle = document?.title || '未知文档';
      
      // 调用删除 mutation
      const result = await deleteDocument({ id: documentId });
      
      if (result.success && result.deleted) {
        toast.success('文档删除成功', {
          position: 'top-center',
        });
      } else if (!result.success && result.reason === 'has_references') {
        // 显示引用冲突对话框
        setDeleteConflictDialog({
          open: true,
          documentTitle,
          references: result.references,
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败，请重试', {
        position: 'top-center',
      });
    }
  }, [deleteDocument, gridDocuments]);

  // 处理模块点击事件：打开全局文档查看器
  const handleItemClick = useCallback((item: GridItem) => {
    const currentMode = useDocumentStore.getState().displayMode;
    
    if (currentMode === 'fullscreen') {
      // 全屏模式：直接路由跳转到动态路由
      router.push(`/home/prompt-document/${item.documentId}`);
    } else {
      // drawer/modal 模式：通过 Store 打开
      openDocument({
        documentId: item.documentId,
      });
    }
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
      
      {/* 删除冲突对话框 */}
      <Dialog
        open={deleteConflictDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConflictDialog({
              open: false,
              documentTitle: '',
              references: [],
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">无法删除文档</DialogTitle>
            <DialogDescription className="text-base pt-2">
              文档 <span className="font-semibold text-foreground">"{deleteConflictDialog.documentTitle}"</span> 正被以下 {deleteConflictDialog.references.length} 个文档引用，请先解除引用关系。
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">引用此文档的文档列表：</div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {deleteConflictDialog.references.map((ref, index) => (
                <div
                  key={ref.blockId}
                  className="flex items-center gap-1 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-4 h-4  text-primary flex items-center justify-center text-[13px] font-semibold">
                    {index + 1 + "."}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {ref.documentTitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => {
                setDeleteConflictDialog({
                  open: false,
                  documentTitle: '',
                  references: [],
                });
              }}
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
