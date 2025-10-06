"use client";

import { cn } from "@/lib/utils";
import { useAiPanelStore } from "@/store";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";
import { useAiContextStore } from "@/store/home/use-ai-context-store";

interface LocalCatalystProps {
  // 必须提供此组件所属的上下文ID，用于精确匹配
  ownerContextId: string;
  className?: string;
}

export function LocalCatalyst({ ownerContextId, className }: LocalCatalystProps) {
  const { showAiPanel, setAiPanelVisibility } = useAiPanelStore();
  const activeContext = useAiContextStore(state => state.getActiveContext());

  const handleInteraction = () => {
    // 检查当前激活的上下文是否提供了自定义点击行为
    if (activeContext && typeof activeContext.onCatalystClick === 'function') {
      // 如果有，则执行该自定义行为
      activeContext.onCatalystClick();
    } else {
      // 否则，执行默认行为：直接打开AI面板
      setAiPanelVisibility(true);
    }
  };

  // 局部唤醒器的显示逻辑
  const shouldShow =
    !!activeContext &&
    activeContext.id === ownerContextId && // 确保是自己所属的上下文在顶层
    activeContext.catalystPlacement === 'local' &&
    !showAiPanel;

  if (!shouldShow) {
    return null;
  }

  return (
    <div 
      className={cn(
        "absolute top-12 right-16 z-10", // 绝对定位在右上角
        className
      )}
    >
      <button
        onClick={handleInteraction}
        className="cursor-pointer rounded-full transition-transform duration-300 ease-out hover:scale-102 active:scale-97"
        aria-label="AI助手"
      >
        <AiAssistantAvatar className="hover:bg-white/90 hover:border-gray-200/60 hover:shadow-lg" />
      </button>
    </div>
  );
}
