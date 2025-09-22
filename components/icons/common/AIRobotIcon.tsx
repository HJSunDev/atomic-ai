"use client";

import React from 'react';

interface AIRobotIconProps {
  /** 自定义CSS类名 */
  className?: string;
  /** 图标尺寸，默认为16 */
  size?: number;
  /** 图标颜色，默认使用currentColor */
  color?: string;
  /** 线条粗细，默认为2 */
  strokeWidth?: number;
}

/**
 * AI机器人图标组件
 * 
 * 采用线性风格设计的AI机器人图标，包含机器人头部、天线、眼睛、嘴巴和腿部。
 * 支持自定义尺寸、颜色和线条粗细。
 */
export const AIRobotIcon: React.FC<AIRobotIconProps> = ({ 
  className = '', 
  size = 16,
  color = "currentColor",
  strokeWidth = 2
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      style={{ minWidth: `${size}px`, minHeight: `${size}px` }}
    >
      {/* 机器人头部 */}
      <rect x="4" y="8" width="16" height="12" rx="2" ry="2" />
      
      {/* 机器人天线 */}
      <path d="M12 4v4" />
      <circle cx="12" cy="3" r="1" />
      
      {/* 机器人眼睛 */}
      <circle cx="9" cy="13" r="1.5" />
      <circle cx="15" cy="13" r="1.5" />
      
      {/* 机器人嘴巴 */}
      <path d="M9 17h6" />
      
      {/* 机器人腿部 */}
      <path d="M8 20v1" />
      <path d="M16 20v1" />
    </svg>
  );
};