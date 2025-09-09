"use client";

import React, { useState, useEffect } from 'react';

interface TutorialOverlayProps {
  /** 是否显示新手指引 */
  isVisible: boolean;
  /** 关闭指引的回调 */
  onClose: () => void;
  /** 强制显示操作区的回调（用于动画同步） */
  onShowOperationArea?: (show: boolean) => void;
}

/**
 * 新手指引覆盖层组件
 * 
 * 该组件完全独立于拖拽逻辑，通过CSS动画模拟手指拖动卡片的交互效果。
 * 帮助新用户理解如何通过拖动卡片来激活操作区。
 */
export function TutorialOverlay({ 
  isVisible, 
  onClose, 
  onShowOperationArea 
}: TutorialOverlayProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'dragging' | 'dropping'>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // 动画循环逻辑
    const startAnimation = () => {
      // 开始拖动动画
      setAnimationState('dragging');
      
      // 1.5秒后显示操作区（模拟拖动到一半时操作区出现）
      setTimeout(() => {
        onShowOperationArea?.(true);
      }, 1500);

      // 3秒后进入放置状态
      setTimeout(() => {
        setAnimationState('dropping');
      }, 3000);

      // 4秒后回到初始状态，准备下一轮
      setTimeout(() => {
        setAnimationState('idle');
        onShowOperationArea?.(false);
        setCurrentCycle(prev => prev + 1);
      }, 4000);
    };

    // 立即开始第一次动画
    const initialTimer = setTimeout(startAnimation, 800);

    // 每6秒循环一次动画
    const intervalTimer = setInterval(startAnimation, 6000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isVisible, onShowOperationArea]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* 半透明背景遮罩 */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* 指引内容容器 */}
      <div className="relative max-w-[70rem] w-full mx-auto h-full">
        
        {/* 关闭按钮 - 恢复pointer-events */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-60 pointer-events-auto bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
          title="跳过新手指引"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 指引文字 */}
        <div className="absolute top-8 left-8 bg-white rounded-lg p-4 shadow-xl max-w-md z-60">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            🎯 新手指引
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            拖动下方的功能卡片到操作区域，即可开始组合使用！
            <br />
            <span className="text-blue-600 font-medium">操作区会在拖动时自动出现</span>
          </p>
        </div>

        {/* 手指图标和动画 */}
        <div 
          className={`absolute transition-all duration-1000 ease-in-out z-40 ${
            animationState === 'idle' 
              ? 'top-[420px] left-[100px]' // 第一个卡片位置
              : animationState === 'dragging'
              ? 'top-[200px] left-[400px]' // 操作区位置
              : 'top-[180px] left-[420px]'  // 稍微下移模拟放置
          }`}
          style={{
            transform: animationState === 'dropping' ? 'scale(0.9)' : 'scale(1)',
            transition: 'all 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        >
          {/* 手指图标 */}
          <div className="relative">
            {/* 手指SVG */}
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 100 100" 
              className={`transform transition-transform duration-300 ${
                animationState === 'dragging' ? 'rotate-12' : ''
              }`}
            >
              {/* 手指主体 */}
              <path
                d="M45 20 Q50 15 55 20 L55 60 Q55 70 45 70 Q35 70 35 60 L35 20 Q35 15 40 15 Q45 15 45 20 Z"
                fill="#FFB382"
                stroke="#E69968"
                strokeWidth="1"
              />
              {/* 指甲 */}
              <ellipse
                cx="50"
                cy="22"
                rx="5"
                ry="3"
                fill="#FFD4B3"
                stroke="#E69968"
                strokeWidth="0.5"
              />
              {/* 关节线 */}
              <line
                x1="38"
                y1="35"
                x2="52"
                y2="35"
                stroke="#E69968"
                strokeWidth="1"
                opacity="0.6"
              />
              <line
                x1="38"
                y1="50"
                x2="52"
                y2="50"
                stroke="#E69968"
                strokeWidth="1"
                opacity="0.6"
              />
            </svg>
            
            {/* 拖动时的阴影效果 */}
            {animationState !== 'idle' && (
              <div className="absolute -top-2 -left-2 w-12 h-12 bg-blue-400/30 rounded-full animate-pulse" />
            )}
          </div>
          
          {/* 点击波纹效果 */}
          {animationState === 'dropping' && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-green-400/50 rounded-full animate-ping" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full" />
            </div>
          )}
        </div>

        {/* 拖动路径虚线 */}
        <svg 
          className="absolute top-0 left-0 w-full h-full z-30 pointer-events-none" 
          style={{ height: '100vh' }}
        >
          <defs>
            {/* 定义虚线样式 */}
            <pattern id="dashed" patternUnits="userSpaceOnUse" width="8" height="8">
              <circle cx="4" cy="4" r="1" fill="#3B82F6" opacity="0.6"/>
            </pattern>
          </defs>
          
          {/* 弧形路径 */}
          <path
            d="M 120 440 Q 300 280 420 200"
            stroke="url(#dashed)"
            strokeWidth="2"
            fill="none"
            opacity={animationState !== 'idle' ? 0.8 : 0.4}
            className="transition-opacity duration-500"
          />
          
          {/* 箭头指示 */}
          <polygon
            points="415,195 425,200 415,205"
            fill="#3B82F6"
            opacity={animationState !== 'idle' ? 0.8 : 0.4}
            className="transition-opacity duration-500"
          />
        </svg>

        {/* 高亮第一个卡片 */}
        <div 
          className={`absolute top-[400px] left-[80px] w-[280px] h-[140px] border-4 border-blue-400 rounded-lg z-20 transition-opacity duration-500 ${
            animationState === 'idle' ? 'opacity-60' : 'opacity-20'
          }`}
          style={{
            background: 'linear-gradient(45deg, transparent 40%, rgba(59, 130, 246, 0.1) 50%, transparent 60%)',
            animation: animationState === 'idle' ? 'pulse 2s infinite' : 'none'
          }}
        />

        {/* 操作区域高亮提示 */}
        {animationState !== 'idle' && (
          <div className="absolute top-[120px] left-[100px] right-[100px] h-[120px] border-4 border-green-400 rounded-lg z-20 opacity-60">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              操作区域
            </div>
          </div>
        )}

        {/* 底部提示信息 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-4 shadow-xl z-60 text-center">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{currentCycle + 1}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {animationState === 'idle' && '准备拖动卡片...'}
              {animationState === 'dragging' && '拖动中 - 操作区即将出现'}
              {animationState === 'dropping' && '松开鼠标 - 卡片已添加到操作区'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
