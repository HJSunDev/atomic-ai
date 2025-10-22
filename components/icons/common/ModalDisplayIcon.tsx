"use client";

import React from 'react';

interface ModalDisplayIconProps {
  /** 自定义CSS类名 */
  className?: string;
  /** 图标尺寸，默认为20 */
  size?: number;
  /** 图标颜色，默认使用currentColor */
  color?: string;
}

/**
 * 模态框显示模式图标组件
 *
 * 表示文档在居中模态框中显示的模式图标，包含一个矩形边框和居中的填充区域。
 * 设计灵感来源于常见的模态框/弹窗布局UI模式。
 */
export const ModalDisplayIcon: React.FC<ModalDisplayIconProps> = ({
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
      {/* 居中填充区域，表示内容区 */}
      <rect
        x="5.93"
        y="7.125"
        width="8.145"
        height="5.75"
        fill={color}
      />
    </svg>
  );
};
