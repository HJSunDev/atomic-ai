"use client";

import { useState, useEffect } from "react";

// 定义拖动数据接口
interface DragData {
  isDragging: boolean;
  draggedCardId: number | null;
  hoveredCardId: number | null;
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
  card: {
    id: number;
    title: string;
    description: string;
    color: string;
  };
  dragData: DragData;
  onDragStart: (cardId: number) => void;
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
    
    // 处理全局鼠标移动
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
  }, [localDragging, id, startPos, onDragEnd]);
  
  // 检测鼠标是否悬停在其他卡片上
  const checkHoverElements = (e: MouseEvent) => {
    // 获取鼠标下方的所有元素
    const elementsUnderMouse = document.elementsFromPoint(e.clientX, e.clientY);
    
    // 找到带有data-card-id属性的元素
    for (const element of elementsUnderMouse) {
      const cardId = element.getAttribute('data-card-id');
      if (cardId && parseInt(cardId) !== id && dragData.draggedCardId === id) {
        console.log(`检测到鼠标悬停在卡片 ${cardId} 上, 当前拖动卡片: ${id}`);
        onDragEnter(parseInt(cardId));
        return;
      }
    }
    
    // 如果没有找到其他卡片，但之前有悬停的卡片，则触发离开事件
    if (dragData.hoveredCardId !== null && dragData.draggedCardId === id) {
      onDragLeave();
    }
  };

  // 开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止默认行为
    setLocalDragging(true);
    onDragStart(id);
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
      </div>
    </div>
  );
}

export function TestBlock() {
  // 卡片数据
  const [cards] = useState([
    {
      id: 1,
      title: "思维导图",
      description: "整理和组织想法的可视化工具",
      color: "bg-blue-400"
    },
    {
      id: 2,
      title: "日程计划",
      description: "管理时间和安排任务的工具",
      color: "bg-green-400"
    },
    {
      id: 3,
      title: "笔记本",
      description: "记录灵感和重要信息",
      color: "bg-yellow-400"
    },
    {
      id: 4,
      title: "待办事项",
      description: "追踪需要完成的任务",
      color: "bg-red-400"
    },
    {
      id: 5,
      title: "文件管理",
      description: "组织和存储重要文档",
      color: "bg-purple-400"
    },
    {
      id: 6,
      title: "知识库",
      description: "积累和分享知识的平台",
      color: "bg-indigo-400"
    },
    {
      id: 7,
      title: "统计分析",
      description: "数据可视化和趋势分析",
      color: "bg-pink-400"
    }
  ]);

  // 全局拖拽状态
  const [dragData, setDragData] = useState<DragData>({
    isDragging: false,
    draggedCardId: null,
    hoveredCardId: null
  });

  // 添加调试输出，监控全局状态变化
  useEffect(() => {
    console.log("全局拖拽状态变化:", {
      isDragging: dragData.isDragging,
      draggedCardId: dragData.draggedCardId,
      hoveredCardId: dragData.hoveredCardId
    });
  }, [dragData]);

  // 监控拖拽事件，记录全局拖拽状态，使其在卡片间共享
  const handleDragStart = (cardId: number) => {
    setDragData(prev => ({
      ...prev,
      isDragging: true,
      draggedCardId: cardId
    }));
    console.log(`全局状态更新: 开始拖动卡片 ${cardId}`);
  };

  const handleDragEnd = () => {
    console.log(`全局状态更新: 结束拖动状态`);
    setDragData({
      isDragging: false,
      draggedCardId: null,
      hoveredCardId: null
    });
  };

  const handleDragEnter = (cardId: number) => {
    if (dragData.isDragging && dragData.draggedCardId !== cardId) {
      setDragData(prev => ({
        ...prev,
        hoveredCardId: cardId
      }));
      console.log(`全局状态更新: 卡片 ${dragData.draggedCardId} 进入卡片 ${cardId}`);
    }
  };

  const handleDragLeave = () => {
    console.log(`全局状态更新: 清除悬停目标`);
    setDragData(prev => ({
      ...prev,
      hoveredCardId: null
    }));
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg h-full overflow-hidden">
      <h2 className="text-xl font-bold mb-6">功能卡片 <span className="text-sm font-normal text-gray-500">(拖动卡片移动，双击还原位置)</span></h2>
      
      <p className="text-sm text-gray-600 mb-4">
        提示: 将一个卡片拖入另一个卡片区域查看交互效果
      </p>

      {/* 当前拖拽状态显示 */}
      <div className="bg-white px-3 py-2 rounded mb-4 text-xs text-gray-700">
        <p>拖拽状态: {dragData.isDragging ? "拖动中" : "未拖动"}</p>
        <p>拖动卡片: {dragData.draggedCardId || "无"}</p>
        <p>悬停卡片: {dragData.hoveredCardId || "无"}</p>
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

