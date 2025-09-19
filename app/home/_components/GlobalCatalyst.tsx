"use client";

import { cn } from "@/lib/utils";
import { useAiPanelStore } from "@/store";
import { useSidebarMenuStore } from "@/store";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";

interface GlobalCatalystProps {
  className?: string;
}

export function GlobalCatalyst({ className }: GlobalCatalystProps) {
  // 获取AI面板状态管理
  const { showAiPanel, setAiPanelVisibility } = useAiPanelStore();
  
  // 获取当前菜单的元数据，判断是否支持AI面板
  const { getActiveMenuMetadata } = useSidebarMenuStore();
  const currentMenuMetadata = getActiveMenuMetadata();

  // 点击交互：打开AI面板
  const handleInteraction = () => {
    // 打开AI面板（此时已确保当前菜单支持AI面板且面板未打开）
    setAiPanelVisibility(true);
  };

  // 唤醒器只在满足以下条件时显示：
  // 1. 当前菜单支持AI面板功能
  // 2. AI面板当前未打开状态
  if (!currentMenuMetadata.showAiPanel || showAiPanel) {
    return null;
  }

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
          "cursor-pointer rounded-full",
          "transition-transform duration-300 ease-out",
          "hover:scale-102 active:scale-97"
        )}
        aria-label="全局AI助手"
      >
        <AiAssistantAvatar
          className={cn(
            // 当外层 button 被 hover 时，改变 avatar 的样式
            "hover:bg-white/90",
            "hover:border-gray-200/60",
            "hover:shadow-lg"
          )}
        />
      </button>
    </div>
  );
}
