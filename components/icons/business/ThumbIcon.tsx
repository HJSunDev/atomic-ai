"use client";

import React from 'react';

interface ThumbIconProps {
  /** 自定义CSS类名 */
  className?: string;
  /** 图标尺寸，默认为24 */
  size?: number;
  /** 图标变体 */
  variant?: 'outline' | 'filled' | 'ghost';
  /** 动画状态，用于教程指引等场景 */
  animationState?: 'idle' | 'dragging' | 'dropping';
}

/**
 * 拇指图标组件
 * 
 * 专门用于新手指引和交互提示场景的拇指形状图标。
 * 支持多种变体和动画状态，可根据不同的使用场景调整外观。
 */
export const ThumbIcon: React.FC<ThumbIconProps> = ({ 
  className = '', 
  size = 170, 
  variant = 'ghost',
  animationState = 'idle'
}) => {
  // 根据变体决定透明度和颜色方案
  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          baseOpacity: '0.9',
          strokeOpacity: '0.6',
          fillColor: '#5a8fd6'
        };
      case 'outline':
        return {
          baseOpacity: '0.8',
          strokeOpacity: '0.8',
          fillColor: 'none'
        };
      case 'ghost':
      default:
        return {
          baseOpacity: '0.7',
          strokeOpacity: '0.4',
          fillColor: '#5a8fd6'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={`transform transition-transform duration-300 drop-shadow-lg ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 主体渐变 - 从中心到边缘的虚影效果 */}
          <radialGradient id="thumbGradient" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor={styles.fillColor} stopOpacity={styles.baseOpacity}/>
            <stop offset="40%" stopColor={styles.fillColor} stopOpacity="0.5"/>
            <stop offset="80%" stopColor={styles.fillColor} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={styles.fillColor} stopOpacity="0.1"/>
          </radialGradient>
          
          {/* 指甲渐变 */}
          <radialGradient id="nailGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#6b9df0" stopOpacity="0.4"/>
            <stop offset="60%" stopColor="#5a8fd6" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#5a8fd6" stopOpacity="0.15"/>
          </radialGradient>
          
          {/* 高光线性渐变 */}
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a3c2f2" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#a3c2f2" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#a3c2f2" stopOpacity="0.2"/>
          </linearGradient>
        </defs>
        
        <g transform="rotate(-45 100 100)">
          {/* 拇指主轮廓 */}
          <path d="
            M 100 40
            C 88 40, 78 50, 78 65
            L 78 120
            C 78 126, 80 132, 83 137
            L 86 140
            C 90 143, 95 146, 100 148
            L 106 150
            C 112 150, 118 148, 122 145
            L 126 140
            C 129 136, 131 130, 131 123
            L 131 65
            C 131 50, 120 40, 108 40
            L 100 40
            Z
          "
          fill={variant === 'outline' ? 'none' : 'url(#thumbGradient)'}
          stroke="#5a8fd6"
          strokeWidth="1.5"
          strokeOpacity={styles.strokeOpacity}
          strokeLinejoin="round"/>

          {/* 指甲 */}
          <ellipse cx="104" cy="67" rx="18" ry="15"
            fill={variant === 'outline' ? 'none' : 'url(#nailGradient)'}
            stroke="#6b9df0"
            strokeWidth="1"
            strokeOpacity="0.3"/>

          {/* 关节线 */}
          <path d="M 83 95 Q 104 92, 125 95"
            fill="none"
            stroke="#5a8fd6"
            strokeWidth="1.5"
            opacity="0.4"/>

          <path d="M 85 110 Q 104 108, 123 110"
            fill="none"
            stroke="#5a8fd6"
            strokeWidth="1.5"
            opacity="0.4"/>

          {/* 自然侧面高光 */}
          <path d="
            M 82 60
            Q 84 80, 86 100
            Q 87 120, 89 135
          "
          fill="none"
          stroke="url(#highlightGradient)"
          strokeWidth="2"
          strokeLinecap="round"/>
        </g>
      </svg>
      
      {/* 拖动时的光圈效果 - 仅在动画状态下显示 */}
      {animationState !== 'idle' && (
        <div className="absolute -top-6 -left-6 w-36 h-40 bg-indigo-400/15 rounded-full animate-pulse" />
      )}

      {/* 按压效果 - 仅在放置状态下显示 */}
      {animationState === 'dropping' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-28 bg-green-500/25 rounded-full animate-ping" />
        </div>
      )}
    </div>
  );
};
