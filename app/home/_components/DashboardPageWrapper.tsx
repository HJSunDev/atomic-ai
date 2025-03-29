"use client";

import { ReactNode, useState } from "react";
import { AiChatPanel } from "./AiChatPanel";
import { Bot, ChevronLeft, ChevronRight, PanelRightClose, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardPageWrapperProps {
  children: ReactNode;
}

export function DashboardPageWrapper({ children }: DashboardPageWrapperProps) {
  // 控制AI聊天面板是否显示
  const [showAiChat, setShowAiChat] = useState(true);
  
  // 切换AI聊天面板显示状态
  const toggleAiChat = () => {
    setShowAiChat(prev => !prev);
  };

  return (
    <div className="flex h-full relative">
      {/* 主内容区域 - 宽度根据AI面板显示状态调整 */}
      <div 
        className={cn(
          "flex flex-col transition-all duration-300 relative",
          showAiChat ? 'w-[55%]' : 'w-full'
        )}
      >
        {/* 主要内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>

      {/* AI面板控制按钮 - 固定在右侧 */}
      <div 
        className={cn(
          "absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10",
          showAiChat ? "right-[45%] -translate-x-1/2" : "right-0"
        )}
      >
        <button 
          onClick={toggleAiChat}
          className={cn(
            "flex items-center justify-center bg-background shadow-md rounded-full p-2",
            "border border-border transition-all hover:shadow-lg",
            showAiChat ? "hover:bg-muted" : "hover:bg-primary/10"
          )}
          aria-label={showAiChat ? "隐藏AI面板" : "显示AI面板"}
        >
          {showAiChat ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <div className="flex flex-col items-center gap-2 p-1">
              <ChevronLeft className="h-4 w-4 text-primary" />
              <Bot className="h-4 w-4 text-primary" />
            </div>
          )}
        </button>
      </div>

      {/* AI聊天面板 - 可控制显示/隐藏 */}
      {showAiChat && <AiChatPanel />}
    </div>
  );
}