import React from 'react';
import { cn } from '@/lib/utils';

interface TypingCursorProps {
  // 光标类型：竖线、下划线、方块、自定义文本
  type?: 'line' | 'underscore' | 'block' | 'custom';
  // 自定义光标文本（当type为custom时使用）
  customText?: string;
  // 闪烁速度：slow(1.5s), normal(1s), fast(0.5s)
  speed?: 'slow' | 'normal' | 'fast';
  // 光标颜色
  color?: string;
  // 是否显示光标（控制光标的显示/隐藏）
  show?: boolean;
  // 额外的CSS类名
  className?: string;
}

export function TypingCursor({
  type = 'line',
  customText = '●',
  speed = 'normal',
  color = 'currentColor',
  show = true,
  className
}: TypingCursorProps) {
  // 根据速度设置动画持续时间
  const speedMap = {
    slow: '1.5s',
    normal: '1s',
    fast: '0.5s'
  };

  // 根据速度获取对应的CSS类名
  const getAnimationClass = () => {
    switch (speed) {
      case 'slow':
        return 'animate-pulse-cursor-slow';
      case 'fast':
        return 'animate-pulse-cursor-fast';
      default:
        return 'animate-pulse-cursor';
    }
  };

  // 根据类型渲染不同的光标样式
  const renderCursor = () => {
    const animationClass = getAnimationClass();
    const baseStyle = { color };

    switch (type) {
      case 'line':
        return (
          <span
            className={cn(
              'inline-block w-[2px] h-[1.2em] bg-current ml-[2px]',
              animationClass,
              className
            )}
            style={baseStyle}
          />
        );
      
      case 'underscore':
        return (
          <span
            className={cn(
              'inline-block w-[0.8em] h-[3px] bg-current ml-[2px] translate-y-[2px]',
              animationClass,
              className
            )}
            style={baseStyle}
          />
        );
      
      case 'block':
        return (
          <span
            className={cn(
              'inline-block w-[0.5em] h-[1.1em] bg-current ml-[2px]',
              animationClass,
              className
            )}
            style={baseStyle}
          />
        );
      
      case 'custom':
        return (
          <span
            className={cn(
              'inline-block ml-[2px]',
              animationClass,
              className
            )}
            style={baseStyle}
          >
            {customText}
          </span>
        );
      
      default:
        return null;
    }
  };

  // 如果不显示光标，返回null
  if (!show) return null;

  return renderCursor();
}

// 导出一些预设的光标样式组件
export const AICursor = () => (
  <TypingCursor
    type="line"
    speed="normal"
    color="#3b82f6"
    className="bg-blue-500"
  />
);

export const ThinkingCursor = () => (
  <TypingCursor
    type="custom"
    customText="●"
    speed="slow"
    color="#10b981"
    className="text-green-500"
  />
);

export const WritingCursor = () => (
  <TypingCursor
    type="custom"
    customText="✎"
    speed="normal"
    color="#8b5cf6"
    className="text-purple-500"
  />
); 