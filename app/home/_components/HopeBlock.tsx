"use client";

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// 定义卡片数据接口
interface CardData {
  id: number;
  title: string;
  description: string;
  color: string;
  children?: CardData[];
}

// 拖放状态接口
interface DndState {
  isDragging: boolean;
  activeId: number | null;
  activeType: 'parent' | 'child' | null;
  parentId?: number; // 子卡片的父级ID
  overId: number | string | null; // 修改类型为 number | string | null
}

// 子卡片组件
function ChildCard({
  card,
  parentId,
  className = '',
  onRelease,
}: {
  card: CardData;
  parentId: number;
  className?: string;
  onRelease?: (childId: number, parentId: number) => void;
}) {
  // 使用dnd-kit的可拖拽钩子
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `child-${card.id}`,
    data: {
      type: 'child',
      parentId,
      card,
    },
  });

  // 使用dnd-kit提供的CSS工具函数创建transform样式
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 'auto' as any,
    transition: isDragging ? 'none' : 'transform 0.2s ease-out, opacity 0.15s ease',
  };

  // 处理释放按钮点击
  const handleReleaseClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (onRelease) {
      onRelease(card.id, parentId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`
        ${card.color} p-2 rounded text-sm shadow-sm relative cursor-grab active:cursor-grabbing
        ${isDragging ? 'shadow-xl z-50' : ''}
        ${className}
      `}
    >
      {/* 卡片ID显示 */}
      <div className="absolute -bottom-3 -left-1 text-[10px] text-gray-700 z-50 bg-white/80 px-0.5 rounded">
        ID:{card.id}
      </div>
      
      {/* 释放按钮 */}
      <div 
        className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors z-20 shadow-sm"
        onClick={handleReleaseClick}
        title="释放为独立卡片"
      >
        ↗
      </div>
      
      <div className="font-medium">{card.title}</div>
      <div className="text-xs mt-1 opacity-80">{card.description}</div>
    </div>
  );
}

// 子卡片容器组件
function ChildCardContainer({ 
  parentId, 
  children, 
  onReleaseChild 
}: { 
  parentId: number, 
  children: CardData[], 
  onReleaseChild: (childId: number, parentId: number) => void 
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {children.map((childCard, index) => (
        <DroppableArea 
          key={childCard.id} 
          id={`child-slot-${parentId}-${index}`}
          className="min-h-[40px]"
        >
          <ChildCard
            card={childCard}
            parentId={parentId}
            onRelease={onReleaseChild}
          />
        </DroppableArea>
      ))}
      {/* 添加一个空的放置区域，用于接收新拖入的子卡片 */}
      <DroppableArea 
        id={`child-slot-${parentId}-${children.length}`}
        className="min-h-[40px] border border-dashed border-gray-300 rounded opacity-50 hover:opacity-100 transition-opacity"
      >
        <div className="h-8 w-full flex items-center justify-center text-xs text-gray-400">
          拖放子卡片至此
        </div>
      </DroppableArea>
    </div>
  );
}

// 可放置区域组件
function DroppableArea({
  id,
  children,
  className = '',
}: {
  id: string | number;
  children: React.ReactNode;
  className?: string;
}) {
  // 使用dnd-kit的可放置钩子
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-blue-500 ring-opacity-75 bg-blue-50/10' : ''}`}
    >
      {children}
    </div>
  );
}

// 父卡片组件
function ParentCard({ card, onReleaseChild }: { 
  card: CardData, 
  onReleaseChild: (childId: number, parentId: number) => void 
}) {
  // 使用dnd-kit的可拖拽钩子
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `parent-${card.id}`,
    data: {
      type: 'parent',
      card,
    },
  });

  // 使用dnd-kit提供的CSS工具函数创建transform样式
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.2s ease',
  };

  return (
    <div className="relative h-full">
      {/* 卡片ID和状态 */}
      <div className="absolute -bottom-4 left-0 text-xs text-gray-500 z-50 bg-white/80 px-1 rounded">
        ID:{card.id}
      </div>
      
      {/* 卡片本体 */}
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className={`
          ${card.color} p-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 h-full
          ${isDragging ? 'shadow-xl z-50' : ''}
        `}
      >
        <h3 className="text-lg font-bold mb-2">{card.title}</h3>
        <p className="text-sm">{card.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs opacity-70">#{card.id}</span>
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            {card.id}
          </div>
        </div>

        {/* 子卡片区域 */}
        {card.children && (
          <div className="mt-4 pt-3 border-t border-white/30">
            <div className="text-xs font-semibold mb-2 flex items-center">
              <span>子卡片</span>
              <span className="ml-1 bg-white/20 text-xs px-1.5 rounded-full">{card.children.length}</span>
            </div>
            <ChildCardContainer 
              parentId={card.id} 
              children={card.children || []} 
              onReleaseChild={onReleaseChild} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 卡片拖动时显示的叠加层
function CardOverlay({ dndState, cards }: { dndState: DndState, cards: CardData[] }) {
  if (!dndState.activeId) return null;

  // 查找激活的卡片数据
  const findCard = (id: number, isChild: boolean): CardData | undefined => {
    if (!isChild) {
      return cards.find(card => card.id === id);
    } else {
      for (const card of cards) {
        const childCard = card.children?.find(child => child.id === id);
        if (childCard) return childCard;
      }
    }
    return undefined;
  };

  const activeCard = findCard(dndState.activeId, dndState.activeType === 'child');

  if (!activeCard) return null;

  // 根据类型渲染不同的拖动叠加层
  return (
    <DragOverlay>
      {dndState.activeType === 'parent' ? (
        <div className={`
          ${activeCard.color} p-4 rounded-lg shadow-xl cursor-grabbing
          transition-all duration-200 opacity-80 w-full
        `}>
          <h3 className="text-lg font-bold mb-2">{activeCard.title}</h3>
          <p className="text-sm">{activeCard.description}</p>
        </div>
      ) : (
        <div className={`
          ${activeCard.color} p-2 rounded text-sm shadow-xl cursor-grabbing opacity-80
        `}>
          <div className="font-medium">{activeCard.title}</div>
          <div className="text-xs mt-1 opacity-80">{activeCard.description}</div>
        </div>
      )}
    </DragOverlay>
  );
}

export function HopeBlock() {
  // 卡片数据
  const [cards, setCards] = useState<CardData[]>([
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
      children: []
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
      children: []
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
      children: []
    },
    {
      id: 7,
      title: "统计分析",
      description: "数据可视化和趋势分析",
      color: "bg-pink-400",
      children: []
    }
  ]);

  // 添加全局放置区，用于将子卡片提升为父卡片
  const { setNodeRef: setMainAreaRef, isOver: isOverMainArea } = useDroppable({
    id: 'droppable-main-area',
  });

  // DnD状态
  const [dndState, setDndState] = useState<DndState>({
    isDragging: false,
    activeId: null,
    activeType: null,
    overId: null,
  });

  // 配置传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 激活距离，避免意外触发
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 处理拖动开始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    
    // 从ID中提取类型和实际ID
    const [type, idStr] = activeId.split('-');
    const id = parseInt(idStr);
    
    setDndState({
      isDragging: true,
      activeId: id,
      activeType: type as 'parent' | 'child',
      parentId: active.data.current?.parentId,
      overId: null,
    });
    
    console.log(`开始拖动${type === 'child' ? '子' : ''}卡片: ${id}`);
  };

  // 处理拖动结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    if (over) {
      const overIdFull = over.id as string;
      // 解析目标ID
      if (overIdFull.startsWith('droppable-')) {
        const targetId = overIdFull.replace('droppable-', '');
        console.log(`拖放到区域: ${targetId}`);
        
        // 这里可以实现卡片的移动逻辑
        // 根据dndState.activeId, dndState.activeType和targetId
        handleCardMove(targetId);
      }
    }
    
    // 重置状态
    setDndState({
      isDragging: false,
      activeId: null,
      activeType: null,
      overId: null,
    });
  };

  // 处理释放子卡片为父卡片的功能
  const handleReleaseChildCard = (childId: number, parentId: number) => {
    const newCards = [...cards];
    
    // 找到子卡片所在的父卡片
    const parentCard = newCards.find(card => card.id === parentId);
    if (!parentCard || !parentCard.children) return;
    
    // 找到要释放的子卡片索引
    const childIndex = parentCard.children.findIndex(child => child.id === childId);
    if (childIndex === -1) return;
    
    // 获取子卡片数据并从父卡片中移除
    const childCard = { ...parentCard.children[childIndex] };
    parentCard.children.splice(childIndex, 1);
    
    // 转换为新的父卡片
    const newParentCard: CardData = {
      id: childCard.id,
      title: childCard.title,
      description: childCard.description,
      color: childCard.color,
      children: [], // 创建空的子卡片数组
    };
    
    // 添加到父卡片数组末尾
    newCards.push(newParentCard);
    
    console.log(`子卡片 ${childId} 释放为父卡片`);
    setCards(newCards);
  };

  // 处理拖动悬停
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (over) {
      const overIdFull = over.id as string;
      if (overIdFull.startsWith('droppable-')) {
        const targetId = overIdFull.replace('droppable-', '');
        setDndState(prev => ({
          ...prev,
          overId: targetId, // 现在类型兼容
        }));
      }
    } else {
      setDndState(prev => ({
        ...prev,
        overId: null,
      }));
    }
  };

  // 处理卡片移动逻辑
  const handleCardMove = (targetIdFull: string) => {
    if (!dndState.activeId || !dndState.activeType) return;
    
    // 检查是否是子卡片排序槽 (child-slot-parentId-index)
    if (targetIdFull.startsWith('child-slot-')) {
      // 处理子卡片排序逻辑
      const parts = targetIdFull.split('-');
      if (parts.length === 4) {
        const targetParentId = parseInt(parts[2]);
        const targetIndex = parseInt(parts[3]);
        
        // 如果是子卡片，且在同一个父卡片内移动
        if (dndState.activeType === 'child' && dndState.parentId === targetParentId) {
          handleChildCardReordering(targetParentId, targetIndex);
          return;
        } 
        // 如果是子卡片，但是从不同父卡片移动过来
        else if (dndState.activeType === 'child' && dndState.parentId !== targetParentId) {
          handleChildCardMoving(targetParentId, targetIndex);
          return;
        }
        // 如果是父卡片被拖入子卡片区域
        else if (dndState.activeType === 'parent') {
          // 可以将父卡片变为目标父卡片的子卡片，并放置在特定位置
          handleParentToChildConversion(targetParentId, targetIndex);
          return;
        }
      }
    }
    
    // 解析目标ID，可能是父卡片或子卡片容器
    let targetType: 'parent' | 'children-container' = 'parent';
    let targetParentId: number | undefined;
    let targetId: number;
    
    if (targetIdFull.includes('-children')) {
      targetType = 'children-container';
      const parts = targetIdFull.split('-');
      targetParentId = parseInt(parts[1]);
      targetId = targetParentId;
    } else {
      const parts = targetIdFull.split('-');
      targetId = parseInt(parts[1]);
    }
    
    // 根据拖动的是父卡片还是子卡片，以及目标不同，执行不同的逻辑
    if (dndState.activeType === 'parent') {
      console.log(`父卡片 ${dndState.activeId} 被放置到 ${targetType}`);
      
      // 如果是自身，不做操作
      if (dndState.activeId === targetId) {
        console.log('不能将卡片放到自身上');
        return;
      }
      
      // 父卡片拖动到另一个父卡片上，成为子卡片
      if (targetType === 'parent' || targetType === 'children-container') {
        const newCards = [...cards];
        
        // 找到源卡片索引和目标卡片
        const sourceIndex = newCards.findIndex(card => card.id === dndState.activeId);
        const targetCard = newCards.find(card => card.id === targetId);
        
        if (sourceIndex !== -1 && targetCard) {
          // 获取源卡片
          const sourceCard = { ...newCards[sourceIndex] };
          
          // 转换为子卡片 (ID保持不变，保留标题、描述和颜色)
          const childCard: CardData = {
            id: sourceCard.id,
            title: sourceCard.title,
            description: sourceCard.description,
            color: sourceCard.color,
            // 如果源卡片有子卡片，保留这些子卡片
            children: sourceCard.children
          };
          
          // 确保目标卡片有children数组
          if (!targetCard.children) {
            targetCard.children = [];
          }
          
          // 将源卡片作为子卡片添加到目标卡片
          targetCard.children.push(childCard);
          
          // 从卡片数组中移除源卡片
          newCards.splice(sourceIndex, 1);
          
          console.log(`父卡片 ${dndState.activeId} 成为了卡片 ${targetId} 的子卡片`);
          setCards(newCards);
        }
      }
    } else if (dndState.activeType === 'child') {
      // 处理子卡片移动到另一个父卡片
      moveChildCardToParent(targetId);
    }
  };

  // 子卡片在同一个父卡片内重新排序
  const handleChildCardReordering = (parentId: number, targetIndex: number) => {
    if (!dndState.activeId || dndState.activeType !== 'child' || dndState.parentId !== parentId) return;
    
    const newCards = [...cards];
    const parentCard = newCards.find(card => card.id === parentId);
    
    if (!parentCard || !parentCard.children) return;
    
    // 查找当前子卡片的索引
    const currentIndex = parentCard.children.findIndex(child => child.id === dndState.activeId);
    if (currentIndex === -1) return;
    
    // 如果拖放到同一位置，不进行操作
    if (currentIndex === targetIndex) return;
    
    // 获取子卡片
    const childCard = parentCard.children[currentIndex];
    
    // 从原位置移除
    parentCard.children.splice(currentIndex, 1);
    
    // 目标索引可能需要调整，因为移除原来的卡片后，索引会变化
    const newTargetIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
    
    // 插入到新位置
    parentCard.children.splice(newTargetIndex, 0, childCard);
    
    console.log(`子卡片 ${dndState.activeId} 在父卡片 ${parentId} 内从位置 ${currentIndex} 移动到位置 ${newTargetIndex}`);
    setCards(newCards);
  };

  // 子卡片从一个父卡片移动到另一个父卡片的特定位置
  const handleChildCardMoving = (targetParentId: number, targetIndex: number) => {
    if (!dndState.activeId || dndState.activeType !== 'child' || !dndState.parentId) return;
    
    const newCards = [...cards];
    
    // 查找源父卡片和目标父卡片
    const sourceParentCard = newCards.find(card => card.id === dndState.parentId);
    const targetParentCard = newCards.find(card => card.id === targetParentId);
    
    if (!sourceParentCard || !sourceParentCard.children || !targetParentCard) return;
    
    // 确保目标父卡片有children数组
    if (!targetParentCard.children) {
      targetParentCard.children = [];
    }
    
    // 查找子卡片
    const childIndex = sourceParentCard.children.findIndex(child => child.id === dndState.activeId);
    if (childIndex === -1) return;
    
    // 获取子卡片并从源父卡片中移除
    const childCard = { ...sourceParentCard.children[childIndex] };
    sourceParentCard.children.splice(childIndex, 1);
    
    // 处理目标索引
    const actualTargetIndex = Math.min(targetIndex, targetParentCard.children.length);
    
    // 添加到目标父卡片的指定位置
    targetParentCard.children.splice(actualTargetIndex, 0, childCard);
    
    console.log(`子卡片 ${dndState.activeId} 从父卡片 ${dndState.parentId} 移动到父卡片 ${targetParentId} 的位置 ${actualTargetIndex}`);
    setCards(newCards);
  };

  // 父卡片转换为子卡片并放在特定位置
  const handleParentToChildConversion = (targetParentId: number, targetIndex: number) => {
    if (!dndState.activeId || dndState.activeType !== 'parent') return;
    
    const newCards = [...cards];
    
    // 查找源卡片和目标父卡片
    const sourceIndex = newCards.findIndex(card => card.id === dndState.activeId);
    const targetParentCard = newCards.find(card => card.id === targetParentId);
    
    if (sourceIndex === -1 || !targetParentCard) return;
    
    // 获取源卡片
    const sourceCard = { ...newCards[sourceIndex] };
    
    // 确保目标父卡片有children数组
    if (!targetParentCard.children) {
      targetParentCard.children = [];
    }
    
    // 创建子卡片
    const childCard: CardData = {
      id: sourceCard.id,
      title: sourceCard.title,
      description: sourceCard.description,
      color: sourceCard.color,
      children: sourceCard.children
    };
    
    // 处理目标索引
    const actualTargetIndex = Math.min(targetIndex, targetParentCard.children.length);
    
    // 添加到目标父卡片的指定位置
    targetParentCard.children.splice(actualTargetIndex, 0, childCard);
    
    // 从卡片数组中移除源卡片
    newCards.splice(sourceIndex, 1);
    
    console.log(`父卡片 ${dndState.activeId} 转换为子卡片并添加到父卡片 ${targetParentId} 的位置 ${actualTargetIndex}`);
    setCards(newCards);
  };

  // 将子卡片移动到另一个父卡片（追加到末尾）
  const moveChildCardToParent = (targetParentId: number) => {
    if (!dndState.activeId || dndState.activeType !== 'child' || !dndState.parentId) return;
    
    const newCards = [...cards];
    
    // 查找源父卡片和目标父卡片
    const sourceParentCard = newCards.find(card => card.id === dndState.parentId);
    const targetParentCard = newCards.find(card => card.id === targetParentId);
    
    if (!sourceParentCard || !sourceParentCard.children || !targetParentCard) return;
    
    // 如果是同一个父卡片，不做操作
    if (dndState.parentId === targetParentId) {
      console.log(`子卡片 ${dndState.activeId} 保持在原父卡片`);
      return;
    }
    
    // 确保目标父卡片有children数组
    if (!targetParentCard.children) {
      targetParentCard.children = [];
    }
    
    // 查找子卡片
    const childIndex = sourceParentCard.children.findIndex(child => child.id === dndState.activeId);
    if (childIndex === -1) return;
    
    // 获取子卡片并从源父卡片中移除
    const childCard = { ...sourceParentCard.children[childIndex] };
    sourceParentCard.children.splice(childIndex, 1);
    
    // 添加到目标父卡片
    targetParentCard.children.push(childCard);
    
    console.log(`子卡片 ${dndState.activeId} 从父卡片 ${dndState.parentId} 移动到父卡片 ${targetParentId}`);
    setCards(newCards);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      // 使用内置的碰撞检测算法
      collisionDetection={closestCenter}
    >
      {/* 使用div包裹整个区域，作为全局放置区 */}
      <div 
        ref={setMainAreaRef} 
        className={`h-[1500px] mb-[20px] bg-gray-100 p-6 rounded-lg  overflow-hidden relative ${isOverMainArea && dndState.activeType === 'child' ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
      >
        {isOverMainArea && dndState.activeType === 'child' && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md text-sm animate-pulse">
              放置此处将子卡片提升为父卡片
            </div>
          </div>
        )}
      
        <h2 className="text-xl font-bold mb-6">功能卡片 <span className="text-sm font-normal text-gray-500">(使用dnd-kit实现拖放)</span></h2>
        
        <p className="text-sm text-gray-600 mb-4">
          提示: 将父卡片拖入另一个父卡片区域可以将其转换为子卡片，子卡片可以在父卡片间移动
        </p>
        <p className="text-sm text-gray-600 mb-4">
          提示: 点击子卡片右上角的释放按钮，可以将子卡片直接转为独立的父卡片
        </p>
        <p className="text-sm text-gray-600 mb-4">
          提示: 子卡片可以在同一父卡片内拖拽排序，调整显示顺序
        </p>

        {/* 当前拖拽状态显示 */}
        <div className="bg-white px-3 py-2 rounded mb-4 text-xs text-gray-700">
          <p>拖拽状态: {dndState.isDragging ? "拖动中" : "未拖动"}</p>
          <p>拖动卡片: {dndState.activeId || "无"}{dndState.activeType === 'child' ? " (子卡片)" : ""}</p>
          <p>悬停位置: {dndState.overId || "无"}</p>
        </div>

        {/* 卡片统计信息 */}
        <div className="bg-white/70 px-3 py-2 rounded mb-4 text-xs text-gray-700 flex space-x-4">
          <p>主卡片数量: {cards.length}</p>
          <p>子卡片总数: {cards.reduce((sum, card) => sum + (card.children?.length || 0), 0)}</p>
        </div>

        {/* 卡片网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {cards.map((card) => (
            <DroppableArea key={card.id} id={`parent-${card.id}`} className="h-full">
              <ParentCard card={card} onReleaseChild={handleReleaseChildCard} />
            </DroppableArea>
          ))}
        </div>
      </div>

      {/* 拖动叠加层 */}
      <CardOverlay dndState={dndState} cards={cards} />
    </DndContext>
  );
}
