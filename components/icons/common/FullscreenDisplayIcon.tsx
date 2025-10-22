"use client";

import React from 'react';

interface FullscreenDisplayIconProps {
  /** 自定义CSS类名 */
  className?: string;
  /** 图标尺寸，默认为20 */
  size?: number;
  /** 图标颜色，默认使用currentColor */
  color?: string;
}

/**
 * 全屏显示模式图标组件
 *
 * 表示文档在全屏模式下显示的图标，包含一个矩形边框和几乎占满整个区域的填充内容。
 * 设计灵感来源于全屏显示的UI模式，内容区域最大化展示。
 */
export const FullscreenDisplayIcon: React.FC<FullscreenDisplayIconProps> = ({
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
      {/* 全宽填充区域，表示最大化内容区 */}
      <rect
        x="4.93"
        y="6.125"
        width="10.145"
        height="7.75"
        fill={color}
      />
    </svg>
  );
};
