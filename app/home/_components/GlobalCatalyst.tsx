"use client";

import { cn } from "@/lib/utils";
import { useAiPanelStore } from "@/store";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";
import { useAiContextStore } from "@/store/home/use-ai-context-store";

interface GlobalCatalystProps {
  className?: string;
}

export function GlobalCatalyst({ className }: GlobalCatalystProps) {
  // 获取AI面板状态管理
  const { showAiPanel, setAiPanelVisibility } = useAiPanelStore();
  
  // 从新的Store中获取当前激活的AI上下文
  const activeContext = useAiContextStore(state => state.getActiveContext());

  // 点击交互：打开AI面板
  const handleInteraction = () => {
    // 打开AI面板（此时已确保当前菜单支持AI面板且面板未打开）
    setAiPanelVisibility(true);
  };

  // 唤醒器新的显示逻辑：
  // 1. 必须存在一个激活的上下文。
  // 2. 该上下文必须允许显示AI助手。
  // 3. 该上下文必须指定唤醒器位置为 'global'。
  // 4. AI面板当前未打开。
  const shouldShow = 
    activeContext && 
    activeContext.showAiAssistant && 
    activeContext.catalystPlacement === 'global' &&
    !showAiPanel;

  if (!shouldShow) {
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
