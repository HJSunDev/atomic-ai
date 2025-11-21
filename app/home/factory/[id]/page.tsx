"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useManageAiContext } from "@/hooks/use-manage-ai-context";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Play, Code2 } from "lucide-react";
import { EditorChatPanel } from "./_components/EditorChatPanel";
import { PreviewPanel } from "./_components/PreviewPanel";

export default function FactoryEditorPage() {
  const params = useParams();
  const appId = params.id as Id<"apps">; 

  // 2. 注册 AI 上下文
  const aiContext = useMemo(() => ({
    id: `factory-editor-${appId}`,
    type: "factory" as const, 
    showCatalyst: false, 
    catalystPlacement: 'global' as const
    // TODO: Add system instructions specific to app generation here if needed
  }), [appId]);

  useManageAiContext(aiContext);

  // 3. 获取应用详情
  const app = useQuery(api.app_generation.queries.getApp, { appId });

  // 为了演示效果，即使没有 app 也可以先显示 UI (或者显示 Loading)
  // 这里我们假设 app 加载中显示 Loading，加载失败显示错误，成功则显示编辑器
  if (app === undefined) {
      return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在加载应用环境...</p>
        </div>
      );
  }

  if (app === null) {
      return <div className="h-screen flex items-center justify-center">应用不存在或无权访问</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部导航栏 */}
      <header className="h-14 border-b flex items-center px-4 justify-between shrink-0 bg-white dark:bg-slate-950 z-10">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <Code2 className="w-5 h-5" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-sm">{app.name}</h2>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full border">v{app.v}.0</span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {app.description || "无描述"}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <button className="text-xs flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <Play className="w-3 h-3" />
                发布应用
             </button>
        </div>
      </header>

      {/* 主工作区 */}
      <main className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
            
            {/* 左侧：AI 交互区 */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="border-r z-10 bg-background">
                <EditorChatPanel appId={appId} />
            </ResizablePanel>
            
            <ResizableHandle className="w-[1px] bg-border" />
            
            {/* 右侧：预览与代码区 */}
            <ResizablePanel defaultSize={75}>
                <PreviewPanel appId={appId} code={app.latestCode} />
            </ResizablePanel>
            
        </ResizablePanelGroup>
      </main>
    </div>
  );
}
