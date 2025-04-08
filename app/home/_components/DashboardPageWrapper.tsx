"use client";

import { ReactNode } from "react";
import { AiChatPanel } from "./AiChatPanel";
import { Bot, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiPanelStore } from "@/store";
import { useSidebarMenuStore } from "@/store";

interface DashboardPageWrapperProps {
  children: ReactNode;
}

export function DashboardPageWrapper({ children }: DashboardPageWrapperProps) {
  // 使用全局状态管理中的AI面板状态和方法
  const { showAiPanel, toggleAiPanel } = useAiPanelStore();
  
  // 获取当前活动菜单的元数据
  const { getActiveMenuMetadata } = useSidebarMenuStore();
  const currentMenuMetadata = getActiveMenuMetadata();
  
  // 根据当前菜单项元数据决定是否显示AI面板
  const shouldShowAiPanel = currentMenuMetadata.showAiPanel;
  
  // 如果当前菜单不支持AI面板，则不显示面板和按钮
  const effectiveShowAiPanel = shouldShowAiPanel ? showAiPanel : false;
  
  return (
    <div className="flex h-full relative">
      {/* 主内容区域 - 宽度根据AI面板显示状态调整 */}
      <div 
        className={cn(
          "flex flex-col transition-all duration-300 relative",
          effectiveShowAiPanel ? 'w-[55%]' : 'w-full'
        )}
      >
        {/* 主要内容 */}
        <main className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20",
          // 当AI面板关闭时，给内容添加居中样式，但保持容器占满
          !effectiveShowAiPanel && 'flex justify-center'
        )}>
          {/* 内容容器 - 当AI面板关闭时限制宽度并居中 */}
          <div className={cn(
            "w-full",
            !effectiveShowAiPanel && 'max-w-[70rem]'
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* AI面板控制按钮 - 只在当前菜单支持AI面板时显示 */}
      {shouldShowAiPanel && (
        <div 
          className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10",
            // 修改按钮位置：AI面板打开时，将按钮放在AI面板左边界上
            showAiPanel ? "right-[45%] translate-x-0" : "right-0"
          )}
        >
          <button 
            onClick={toggleAiPanel}
            className={cn(
              "flex items-center justify-center bg-background cursor-pointer transition-all duration-200",
              "hover:shadow-md",
              // 根据面板状态改变按钮样式
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
      )}

      {/* AI聊天面板 - 可控制显示/隐藏，并且只在当前菜单支持AI面板时渲染 */}
      {effectiveShowAiPanel && <AiChatPanel />}
    </div>
  );
}