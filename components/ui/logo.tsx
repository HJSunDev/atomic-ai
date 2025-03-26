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
    <div className={`${sizes[size].container} rounded-lg bg-[#1A1A2E] flex items-center justify-center text-white font-bold relative overflow-hidden shadow-[0_0_25px_rgba(74,144,226,0.2)] ${className}`}>
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        {/* 轨道 - 使用霓虹蓝轨道增加科技感 */}
        <div className={`absolute w-[75%] h-[75%] rounded-full border border-[#00F5FF]/40`}></div>
        
        {/* 中心原子核 - 使用紫罗兰到科技蓝的渐变 */}
        <div className={`${sizes[size].nucleus} rounded-full bg-gradient-to-br from-[#6E48AA] to-[#4A90E2] z-10 shadow-[0_0_18px_rgba(110,72,170,0.5)] animate-pulse-slow`}></div>
        
        {/* 电子 - 使用霓虹蓝电子，增加量子效果 */}
        <div className="absolute w-full h-full animate-orbit-slow">
          {/* 电子1 - 霓虹蓝 */}
          <div className={`absolute top-[20%] left-[20%] ${sizes[size].electron} rounded-full bg-[#00F5FF] shadow-[0_0_15px_rgba(0,245,255,0.9)] animate-pulse-slow`}></div>
          
          {/* 电子2 - 霓虹蓝，带延迟 */}
          <div className={`absolute bottom-[20%] right-[20%] ${sizes[size].electron} rounded-full bg-[#00F5FF] shadow-[0_0_15px_rgba(0,245,255,0.9)] animate-pulse-slow`} style={{ animationDelay: '1.2s' }}></div>
        </div>
      </div>
    </div>
  )
} 