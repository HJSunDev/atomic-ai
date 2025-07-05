"use client";

/**
 * @name ScrollView
 * @description
 * 一个高度可定制的、支持自定义滚动条的滚动容器组件。
 * 它隐藏了原生的滚动条，并渲染一个美观、可配置的自定义滚动条。
 * 
 * @使用说明
 * 
 * 1. 基本用法:
 *    直接包裹您的可滚动内容即可。
 *    <ScrollView className="h-64">
 *      <div>...大量内容...</div>
 *    </ScrollView>
 * 
 * 2. 自定义滚动条样式:
 *    通过 `scrollbarConfig` prop 来调整滚动条的外观和行为。
 *    <ScrollView 
 *      className="h-64"
 *      scrollbarConfig={{
 *        thumbWidth: 6,
 *        thumbColor: "rgba(255, 0, 0, 0.5)",
 *        autoHide: false
 *      }}
 *    >
 *      <div>...内容...</div>
 *    </ScrollView>
 * 
 * 3. 更改根元素标签:
 *    默认渲染为 `<div>`，可以使用 `as` prop 更改为其他HTML标签，如 'main', 'section'。
 *    <ScrollView as="section">
 *      ...
 *    </ScrollView>
 * 
 * 4. 高级用法：通过 ref 控制滚动:
 *    该组件使用 `forwardRef`，允许父组件获取其根元素的引用，并进一步控制内部滚动。
 * 
 *    function ParentComponent() {
 *      const scrollRef = useRef<HTMLElement>(null);
 * 
 *      const scrollToTop = () => {
 *        if (scrollRef.current) {
 *          // 可滚动的容器是根元素的第一个子元素
 *          const scrollableContent = scrollRef.current.firstChild as HTMLElement;
 *          if (scrollableContent) {
 *            scrollableContent.scrollTo({ top: 0, behavior: 'smooth' });
 *          }
 *        }
 *      };
 * 
 *      return (
 *        <>
 *          <Button onClick={scrollToTop}>滚动到顶部</Button>
 *          <ScrollView ref={scrollRef} className="h-96">
 *            <div>...大量内容...</div>
 *          </ScrollView>
 *        </>
 *      );
 *    }
 */

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
    const contentWrapperRef = useRef<HTMLDivElement>(null); // 内容包装器引用 - 用于监听内容尺寸变化
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

    /**
     * @description 核心计算函数：根据内容滚动状态，更新滚动条的尺寸和位置
     * 这是同步UI状态和DOM状态的关键。它会被多种操作触发（如内容滚动、窗口大小变化）。
     * 1. 计算滑块的高度：内容越长，滑块越短。
     * 2. 计算滑块的位置：根据内容的 scrollTop 来同步定位。
     * 3. 决定是否需要显示滚动条。
     */
    const updateScrollbar = useCallback(() => {
      // 获取容器和内容元素的引用
      const container = containerRef.current;
      const content = contentRef.current;
      // 如果容器或内容元素不存在，则直接返回
      if (!container || !content) return;

      // 获取容器高度、内容总高度、当前滚动位置
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

      // 计算滚动条滑块高度
      // 公式：滑块高度 = max(容器高度比例 × 容器高度, 最小滑块高度)
      // 其中容器高度比例 = 容器高度 / 内容总高度
      const thumbH = Math.max(
        (containerHeight / contentHeight) * containerHeight,
        config.minThumbSize
      );
      setThumbHeight(thumbH);

      // 计算滚动条滑块位置
      const maxScrollTop = contentHeight - containerHeight;  // 内容可滚动的最大距离
      const scrollRatio = scrollTop / maxScrollTop;  // 当前滚动位置占总可滚动距离的比例
      const maxThumbTop = containerHeight - thumbH;  // 滑块在轨道中的最大可移动距离
      const thumbT = scrollRatio * maxThumbTop;  // 根据滚动比例计算滑块当前位置
      setThumbTop(thumbT);
    }, [config.minThumbSize]);

    /**
     * @description 工具函数：安排一个延迟任务来隐藏滚动条
     * 仅在 `autoHide` 配置启用时生效。
     * 它会设置一个计时器，如果在计时器结束前没有其他交互（如鼠标悬停），滚动条就会被隐藏。
     * 任何新的滚动或鼠标悬停都会重置这个计时器。
     */
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

    /**
     * @description 场景一: 内容区域滚动 -> 更新滚动条位置
     * 当用户通过鼠标滚轮、触摸板等方式直接滚动内容区域时触发。
     * 这个函数会调用 updateScrollbar 来同步自定义滚动条滑块的位置，并根据配置处理自动隐藏。
     */
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

    /**
     * @description 用户体验增强：处理鼠标进入容器
     * 当鼠标悬停在滚动区域上时，强制显示滚动条，并取消任何待处理的"自动隐藏"任务，
     * 以便用户可以方便地找到并使用滚动条。
     */
    const handleMouseEnter = useCallback(() => {
      // 设置鼠标悬停状态为 true
      setIsHovering(true);
      // 鼠标进入时总是显示滚动条
      setShowScrollbar(true); 
      // 只有启用自动隐藏时才需要取消隐藏定时器
      if (config.autoHide && hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }, [config.autoHide]);

    /**
     * @description 用户体验增强：处理鼠标离开容器
     * 当鼠标离开滚动区域时，如果启用了自动隐藏功能且用户当前没有在拖拽滑块，
     * 则调用 `scheduleHide` 来安排一个延迟任务以隐藏滚动条。
     */
    const handleMouseLeave = useCallback(() => {
      setIsHovering(false);
      // 只有启用自动隐藏且不在拖拽状态时，才安排隐藏滚动条
      if (config.autoHide && !isDragging) {
        scheduleHide();
      }
    }, [isDragging, scheduleHide, config.autoHide]);

    /**
     * @description 场景二: 拖动滚动条 -> 更新内容滚动位置 (步骤1: 开始拖拽)
     * 当用户在自定义滚动条的滑块上按下鼠标时触发。
     * 1. 阻止默认行为（如选中文本）。
     * 2. 进入"拖拽中"状态 (`isDragging = true`)。
     * 3. 记录拖拽的起始点信息（鼠标Y坐标、当前内容的滚动位置），为后续计算做准备。
     */
    const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
      // 阻止默认事件
      e.preventDefault();
      // 设置拖拽状态为 true
      setIsDragging(true);
      // 记录拖拽开始时的鼠标位置和滚动位置
      setDragStartY(e.clientY);
      setDragStartScrollTop(contentRef.current?.scrollTop || 0);
    }, []);

    /**
     * @description 场景二: 拖动滚动条 -> 更新内容滚动位置 (步骤2 & 3: 处理过程与结束)
     * 这个 useEffect 只在 `isDragging` 状态为 true 时激活，用于处理滚动条的拖拽过程。
     * - `handleGlobalMouseMove`: 在整个文档上监听鼠标移动。根据鼠标移动的距离，反向计算出内容区域应该滚动到的新位置，并更新 `contentRef.current.scrollTop`。
     * - `handleGlobalMouseUp`: 在整个文档上监听鼠标释放事件，以结束拖拽状态。
     */
    useEffect(() => {
      // 处理拖拽过程中的鼠标移动
      const handleGlobalMouseMove = (e: MouseEvent) => {
        // 如果不在拖拽状态或内容区域不存在或容器区域不存在，则直接返回
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
      // 获取内容区域的 DOM 引用
      const content = contentRef.current;
      // 如果内容区域不存在，则直接返回
      if (!content) return;

      // 监听内容区域的滚动事件
      content.addEventListener('scroll', handleScroll, { passive: true });
      // 组件卸载时移除滚动事件监听器
      return () => content.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // 监听窗口大小变化，重新计算滚动条
    useEffect(() => {
      const handleResize = () => updateScrollbar();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [updateScrollbar]);

    // 使用 ResizeObserver 监听内容包装器尺寸变化
    useEffect(() => {
      const contentWrapperEl = contentWrapperRef.current;
      if (!contentWrapperEl) return;

      // 当内容尺寸变化时，调用 updateScrollbar
      const observer = new ResizeObserver(() => {
        updateScrollbar();
      });

      // 开始观察内容包装器元素
      observer.observe(contentWrapperEl);

      // 组件卸载时，停止观察
      return () => observer.disconnect();
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

    /**
     * @description
     * 使用 React 的 "回调 ref" (Callback Ref) 机制来创建一个桥梁函数。
     * 这个函数会被 React 自动调用，而不是由我们手动执行。
     * 
     * @React回调ref约定
     * 1. 当 ref={handleRef} 所应用的组件被挂载到 DOM 时，React 会调用 handleRef(domNode)。
     * 2. 当该组件从 DOM 卸载时，React 会调用 handleRef(null)。
     * 
     * @功能
     * 此函数如同一个 "Y型分线器"，将同一个 DOM 节点的引用分发到两个地方：
     * 1. 组件内部的 `containerRef`，用于实现滚动逻辑。
     * 2. 从父组件通过 `forwardRef` 传递进来的 `ref`，以供父组件使用。
     */
    const handleRef = useCallback((node: HTMLElement | null) => {
      // 对内：将 DOM 节点的引用赋值给组件内部使用的 ref (containerRef)。
      // 组件自身的滚动逻辑依赖于这个 ref 来获取容器尺寸等信息。
      containerRef.current = node;

      // 对外：同时，将同一个 DOM 节点的引用转发给从父组件传递过来的 ref。
      // 这是实现 forwardRef 功能的核心。
      if (typeof ref === 'function') {
        // 如果父组件传递的 ref 是一个函数（也是一个回调 ref），则直接调用它。
        ref(node);
      } else if (ref) {
        // 如果父组件传递的 ref 是一个由 useRef() 创建的对象，则更新其 .current 属性。
        ref.current = node;
      }
    }, [ref]); // 依赖于从外部传入的 ref

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
          <div ref={contentWrapperRef}>{children}</div>
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

// 设置组件在 React DevTools 中显示的名称。
// 这对于调试非常有用，特别是对于使用 `React.forwardRef` 创建的组件，
// 它可以避免在开发者工具中显示为 "Anonymous" 或 "ForwardRef"。
ScrollView.displayName = "ScrollView"; 