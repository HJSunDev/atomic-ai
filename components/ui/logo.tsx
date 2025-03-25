"use client"

import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 使用"use client"指令是必要的，因为该组件:
// 1. 包含客户端交互元素（动画效果）
// 2. 使用了style属性（内联样式）
// 3. 将在客户端组件中使用（如Header导航）
export function Logo({ size = 'md', className = '' }: LogoProps) {
  // 根据尺寸计算不同的大小值
  const sizes = {
    sm: {
      container: 'w-[1.5rem] h-[1.5rem]',
      nucleus: 'w-[0.4rem] h-[0.4rem]',
      orbit: 'w-[1.25rem] h-[1.25rem]',
      electron: 'w-[0.22rem] h-[0.22rem]'
    },
    md: {
      container: 'w-[2rem] h-[2rem]',
      nucleus: 'w-[0.53rem] h-[0.53rem]',
      orbit: 'w-[1.65rem] h-[1.65rem]',
      electron: 'w-[0.28rem] h-[0.28rem]'
    },
    lg: {
      container: 'w-[2.5rem] h-[2.5rem]',
      nucleus: 'w-[0.6rem] h-[0.6rem]',
      orbit: 'w-[2.1rem] h-[2.1rem]',
      electron: 'w-[0.35rem] h-[0.35rem]'
    }
  }

  return (
    <div className={`${sizes[size].container} rounded-lg bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white font-bold relative overflow-hidden shadow-md ${className}`}>
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        {/* 轨道 - 使用一个轨道增加层次感 */}
        <div className={`absolute w-[75%] h-[75%] rounded-full border border-white/25`}></div>
        
        {/* 中心原子核 - 更小更聚焦 */}
        <div className={`${sizes[size].nucleus} rounded-full bg-white/90 z-10`}></div>
        
        {/* 电子 - 更明亮，更大 */}
        <div className="absolute w-full h-full animate-orbit-slow">
          {/* 电子1 - 蓝色 */}
          <div className={`absolute top-[20%] left-[20%] ${sizes[size].electron} rounded-full bg-[#38BDF8] shadow-[0_0_5px_rgba(56,189,248,0.8)] animate-pulse-slow`}></div>
          
          {/* 电子2 - 粉色 */}
          <div className={`absolute top-[20%] right-[20%] ${sizes[size].electron} rounded-full bg-[#FB7185] shadow-[0_0_5px_rgba(251,113,133,0.8)] animate-pulse-slow`} style={{ animationDelay: '1s' }}></div>
          
          {/* 电子3 - 绿色 */}
          <div className={`absolute bottom-[20%] left-[45%] ${sizes[size].electron} rounded-full bg-[#4ADE80] shadow-[0_0_5px_rgba(74,222,128,0.8)] animate-pulse-slow`} style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* 内部轨道上的电子 */}
        <div className="absolute w-[75%] h-[75%] animate-orbit-slow" style={{ animationDirection: 'reverse', animationDuration: '8s' }}>
          {/* 内部轨道电子 - 紫色 */}
          <div className={`absolute top-[15%] right-[15%] ${sizes[size].electron} rounded-full bg-[#C084FC] shadow-[0_0_5px_rgba(192,132,252,0.8)] animate-pulse-slow`} style={{ animationDelay: '1.2s' }}></div>
        </div>
      </div>
    </div>
  )
} 