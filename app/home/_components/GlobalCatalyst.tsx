"use client";

import { cn } from "@/lib/utils";

interface GlobalCatalystProps {
  className?: string;
}

// 侧脸图标（双眉 + 双眼 + 斜鼻）
function FaceIcon() {
  // 线条宽度
  const strokeW = 1.1;

  return (
    <svg width="48" height="48" viewBox="0 0 24 24" className="text-gray-700">
      {/* 眉毛：弯折的曲线 */}
      <path d="M7.5 7.5 Q9.3 6.5 11.3 7.2" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M14.3 7.2 Q16.3 6.5 18.3 7.5" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* 眼睛：两个点*/}
      <circle cx="9.4" cy="11.5" r="1.1" fill="currentColor" />
      <circle cx="15.4" cy="11.5" r="1.1" fill="currentColor" />

      {/* 鼻梁：延长的斜线，从眉心到鼻尖 */}
      <path d="M12.8 9.5 L9.4 18.2" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      
      {/* 鼻子：从鼻梁结束点向右延伸的横线，构成鼻子夹角 */}
      <path d="M9.4 18.2 L12.4 18.2" stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function GlobalCatalyst({ className }: GlobalCatalystProps) {
  
  return (
    <div 
      className={cn(
        "fixed top-[4rem] right-[6rem] z-50",
        className
      )}
    >
      <button
        className={cn(
          "relative flex items-center justify-center rounded-full",
          "bg-white/80 hover:bg-white/90 cursor-pointer",
          "border border-gray-100/50 hover:border-gray-200/60",
          "text-gray-800",
          "w-14 h-14 transition-all duration-300 ease-out",
          "shadow-sm hover:shadow-lg",
          "hover:scale-102",
          "active:scale-97"
        )}
        aria-label="全局AI助手"
      >
        <FaceIcon />
      </button>
    </div>
  );
}
