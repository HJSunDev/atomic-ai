"use client";

import { useState, useEffect } from "react";

// 定义拖动数据接口
interface DragData {
  isDragging: boolean;
  draggedCardId: number | null;
  hoveredCardId: number | null;
  isChildCard?: boolean; // 标记是否为子卡片
}

// 定义卡片数据接口
interface CardData {
  id: number;
  title: string;
  description: string;
  color: string;
  children?: CardData[];
  parentId?: number; // 新增父卡片ID属性
}

// 可拖动子卡片组件
function DraggableChildCard({
  childCard,
  parentId,
  dragData,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave
}: {
  childCard: CardData;
  parentId: number;
  dragData: DragData;
  onDragStart: (cardId: number, isChildCard: boolean, parentId?: number) => void;
  onDragEnd: () => void;
  onDragEnter: (cardId: number) => void;
  onDragLeave: () => void;
}) {
  // 解构卡片属性
  const { id, title, description, color } = childCard;
  
  // 拖动开始时的初始位置
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  // 卡片当前位置状态
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 当前卡片的本地拖动状态
  const [localDragging, setLocalDragging] = useState(false);
  // 判断当前卡片是否是被拖动的卡片
  const isBeingDragged = localDragging && dragData.draggedCardId === id && dragData.isChildCard;
  
  // 判断当前卡片是否是被悬停的卡片
  const isTargeted = dragData.hoveredCardId === id && dragData.draggedCardId !== id;

  // 添加全局鼠标移动监听
  useEffect(() => {
    // 只在拖动状态下添加全局监听
    if (!localDragging) return;
    
    // 检测鼠标是否悬停在其他卡片上
    const checkHoverElements = (e: MouseEvent) => {
      const elementsUnderMouse = document.elementsFromPoint(e.clientX, e.clientY);
      for (const element of elementsUnderMouse) {
        const cardId = element.getAttribute('data-card-id');
        if (cardId && parseInt(cardId) !== id && dragData.draggedCardId === id) {
          onDragEnter(parseInt(cardId));
          return;
        }
      }
      if (dragData.hoveredCardId !== null && dragData.draggedCardId === id) {
        onDragLeave();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 防止事件冒泡
      e.stopPropagation();
      
      // 计算新位置
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setPosition({ x: newX, y: newY });
      
      // 检测是否悬停在其他卡片上
      checkHoverElements(e);
    };
    
    // 处理全局鼠标释放
    const handleGlobalMouseUp = (e: MouseEvent) => {
      // 防止事件冒泡
      e.stopPropagation();
      
      setLocalDragging(false);
      // 如果释放时没有悬停在任何卡片上，重置位置
      if (dragData.hoveredCardId === null && dragData.draggedCardId === id) {
        setPosition({ x: 0, y: 0 });
        console.log(`子卡片 ${id} 未放置在其他卡片上，重置位置`);
      }
      onDragEnd();
      console.log(`全局鼠标释放: 子卡片 ${id} 停止拖动`);
    };
    
    // 添加全局事件监听
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // 清理函数
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [localDragging, id, startPos, onDragEnd, dragData]);

  // 开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    // 防止事件冒泡到父元素
    e.stopPropagation();
    e.preventDefault();
    
    setLocalDragging(true);
    onDragStart(id, true, parentId);
    console.log(`鼠标按下: 开始拖动子卡片 ${id}`);
    
    // 记录鼠标按下时的位置
    setStartPos({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  // 重置位置
  const handleDoubleClick = (e: React.MouseEvent) => {
    // 防止事件冒泡
    e.stopPropagation();
    
    setPosition({ x: 0, y: 0 });
    console.log(`双击: 重置子卡片 ${id} 位置`);
  };

  return (
    <div 
      data-card-id={id}
      className={`
        ${color} p-2 rounded text-sm shadow-sm relative cursor-grab active:cursor-grabbing
        ${isBeingDragged ? 'shadow-xl z-50' : ''}
        ${isTargeted ? 'ring-2 ring-blue-500 ring-opacity-75 scale-105' : ''}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) ${isTargeted ? 'rotate(1deg)' : ''}`,
        transition: localDragging ? 'none' : 'all 0.2s ease-out',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* 状态调试信息 */}
      <div className="absolute -bottom-3 -left-1 text-[10px] text-gray-700 z-50 bg-white/80 px-0.5 rounded">
        ID:{id} {isBeingDragged ? "🔄" : ""} {isTargeted ? "🎯" : ""}
      </div>
      
      {/* 子卡片被悬停时显示的提示 */}
      {isTargeted && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full animate-bounce shadow-sm z-10 text-[10px]">
          放置此处!
        </div>
      )}
      
      <div className="font-medium">{title}</div>
      <div className="text-xs mt-1 opacity-80">{description}</div>
    </div>
  );
}

// 可拖动卡片组件
function DraggableCard({ 
  card, 
  dragData,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave
}: { 
  card: CardData;
  dragData: DragData;
  onDragStart: (cardId: number, isChildCard?: boolean, parentId?: number) => void;
  onDragEnd: () => void;
  onDragEnter: (cardId: number) => void;
  onDragLeave: () => void;
}) {
  // 解构卡片属性
  const { id, title, description, color } = card;
  
  // 拖动开始时的初始位置
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  // 卡片当前位置状态
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 当前卡片的本地拖动状态
  const [localDragging, setLocalDragging] = useState(false);
  // 判断当前卡片是否是被拖动的卡片
  const isBeingDragged = localDragging && dragData.draggedCardId === id;
  
  // 判断当前卡片是否是被悬停的卡片（即被拖动的卡片进入了这个卡片区域）
  const isTargeted = dragData.hoveredCardId === id && dragData.draggedCardId !== id;

  // 添加全局鼠标移动监听
  useEffect(() => {
    // 只在拖动状态下添加全局监听
    if (!localDragging) return;
    
    // 检测鼠标是否悬停在其他卡片上
    const checkHoverElements = (e: MouseEvent) => {
      const elementsUnderMouse = document.elementsFromPoint(e.clientX, e.clientY);
      for (const element of elementsUnderMouse) {
        const cardId = element.getAttribute('data-card-id');
        if (cardId && parseInt(cardId) !== id && dragData.draggedCardId === id) {
          onDragEnter(parseInt(cardId));
          return;
        }
      }
      if (dragData.hoveredCardId !== null && dragData.draggedCardId === id) {
        onDragLeave();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 计算新位置
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setPosition({ x: newX, y: newY });
      
      // 检测是否悬停在其他卡片上
      checkHoverElements(e);
    };
    
    // 处理全局鼠标释放
    const handleGlobalMouseUp = () => {
      setLocalDragging(false);
      // 如果释放时没有悬停在任何卡片上，重置位置
      if (dragData.hoveredCardId === null && dragData.draggedCardId === id) {
        setPosition({ x: 0, y: 0 });
        console.log(`卡片 ${id} 未放置在其他卡片上，重置位置`);
      }
      onDragEnd();
      console.log(`全局鼠标释放: 卡片 ${id} 停止拖动`);
    };
    
    // 添加全局事件监听
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // 清理函数
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [localDragging, id, startPos, onDragEnd, dragData]);

  // 开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止默认行为
    setLocalDragging(true);
    onDragStart(id, false);
    console.log(`鼠标按下: 开始拖动卡片 ${id}`);
    
    // 记录鼠标按下时的位置
    setStartPos({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  // 重置位置
  const handleDoubleClick = () => {
    setPosition({ x: 0, y: 0 });
    console.log(`双击: 重置卡片 ${id} 位置`);
  };

  return (
    <div 
      className="relative" 
      data-card-id={id}
    >
      {/* 状态调试信息 - 开发模式显示 */}
      <div className="absolute -bottom-4 left-0 text-xs text-gray-500 z-50 bg-white/80 px-1 rounded">
        ID:{id} {isBeingDragged ? "🔄拖动中" : ""} {isTargeted ? "🎯目标" : ""}
      </div>
      
      {/* 卡片本体 */}
      <div 
        data-card-id={id}
        className={`
          ${color} p-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing transition-all duration-200
          ${isBeingDragged ? 'shadow-xl z-50' : ''}
          ${isTargeted ? 'ring-4 ring-blue-500 ring-opacity-75 scale-105 shadow-lg animate-pulse' : ''}
        `}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) ${isTargeted ? 'rotate(1deg)' : ''}`,
          transition: localDragging ? 'none' : 'all 0.2s ease-out',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* 被悬停时显示的提示 */}
        {isTargeted && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-bounce shadow-md z-10">
            放置此处!
          </div>
        )}
        
        <h3 className={`text-lg font-bold mb-2 ${isTargeted ? 'text-white' : ''}`}>{title}</h3>
        <p className="text-sm">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs opacity-70">#{id}</span>
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            {id}
          </div>
        </div>

        {/* 子卡片区域 */}
        {card.children && card.children.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/30">
            <div className="text-xs font-semibold mb-2 flex items-center">
              <span>子卡片</span>
              <span className="ml-1 bg-white/20 text-xs px-1.5 rounded-full">{card.children.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {card.children.map(childCard => (
                <DraggableChildCard
                  key={childCard.id}
                  childCard={childCard}
                  parentId={card.id}
                  dragData={dragData}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TestBlock() {
  // 卡片数据
  const [cards] = useState<CardData[]>([
    {
      id: 1,
      title: "思维导图",
      description: "整理和组织想法的可视化工具",
      color: "bg-blue-400",
      children: [
        {
          id: 11,
          title: "头脑风暴",
          description: "快速生成创意和想法",
          color: "bg-blue-300"
        },
        {
          id: 12,
          title: "知识结构",
          description: "建立知识体系和框架",
          color: "bg-blue-300"
        }
      ]
    },
    {
      id: 2,
      title: "日程计划",
      description: "管理时间和安排任务的工具",
      color: "bg-green-400",
      children: [
      ]
    },
    {
      id: 3,
      title: "笔记本",
      description: "记录灵感和重要信息",
      color: "bg-yellow-400",
      children: []
    },
    {
      id: 4,
      title: "待办事项",
      description: "追踪需要完成的任务",
      color: "bg-red-400",
      children: [
      ]
    },
    {
      id: 5,
      title: "文件管理",
      description: "组织和存储重要文档",
      color: "bg-purple-400",
      children: []
    },
    {
      id: 6,
      title: "知识库",
      description: "积累和分享知识的平台",
      color: "bg-indigo-400",
      children: [
      ]
    },
    {
      id: 7,
      title: "统计分析",
      description: "数据可视化和趋势分析",
      color: "bg-pink-400",
      children: []
    }
  ]);

  // 全局拖拽状态
  const [dragData, setDragData] = useState<DragData>({
    isDragging: false,
    draggedCardId: null,
    hoveredCardId: null,
    isChildCard: false // 新增属性，标记是否为子卡片
  });

  // 监控拖拽事件，记录全局拖拽状态，使其在卡片间共享
  const handleDragStart = (cardId: number, isChildCard: boolean = false, parentId?: number) => {
    setDragData(prev => ({
      ...prev,
      isDragging: true,
      draggedCardId: cardId,
      isChildCard: isChildCard
    }));
    console.log(`全局状态更新: 开始拖动${isChildCard ? '子' : ''}卡片 ${cardId}${parentId ? `(父卡片:${parentId})` : ''}`);
  };

  const handleDragEnd = () => {
    console.log(`全局状态更新: 结束拖动状态`);
    setDragData({
      isDragging: false,
      draggedCardId: null,
      hoveredCardId: null,
      isChildCard: false
    });
  };

  const handleDragEnter = (cardId: number) => {
    if (dragData.isDragging && dragData.draggedCardId !== cardId) {
      setDragData(prev => ({
        ...prev,
        hoveredCardId: cardId
      }));
      console.log(`全局状态更新: ${dragData.isChildCard ? '子' : ''}卡片 ${dragData.draggedCardId} 进入卡片 ${cardId}`);
    }
  };

  const handleDragLeave = () => {
    console.log(`全局状态更新: 清除悬停目标`);
    setDragData(prev => ({
      ...prev,
      hoveredCardId: null
    }));
  };

  // 这里可以添加处理卡片拖放完成后的逻辑
  // 例如：将子卡片从一个父卡片移动到另一个父卡片
  useEffect(() => {
    // 如果没有拖动或没有悬停目标，则不处理
    if (!dragData.isDragging || dragData.hoveredCardId === null || dragData.draggedCardId === null) {
      return;
    }

    // 当鼠标释放时，如果有卡片被拖动并悬停在另一个卡片上，可以在这里处理卡片关系的变更
    // 这里只是示例，实际实现中可能需要更复杂的逻辑
    const handleMouseUp = () => {
      if (dragData.isDragging && dragData.hoveredCardId !== null && dragData.draggedCardId !== null) {
        console.log(`卡片拖放完成: ${dragData.isChildCard ? '子' : ''}卡片 ${dragData.draggedCardId} 被放置到卡片 ${dragData.hoveredCardId} 上`);
        
        // 在这里可以实现卡片关系变更的逻辑
        // 例如：从一个父卡片移动到另一个父卡片
        // 注意：这里只是记录日志，实际上并没有改变数据结构
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragData]);

  return (
    <div className="bg-gray-100 p-6 rounded-lg h-full overflow-hidden">
      <h2 className="text-xl font-bold mb-6">功能卡片 <span className="text-sm font-normal text-gray-500">(拖动卡片移动，双击还原位置)</span></h2>
      
      <p className="text-sm text-gray-600 mb-4">
        提示: 将一个卡片拖入另一个卡片区域查看交互效果，子卡片也可以单独拖动
      </p>

      {/* 当前拖拽状态显示 */}
      <div className="bg-white px-3 py-2 rounded mb-4 text-xs text-gray-700">
        <p>拖拽状态: {dragData.isDragging ? "拖动中" : "未拖动"}</p>
        <p>拖动卡片: {dragData.draggedCardId || "无"}{dragData.isChildCard ? " (子卡片)" : ""}</p>
        <p>悬停卡片: {dragData.hoveredCardId || "无"}</p>
      </div>

      {/* 卡片统计信息 */}
      <div className="bg-white/70 px-3 py-2 rounded mb-4 text-xs text-gray-700 flex space-x-4">
        <p>主卡片数量: {cards.length}</p>
        <p>子卡片总数: {cards.reduce((sum, card) => sum + (card.children?.length || 0), 0)}</p>
      </div>

      {/* 响应式网格布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {cards.map((card) => (
          <DraggableCard 
            key={card.id}
            card={card}
            dragData={dragData}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          />
        ))}
      </div>
    </div>
  );
}

