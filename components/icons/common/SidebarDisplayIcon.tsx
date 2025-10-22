"use client";

import React from 'react';

interface SidebarDisplayIconProps {
  /** 自定义CSS类名 */
  className?: string;
  /** 图标尺寸，默认为20 */
  size?: number;
  /** 图标颜色，默认使用currentColor */
  color?: string;
}

/**
 * 侧边栏显示模式图标组件
 *
 * 表示文档在侧边栏中显示的模式图标，包含一个矩形边框和右侧的填充区域。
 * 设计灵感来源于常见的侧边栏布局UI模式。
 */
export const SidebarDisplayIcon: React.FC<SidebarDisplayIconProps> = ({
  className = '',
  size = 20,
  color = "currentColor"
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ minWidth: `${size}px`, minHeight: `${size}px` }}
    >
      {/* 外边框矩形 */}
      <rect
        x="2.375"
        y="4.125"
        width="15.25"
        height="11.75"
        rx="2.125"
        ry="2.125"
        fill="none"
        stroke={color}
        strokeWidth="1.25"
      />
      {/* 右侧填充区域，表示内容区 */}
      <rect
        x="10.392"
        y="6.125"
        width="4.683"
        height="7.75"
        fill={color}
      />
    </svg>
  );
};
