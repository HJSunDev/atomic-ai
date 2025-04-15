"use client";

import { ReactNode, useEffect, useRef } from "react";
import { AiChatPanel } from "./AiChatPanel";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiPanelStore } from "@/store";
import { useSidebarMenuStore } from "@/store";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { ClientOnly } from "@/components/client-only";

interface DashboardPageWrapperProps {
  children: ReactNode;
}

export function DashboardPageWrapper({ children }: DashboardPageWrapperProps) {
  // 检测组件是否已在客户端挂载
  const hasMounted = useHasMounted();
  
  // 使用全局状态管理中的AI面板状态和方法
  const { showAiPanel, toggleAiPanel, setAiPanelVisibility } = useAiPanelStore();
  
  // 获取当前活动菜单的元数据
  const { getActiveMenuMetadata, activeMenuId } = useSidebarMenuStore();
  const currentMenuMetadata = getActiveMenuMetadata();
  
  // 根据当前菜单项元数据决定是否显示AI面板
  const shouldShowAiPanel = currentMenuMetadata.showAiPanel;
  
  // 记录上一次活动的菜单ID，用于检测菜单切换
  const prevMenuIdRef = useRef(activeMenuId);
  
  // 当活动菜单项改变时，重置AI面板显示状态为不显示
  useEffect(() => {
    // 只有在菜单ID真正变化时才重置面板状态
    if (prevMenuIdRef.current !== activeMenuId) {
      // 每次菜单切换时，将AI面板状态重置为不显示
      setAiPanelVisibility(false);
      // 更新前一个菜单ID引用
      prevMenuIdRef.current = activeMenuId;
    }
  }, [activeMenuId, setAiPanelVisibility]);
  
  // 如果当前菜单不支持AI面板，则不显示面板和按钮
  const effectiveShowAiPanel = shouldShowAiPanel ? showAiPanel : false;
  
  return (
    <div className="flex h-full relative">
      {/* 主内容区域 - 宽度根据AI面板显示状态调整 */}
      <main
        className={cn(
          "flex flex-col transition-all duration-300 relative",
          // 仅在客户端挂载后应用条件样式，避免水合不匹配
          hasMounted && effectiveShowAiPanel ? 'w-[55%]' : 'w-full'
        )}
      >
        {children}
      </main>

      {/* 使用ClientOnly组件确保内容仅在客户端渲染 */}
      <ClientOnly>
        {shouldShowAiPanel && (
          <>
            {/* AI面板控制按钮 */}
            <div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10",
                showAiPanel ? "right-[45%] translate-x-0" : "right-0"
              )}
            >
              <button 
                onClick={toggleAiPanel}
                className={cn(
                  "flex items-center justify-center bg-background cursor-pointer transition-all duration-200",
                  "hover:shadow-md",
                  showAiPanel 
                    ? "h-16 w-6 border-y border-l border-muted/30 rounded-l-md shadow-[-1px_0px_3px_rgba(0,0,0,0.05)]" 
                    : "rounded-l-md w-7 h-16 border-r border-y border-l border-muted/40 shadow-sm"
                )}
                aria-label={showAiPanel ? "隐藏AI面板" : "显示AI面板"}
              >
                {showAiPanel ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground/70 hover:text-foreground transition-colors" />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <ChevronLeft className="h-4 w-4 text-primary" />
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            </div>

            {/* AI聊天面板 */}
            {effectiveShowAiPanel && <AiChatPanel />}
          </>
        )}
      </ClientOnly>
    </div>
  );
}