import React from "react";
import { cn } from "@/lib/utils";

interface ComingSoonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * 是否显示 "WIP" 角标
   * @default false
   */
  showBadge?: boolean;
}

/**
 * 建设中组件包装器
 * 
 * 用于包裹未开发完成的功能模块。
 * 
 * 特性：
 * 1. 拦截所有点击事件
 * 2. 鼠标悬停显示 "🚧" 施工中光标
 * 3. 内部元素视觉降级（透明度、灰度）
 * 4. 内部元素交互禁用（无 Hover 效果）
 */
export function ComingSoon({ 
  children, 
  className, 
  showBadge = false, 
  ...props 
}: ComingSoonProps) {
  // 自定义光标：使用 SVG Data URI 避免外部资源依赖
  // 这里使用一个 32x32 的 SVG，中心是 🚧 Emoji
  const cursorStyle = {
    cursor: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 24 24%22><text y=%2220%22 font-size=%2220%22>🚧</text></svg>') 16 16, not-allowed"
  };

  return (
    <div
      className={cn(
        "relative inline-flex", // 使用 inline-flex 贴合内容
        "opacity-80 grayscale-[0.3]", // 视觉降级：轻微透明和灰度
        "select-none", // 禁止文本选中
        className
      )}
      style={cursorStyle}
      onClickCapture={(e) => {
        // 捕获并停止任何可能发生的点击事件
        e.preventDefault();
        e.stopPropagation();
      }}
      title="Work In Progress..."
      {...props}
    >
      {/* 
        pointer-events-none 让内部元素对鼠标"隐形"
        1. 内部的 hover/active 样式不会触发
        2. 鼠标事件由外层父容器(当前组件)接收，从而显示自定义光标
      */}
      <div className="pointer-events-none w-full h-full flex">
        {children}
      </div>

      {showBadge && (
        <span className="absolute -top-1.5 -right-1.5 z-50 flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-amber-500 rounded-full shadow-sm border border-white dark:border-zinc-900 pointer-events-none">
          WIP
        </span>
      )}
    </div>
  );
}
