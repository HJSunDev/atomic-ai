"use client";

import { useState, useEffect } from "react";
// 拖拽排序相关核心功能导入
import { 
  // 拖拽上下文容器，提供拖拽功能的核心环境
  DndContext,
  // 计算最近中心点的碰撞检测策略
  closestCenter,
  // 拖拽结束事件类型
  DragEndEvent 
} from "@dnd-kit/core";

// 排序功能相关工具导入
import {
  // 可排序元素容器上下文
  SortableContext,
  // 垂直列表排序布局策略
  verticalListSortingStrategy,
  // 使元素可排序的React Hook
  useSortable,
  // 网格布局排序策略
  rectSortingStrategy,
  // 数组元素位置交换工具
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 列表布局可排序的项目组件
function SortableItem({ id }: { id: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-full h-10 bg-red-200 flex items-center justify-center cursor-move rounded-md"
    >
      {id}
    </div>
  );
}

// 网格布局的可排序项目组件
function GridSortableItem({ id }: { id: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-24 h-24 bg-blue-200 flex items-center justify-center cursor-move rounded-md"
    >
      {id}
    </div>
  );
}

export function TestBlock() {
  // 为列表视图创建独立状态
  const [listItems, setListItems] = useState([1, 2, 3, 4, 5]);
  // 为网格视图创建独立状态
  const [gridItems, setGridItems] = useState([6, 7, 8, 9, 10]);
  // 添加客户端渲染标志
  const [isClient, setIsClient] = useState(false);

  // 在组件挂载后标记为客户端环境
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 处理列表视图拖拽结束事件
  const handleListDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setListItems((items) => {
        // 查找拖拽项和目标项的索引
        const oldIndex = items.indexOf(active.id as number);
        const newIndex = items.indexOf(over.id as number);

        // 返回重新排序后的数组
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 处理网格视图拖拽结束事件
  const handleGridDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setGridItems((items) => {
        // 查找拖拽项和目标项的索引
        const oldIndex = items.indexOf(active.id as number);
        const newIndex = items.indexOf(over.id as number);

        // 返回重新排序后的数组
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 如果不是客户端环境，显示占位符或空内容
  if (!isClient) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">可拖拽排序列表</h1>
        <div className="flex flex-col gap-2 bg-gray-200 p-4 rounded-lg">
          {/* 列表视图占位符 */}
          {listItems.map((item) => (
            <div
              key={item}
              className="w-full h-10 bg-red-200 flex items-center justify-center rounded-md"
            >
              {item}
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mt-6 mb-3">网格布局拖拽排序</h2>
        <div className="bg-gray-200 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            {/* 网格视图占位符 */}
            {gridItems.map((item) => (
              <div
                key={item}
                className="w-24 h-24 bg-blue-200 flex items-center justify-center rounded-md"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">可拖拽排序列表</h1>

      {/* 列表视图拖拽区域 */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleListDragEnd}
      >
        <div className="flex flex-col gap-2 bg-gray-200 p-4 rounded-lg">
          <SortableContext
            items={listItems}
            strategy={verticalListSortingStrategy}
          >
            {listItems.map((item) => (
              <SortableItem key={item} id={item} />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* 多行多列网格布局的可拖拽排序 */}
      <h2 className="text-lg font-semibold mt-6 mb-3">网格布局拖拽排序</h2>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleGridDragEnd}
      >
        <div className="bg-gray-200 p-4 rounded-lg">
          <SortableContext items={gridItems} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-4">
              {gridItems.map((item) => (
                <GridSortableItem key={item} id={item} />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
