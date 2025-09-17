"use client";

import { cn } from "@/lib/utils";
import { FaceIcon } from "@/components/FaceIcon";
import { useFaceExpressionStore } from "@/store/home/faceExpressionStore";

interface GlobalCatalystProps {
  className?: string;
}

export function GlobalCatalyst({ className }: GlobalCatalystProps) {
  // 从全局表情 store 订阅状态与动作，避免组件内管理计时器与复杂逻辑
  const { expression, playExpression } = useFaceExpressionStore();

  // 点击交互：播放临时的 surprised 表情，到时自动恢复
  const handleInteraction = () => {
    playExpression("surprised", 1500);
  };

  return (
    <div 
      className={cn(
        "fixed top-[4rem] right-[6rem] z-50",
        className
      )}
    >
      <button
        onClick={handleInteraction}
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
        <FaceIcon expression={expression} />
      </button>
    </div>
  );
}
