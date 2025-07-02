"use client";

import React, { useRef, useState, useEffect, useCallback, forwardRef } from "react";
import { cn } from "@/lib/utils";

// 滚动条配置接口
interface ScrollbarConfig {
  /** 滚动条滑块宽度 (px) */
  thumbWidth?: number;
  /** 滚动条滑块颜色 */
  thumbColor?: string;
  /** 滚动条轨道颜色 */
  trackColor?: string;
  /** 滑块圆角 (px) */
  thumbRadius?: number;
  /** 是否自动隐藏滚动条 */
  autoHide?: boolean;
  /** 自动隐藏延迟时间 (ms) */
  hideDelay?: number;
  /** 悬停时透明度 */
  hoverOpacity?: number;
  /** 静止时透明度 */
  restOpacity?: number;
  /** 最小滑块高度 (px) */
  minThumbSize?: number;
}

// 组件Props接口
interface ScrollViewProps extends React.HTMLAttributes<HTMLElement> {
  /** 要渲染的HTML标签名 */
  as?: React.ElementType;
  /** 滚动条配置 */
  scrollbarConfig?: ScrollbarConfig;
  /** 子元素 */
  children?: React.ReactNode;
}

// 默认配置
const defaultConfig: Required<ScrollbarConfig> = {
  // 滚动条滑块的宽度，单位为像素
  thumbWidth: 4,
  // 滚动条滑块的颜色，使用半透明灰色
  thumbColor: "rgba(156, 163, 175, 0.6)",
  // 滚动条轨道的颜色，设置为透明
  trackColor: "transparent",
  // 滚动条滑块的圆角半径，单位为像素
  thumbRadius: 8,
  // 是否启用滚动条自动隐藏功能
  autoHide: true,
  // 滚动条自动隐藏的延迟时间，单位为毫秒
  hideDelay: 800,
  // 鼠标悬停时滚动条的透明度
  hoverOpacity: 0.9,
  // 静止状态下滚动条的透明度
  restOpacity: 0.5,
  // 滚动条滑块的最小高度，防止滑块过小难以操作
  minThumbSize: 20,
};

export const ScrollView = forwardRef<HTMLElement, ScrollViewProps>(
  ({ as: Component = "div", scrollbarConfig = {}, className, children, ...props }, ref) => {
    // 合并用户配置和默认配置
    const config = { ...defaultConfig, ...scrollbarConfig };
    
    // DOM元素引用
    const containerRef = useRef<HTMLElement>(null);  // 容器元素引用
    const contentRef = useRef<HTMLDivElement>(null);  // 内容区域引用
    const verticalThumbRef = useRef<HTMLDivElement>(null);  // 滚动条滑块引用

    // 组件状态管理
    const [showScrollbar, setShowScrollbar] = useState(false);  // 是否显示滚动条
    const [isHovering, setIsHovering] = useState(false);  // 鼠标是否悬停在容器上
    const [isDragging, setIsDragging] = useState(false);  // 是否正在拖拽滚动条
    const [thumbHeight, setThumbHeight] = useState(0);  // 滚动条滑块高度
    const [thumbTop, setThumbTop] = useState(0);  // 滚动条滑块顶部位置
    const [dragStartY, setDragStartY] = useState(0);  // 拖拽开始时的鼠标Y坐标
    const [dragStartScrollTop, setDragStartScrollTop] = useState(0);  // 拖拽开始时的滚动位置

    // 自动隐藏定时器引用
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 更新滚动条位置和大小
    const updateScrollbar = useCallback(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      // 获取容器和内容的尺寸信息
      const containerHeight = container.clientHeight;
      const contentHeight = content.scrollHeight;
      const scrollTop = content.scrollTop;

      // 如果内容高度小于等于容器高度，不需要滚动条
      if (contentHeight <= containerHeight) {
        setShowScrollbar(false);
        return;
      }

      // 无论是否自动隐藏，只要内容需要滚动就应该能够显示滚动条
      // 隐藏逻辑由其他函数处理
      setShowScrollbar(true);

      // 计算滚动条滑块高度：容器高度比例 × 容器高度，但不小于最小高度
      const thumbH = Math.max(
        (containerHeight / contentHeight) * containerHeight,
        config.minThumbSize
      );
      setThumbHeight(thumbH);

      // 计算滚动条滑块位置
      const maxScrollTop = contentHeight - containerHeight;  // 最大滚动距离
      const scrollRatio = scrollTop / maxScrollTop;  // 当前滚动比例
      const maxThumbTop = containerHeight - thumbH;  // 滑块最大顶部位置
      const thumbT = scrollRatio * maxThumbTop;  // 滑块实际顶部位置
      setThumbTop(thumbT);
    }, [config.minThumbSize, config.autoHide]);

    // 安排滚动条自动隐藏
    const scheduleHide = useCallback(() => {
      // 如果禁用自动隐藏或正在拖拽，则不隐藏
      if (!config.autoHide || isDragging) return;
      
      // 清除之前的定时器
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // 设置新的隐藏定时器
      hideTimeoutRef.current = setTimeout(() => {
        if (!isHovering && !isDragging) {
          setShowScrollbar(false);
        }
      }, config.hideDelay);
    }, [config.autoHide, config.hideDelay, isHovering, isDragging]);

    // 处理滚动事件
    const handleScroll = useCallback(() => {
      // 更新滚动条位置
      updateScrollbar();
      // 滚动时总是显示滚动条
      setShowScrollbar(true);
      // 只有启用自动隐藏时才安排隐藏
      if (config.autoHide) {
        scheduleHide();
      }
    }, [updateScrollbar, scheduleHide, config.autoHide]);

    // 处理鼠标进入容器事件
    const handleMouseEnter = useCallback(() => {
      setIsHovering(true);
      // 鼠标进入时总是显示滚动条
      setShowScrollbar(true);
      // 只有启用自动隐藏时才需要取消隐藏定时器
      if (config.autoHide && hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }, [config.autoHide]);

    // 处理鼠标离开容器事件
    const handleMouseLeave = useCallback(() => {
      setIsHovering(false);
      // 只有启用自动隐藏且不在拖拽状态时，才安排隐藏滚动条
      if (config.autoHide && !isDragging) {
        scheduleHide();
      }
    }, [isDragging, scheduleHide, config.autoHide]);

    // 处理滚动条滑块鼠标按下事件
    const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      // 记录拖拽开始时的鼠标位置和滚动位置
      setDragStartY(e.clientY);
      setDragStartScrollTop(contentRef.current?.scrollTop || 0);
    }, []);

    // 处理全局鼠标移动和释放事件（用于拖拽滚动条）
    useEffect(() => {
      // 处理拖拽过程中的鼠标移动
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDragging || !contentRef.current || !containerRef.current) return;

        // 计算鼠标移动的距离
        const deltaY = e.clientY - dragStartY;
        const container = containerRef.current;
        const content = contentRef.current;
        const containerHeight = container.clientHeight;
        const contentHeight = content.scrollHeight;
        const maxScrollTop = contentHeight - containerHeight;
        const maxThumbTop = containerHeight - thumbHeight;
        
        // 将鼠标移动距离转换为滚动距离
        const scrollRatio = deltaY / maxThumbTop;
        const newScrollTop = Math.max(0, Math.min(
          dragStartScrollTop + scrollRatio * maxScrollTop,
          maxScrollTop
        ));
        
        // 应用新的滚动位置
        content.scrollTop = newScrollTop;
      };

      // 处理拖拽结束
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        // 只有启用自动隐藏且鼠标不在容器内时，才安排隐藏滚动条
        if (config.autoHide && !isHovering) {
          scheduleHide();
        }
      };

      // 只在拖拽状态时添加全局事件监听器
      if (isDragging) {
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleGlobalMouseMove);
          document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
      }
    }, [isDragging, dragStartY, dragStartScrollTop, thumbHeight, isHovering, scheduleHide, config.autoHide]);

    // 监听内容区域的滚动事件
    useEffect(() => {
      const content = contentRef.current;
      if (!content) return;

      content.addEventListener('scroll', handleScroll, { passive: true });
      return () => content.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // 监听窗口大小变化，重新计算滚动条
    useEffect(() => {
      const handleResize = () => updateScrollbar();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [updateScrollbar]);

    // 组件挂载时初始化滚动条
    useEffect(() => {
      updateScrollbar();
      // 如果启用自动隐藏，初始化后安排隐藏
      if (config.autoHide) {
        scheduleHide();
      }
    }, [updateScrollbar, config.autoHide, scheduleHide]);

    // 组件卸载时清理定时器
    useEffect(() => {
      return () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }, []);

    // 处理ref转发
    const handleRef = useCallback((node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    // 返回组件
    return (
      <Component
        ref={handleRef}
        className={cn("relative", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* 内容区域 - 隐藏原生滚动条但保持滚动功能 */}
        <div
          ref={contentRef}
          className="h-full w-full overflow-auto"
          style={{ 
            scrollbarWidth: 'none',  // Firefox
            msOverflowStyle: 'none'  // IE/Edge
          }}
        >
          {children}
        </div>

        {/* 自定义垂直滚动条 */}
        <div
          className="absolute top-0 right-0 h-full transition-opacity duration-200"
          style={{
            width: config.thumbWidth + 4,  // 滚动条轨道宽度（滑块宽度 + 左右间距）
            backgroundColor: config.trackColor,
            opacity: showScrollbar ? 1 : 0,  // 根据状态控制显隐
            pointerEvents: showScrollbar ? 'auto' : 'none',  // 隐藏时禁用鼠标事件
            zIndex: 1000,  // 确保滚动条在最上层
          }}
        >
          {/* 滚动条滑块 */}
          <div
            ref={verticalThumbRef}
            className="absolute right-0 transition-all duration-150 ease-out"
            style={{
              width: config.thumbWidth,
              height: thumbHeight,
              top: thumbTop,
              backgroundColor: config.thumbColor,
              borderRadius: config.thumbRadius,
              // 根据拖拽和悬停状态调整透明度
              opacity: isDragging ? config.hoverOpacity : (isHovering ? config.hoverOpacity : config.restOpacity),
            }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>
      </Component>
    );
  }
);

ScrollView.displayName = "ScrollView"; 