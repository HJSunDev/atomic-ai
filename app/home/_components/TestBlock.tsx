"use client";

import { useState, useRef, useEffect } from "react";

// 可拖动卡片组件
function DraggableCard({ id, title, description, color }: { 
  id: number; 
  title: string; 
  description: string;
  color: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  // 添加一个状态来保存卡片的原始尺寸
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  // 组件挂载时获取卡片尺寸
  useEffect(() => {
    if (cardRef.current) {
      const updateCardSize = () => {
        setCardSize({
          width: cardRef.current?.offsetWidth || 0,
          height: cardRef.current?.offsetHeight || 0
        });
      };
      
      updateCardSize();
      // 监听窗口大小变化，更新卡片尺寸
      window.addEventListener('resize', updateCardSize);
      return () => window.removeEventListener('resize', updateCardSize);
    }
  }, []);

  // 开始拖动
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止默认行为
    setIsDragging(true);
    
    // 记录鼠标按下时的位置
    setStartPos({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  // 拖动中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    // 计算新位置
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    
    setPosition({ x: newX, y: newY });
  };

  // 拖动结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 重置位置
  const handleDoubleClick = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative">
      {/* 当卡片被拖动时显示的占位符 */}
      {isDragging && (
        <div 
          className="absolute top-0 left-0 border-2 border-dashed border-gray-500 rounded-lg bg-gray-100/30"
          style={{
            width: `${cardSize.width}px`,
            height: `${cardSize.height}px`,
            zIndex: 10,
          }}
        />
      )}
      <div 
        ref={cardRef}
        className={`${color} p-4 rounded-lg shadow-md ${isDragging ? 'shadow-xl z-50' : ''} cursor-grab active:cursor-grabbing`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
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

export function TestBlock(){
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

  return (
    <div className="bg-gray-100 p-6 rounded-lg h-full overflow-hidden">
      <h2 className="text-xl font-bold mb-6">功能卡片 <span className="text-sm font-normal text-gray-500">(拖动卡片移动，双击还原位置)</span></h2>
      
      {/* 响应式网格布局 - 设置相对定位使拖动效果更好 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {cards.map((card) => (
          <DraggableCard 
            key={card.id}
            id={card.id}
            title={card.title}
            description={card.description}
            color={card.color}
          />
        ))}
      </div>
    </div>
  );
}

