"use client";

import { ReactNode, useState } from "react";
import { AiChatPanel } from "./AiChatPanel";

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
    <>
      {/* 主内容区域 - 宽度根据AI面板显示状态调整 */}
      <div 
        className={`flex flex-col transition-all duration-300 ${
          showAiChat ? 'w-[55%]' : 'flex-1'
        }`}
      >
        {/* 工具栏 - 包含切换AI面板按钮 */}
        <header className="flex items-center justify-end p-2 border-b">
          <button 
            onClick={toggleAiChat}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {showAiChat ? "隐藏AI面板" : "显示AI面板"}
          </button>
        </header>
        
        {/* 主要内容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>

      {/* AI聊天面板 - 可控制显示/隐藏 */}
      {showAiChat && <AiChatPanel />}
    </>
  );
} 