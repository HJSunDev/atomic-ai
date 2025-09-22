"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Sidebar } from "./_components/Sidebar";
import { GlobalCatalyst } from "./_components/GlobalCatalyst";
import { AiChatPanel } from "./_components/AiChatPanel";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiPanelStore, useSidebarMenuStore } from "@/store";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { ClientOnly } from "@/components/client-only";
import { DocumentViewer } from "./_prompt-studio/_components/DocumentViewer";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // 检测组件是否已在客户端挂载
  const hasMounted = useHasMounted();
  
  // 使用全局状态管理中的AI面板状态和方法
  const { showAiPanel, setAiPanelVisibility } = useAiPanelStore();
  
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
            hasMounted && effectiveShowAiPanel ? 'w-[60%]' : 'w-full'
          )}
        >
          {children}
          {/* 将关闭按钮锚定在 article 右边缘，使其随宽度过渡一起移动，避免突兀出现 */}
          {effectiveShowAiPanel && (
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
          {/* 如果当前菜单支持AI面板，则显示AI面板 */}
          {shouldShowAiPanel && (
            <>
              {/* AI聊天面板 */}
              {effectiveShowAiPanel && <AiChatPanel />}
            </>
          )}
        </ClientOnly>
      </main>

      {/* 全场景AI助手 - 右上角固定定位，覆盖整个应用区域 */}
      <GlobalCatalyst />

      {/* 全局挂载区 */}
      {/* 文档视图容器 */}
      <DocumentViewer />
    </div>
  );
} 