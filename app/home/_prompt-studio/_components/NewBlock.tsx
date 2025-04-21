"use client";

import { useState, useEffect } from 'react';
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

// 定义网格项的数据类型
interface GridItem {
  id: string;
  title: string;
  content: string;
  color: string;
}

// 创建可拖拽的网格项组件
function DraggableGridItem({ item }: { item: GridItem }) {
  // 使用useDraggable钩子使元素可拖拽
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  // 计算CSS变换样式
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${item.color} p-4 rounded-lg shadow cursor-pointer transition-shadow hover:shadow-lg`}
    >
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <p className="text-sm">{item.content}</p>
    </div>
  );
}

// 创建用于拖拽时显示的覆盖层元素
function DragOverlayItem({ item }: { item: GridItem | null }) {
  if (!item) return null;
  
  return (
    <div className={`${item.color} p-4 rounded-lg shadow-xl scale-110 opacity-95 border-2 border-blue-500 cursor-grabbing`}>
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <p className="text-sm">{item.content}</p>
    </div>
  );
}

// 创建操作区卡片组件
function OperationAreaItem({ item }: { item: GridItem }) {
  return (
    <div className={`${item.color} p-4 rounded-lg shadow cursor-default border border-gray-300`}>
      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
      <p className="text-sm">{item.content}</p>
    </div>
  );
}

// 创建操作区组件，可以作为放置目标
function OperationArea({ items }: { items: GridItem[] }) {
  // 使用useDroppable钩子使元素成为放置目标
  const { setNodeRef, isOver } = useDroppable({
    id: 'operation-area',
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 p-6 rounded-lg border-2 ${isOver ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} transition-colors min-h-[200px] mb-8`}
    >
      <h2 className="text-xl font-bold mb-4">操作区</h2>
      <p className="text-gray-500 mb-4">{items.length > 0 ? '已添加的功能卡片:' : '将功能卡片拖放到此区域'}</p>
      
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {items.map(item => (
            <OperationAreaItem key={item.id} item={item} />
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

export function NewBlock() {
  // 添加客户端渲染状态
  const [isMounted, setIsMounted] = useState(false);
  
  // 模拟数据 - 网格项列表
  const [items] = useState<GridItem[]>([
    { 
      id: '1', 
      title: '文本生成', 
      content: '生成各种类型的创意文本', 
      color: 'bg-blue-100' 
    },
    { 
      id: '2', 
      title: '图像描述', 
      content: '从图像中提取文本描述', 
      color: 'bg-green-100' 
    },
    { 
      id: '3', 
      title: '代码助手', 
      content: '帮助编写和调试代码', 
      color: 'bg-yellow-100' 
    },
    { 
      id: '4', 
      title: '翻译工具', 
      content: '在不同语言之间进行翻译', 
      color: 'bg-purple-100' 
    },
    { 
      id: '5', 
      title: '摘要生成', 
      content: '从长文本中提取关键信息', 
      color: 'bg-pink-100' 
    },
    { 
      id: '6', 
      title: '问答系统', 
      content: '回答用户提出的各种问题', 
      color: 'bg-orange-100' 
    },
  ]);

  // 存储操作区中的项目
  const [operationItems, setOperationItems] = useState<GridItem[]>([]);

  // 当前被拖拽的项目状态
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // 获取当前被拖拽的项目数据
  const activeItem = activeId ? items.find(item => item.id === activeId) || operationItems.find(item => item.id === activeId) || null : null;
  
  // 跟踪鼠标是否真正进入了操作区
  const [enteredOperationArea, setEnteredOperationArea] = useState(false);
  
  // 在客户端加载后再渲染组件
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  };
  
  // 处理拖拽结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    // 只有当鼠标真正进入过操作区并且释放时指针在操作区上方时才添加卡片
    if (enteredOperationArea) {
      // 查找被拖拽的项目
      const draggedItem = items.find(item => item.id === active.id);
      // 如果找到被拖拽的项目且它还不在操作区中
      if (draggedItem && !operationItems.some(item => item.id === draggedItem.id)) {
        // 将项目添加到操作区
        setOperationItems(prevItems => [...prevItems, draggedItem]);
      }
    }
    // 清除当前被拖拽项
    setActiveId(null);
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
      {/* 使用div包裹整个区域，作为全局放置区 */}
      <main
        className={`h-auto min-h-[800px] mb-[20px] mt-[20px] bg-gray-100 p-6 rounded-lg`}
      >
        <h2 className="text-2xl font-bold mb-8">功能卡片</h2>
        <p className="mb-6 text-gray-600">将下方卡片拖动到上方操作区</p>
        
        {/* 操作区 - 可放置区域 */}
        <OperationArea items={operationItems} />
        
        {/* 使用网格布局显示卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <DraggableGridItem key={item.id} item={item} />
          ))}
        </div>
      </main>

      {/* 拖拽时显示的覆盖层元素 */}
      <DragOverlay>
        {activeItem ? <DragOverlayItem item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
