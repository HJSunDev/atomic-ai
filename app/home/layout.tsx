"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Sidebar } from "./_components/Sidebar";
import { GlobalCatalyst } from "./_components/GlobalCatalyst";
import { AiChatPanel } from "./_components/AiChatPanel";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiPanelStore } from "@/store";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { ClientOnly } from "@/components/client-only";
import { DocumentViewer } from "@/components/document/DocumentViewer";
import { useAiContextStore } from "@/store/home/use-ai-context-store";
import { useMenuRouteSync } from "@/hooks/use-menu-route-sync";

// 一个用于调试AI上下文堆栈的独立组件
const AiContextStackDebugger = () => {
  const contextStack = useAiContextStore(state => state.contextStack);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const content = JSON.stringify(contextStack, null, 2);
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        maxWidth: '400px',
        maxHeight: '90vh',
        overflow: 'auto',
        fontSize: '12px',
        fontFamily: 'monospace',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid white', paddingBottom: '0.25rem' }}>
        <h3 style={{ margin: 0 }}>AI Context Stack (Top Last)</h3>
        <button 
          onClick={handleCopy}
          style={{
            background: copied ? '#4ade80' : 'rgba(255, 255, 255, 0.2)',
            color: copied ? 'black' : 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <pre>{JSON.stringify(contextStack, null, 2)}</pre>
    </div>
  );
};


interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // 检测组件是否已在客户端挂载
  const hasMounted = useHasMounted();
  
  // 启用路由与菜单状态的自动同步
  useMenuRouteSync();
  
  // 使用全局状态管理中的AI面板状态和方法
  const { showAiPanel, setAiPanelVisibility } = useAiPanelStore();
  
  // 从新的Store中获取当前激活的AI上下文
  const activeContext = useAiContextStore(state => state.getActiveContext());
  
  // 记录上一个激活的上下文ID，用于检测上下文切换
  const prevContextIdRef = useRef(activeContext?.id);
  
  // 当活动上下文改变时，重置AI面板显示状态为不显示
  useEffect(() => {
    const currentContextId = activeContext?.id;
    // 只有在上下文ID真正变化时才重置面板状态
    if (prevContextIdRef.current !== currentContextId) {
      // 每次上下文切换时，将AI面板状态重置为不显示
      setAiPanelVisibility(false);
      // 更新前一个上下文ID引用
      prevContextIdRef.current = currentContextId;
    }
  }, [activeContext, setAiPanelVisibility]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* 应用侧边栏 - 固定宽度 */}
      <Sidebar />

      {/* 主内容区域 - 占用剩余空间 */}
      <main className="flex-1 overflow-hidden relative flex">
        {/* 主内容区域 - 宽度根据AI面板显示状态调整 */}
        <article
          className={cn(
            "flex flex-col transition-all duration-300 relative h-full",
            // 仅在客户端挂载后应用条件样式，避免水合不匹配
            hasMounted && showAiPanel ? 'w-[75%]' : 'w-full'
          )}
        >
          {children}
          {/* 将关闭按钮锚定在 article 右边缘，使其随宽度过渡一起移动，避免突兀出现 */}
          {showAiPanel && (
            <div 
              className={cn(
                "absolute top-1/2 -translate-y-1/2 transition-all duration-300 z-10",
                "right-0 translate-x-0"
              )}
            >
              <button 
                onClick={() => setAiPanelVisibility(false)}
                className={cn(
                  "flex items-center justify-center bg-background cursor-pointer transition-all duration-200",
                  "hover:shadow-md",
                  "h-16 w-6 border-y border-l border-muted/30 rounded-l-md shadow-[-1px_0px_3px_rgba(0,0,0,0.05)]"
                )}
                aria-label="隐藏AI面板"
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground/70 hover:text-foreground transition-colors" />
              </button>
            </div>
          )}
        </article>
        
        {/* 使用ClientOnly组件确保内容仅在客户端渲染 */}
        <ClientOnly>
          {/* AI聊天面板由自己的 store 控制显示，与上下文无关 */}
          {showAiPanel && <AiChatPanel />}
        </ClientOnly>
      </main>


      {/* 全局挂载区 */}

      {/* 全场景AI助手 - 右上角固定定位，覆盖整个应用区域 */}
      <GlobalCatalyst />

      {/* 文档视图容器 */}
      <DocumentViewer />

      {/* AI上下文堆栈调试器 */}
      {/* <AiContextStackDebugger /> */}
    </div>
  );
} 