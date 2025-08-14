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
// 引入 uuid 用于生成唯一 id
import { v4 as uuidv4 } from 'uuid';
// 导入PromptDetailPanel组件
import { PromptDetailPanel } from './PromptDetailPanel';
// 导入预览面板组件
import { PromptPreviewPanel } from './PromptPreviewPanel';
// 导入 toast 提示
import { toast } from 'sonner';



// 拆分后的类型与工具函数
import type { GridItem } from './types';
import { insertChildModule, reorderChildModules } from './helpers';
// 拆分后的子组件
import { DraggableGridItem } from './DraggableGridItem';
import { OperationArea } from './OperationArea';
import { DragOverlayItem } from './DragOverlayItem';


export function AtomicBlock() {
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
