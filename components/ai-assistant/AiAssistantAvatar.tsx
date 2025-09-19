"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { FaceIcon } from "@/components/FaceIcon";
import { useFaceExpressionStore } from "@/store/home/faceExpressionStore";
import { type ExpressionName } from "@/lib/expressions";

interface AiAssistantAvatarProps {
  className?: string;
}

export function AiAssistantAvatar({ className }: AiAssistantAvatarProps) {
  // 从全局表情 store 订阅状态与动作
  const { expression, subscribeAutoCycle, unsubscribeAutoCycle } = useFaceExpressionStore();

  // 组件挂载时“订阅”自动表情循环，卸载时“取消订阅”
  useEffect(() => {
    // 定义此组件实例希望使用的动画参数
    const autoCycleExpressions: ExpressionName[] = ["blink"];
    const options = { interval: 7000, duration: 400 };

    // 发起订阅
    subscribeAutoCycle(autoCycleExpressions, options);
    
    // 返回一个清理函数，在组件卸载时自动调用
    return () => {
      unsubscribeAutoCycle();
    };
  }, [subscribeAutoCycle, unsubscribeAutoCycle]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "bg-white/80",
        "border border-gray-100/50",
        "text-gray-800",
        "w-14 h-14",
        "transition-all duration-300 ease-out",
        "shadow-sm",
        className
      )}
    >
      <FaceIcon expression={expression} />
    </div>
  );
}
