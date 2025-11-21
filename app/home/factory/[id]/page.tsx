"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useManageAiContext } from "@/hooks/use-manage-ai-context";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

// 临时占位组件
const EditorChatPanel = ({ appId }: { appId: Id<"apps"> }) => (
  <div className="h-full bg-background flex flex-col">
    <div className="p-4 border-b font-medium">对话助手</div>
    <div className="flex-1 p-4 text-muted-foreground text-sm">
      这里将放置类似 ChatPanel 的对话组件，用于与 AI 沟通修改代码。
      <br/><br/>
      App ID: {appId}
    </div>
  </div>
);

const PreviewPanel = ({ appId, code }: { appId: Id<"apps">, code?: string }) => (
  <div className="h-full bg-slate-50 dark:bg-slate-900 flex flex-col">
    <div className="p-2 border-b bg-white dark:bg-slate-950 flex items-center gap-2 text-xs">
        <span className="px-2 py-1 bg-primary/10 text-primary rounded">预览模式</span>
        <span className="text-muted-foreground truncate flex-1">Sandpack Engine Ready</span>
    </div>
    <div className="flex-1 flex items-center justify-center p-8">
        {code ? (
            <div className="w-full h-full bg-white shadow-sm border rounded-lg p-4 overflow-auto font-mono text-xs whitespace-pre">
                {code}
            </div>
        ) : (
            <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2 opacity-20" />
                <p>等待生成代码...</p>
            </div>
        )}
    </div>
  </div>
);

export default function FactoryEditorPage() {
  const params = useParams();
  const appId = params.id as Id<"apps">; // 注意这里是 params.id，因为文件夹叫 [id]

  // 2. 注册 AI 上下文
  // 使用 useMemo 避免对象引用变化导致的无限重渲染
  const aiContext = useMemo(() => ({
    id: `factory-editor-${appId}`,
    type: "factory" as const, 
    showCatalyst: false, 
    catalystPlacement: 'global' as const
  }), [appId]);

  useManageAiContext(aiContext);

  // 3. 获取应用详情
  const app = useQuery(api.app_generation.queries.getApp, { appId });

  if (app === undefined) {
      return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (app === null) {
      return <div className="h-full flex items-center justify-center">应用不存在或无权访问</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部导航栏 (简易版) */}
      <header className="h-14 border-b flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2">
            <h2 className="font-semibold">{app.name}</h2>
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v{app.v}</span>
        </div>
        <div>
            {/* 工具栏占位 */}
        </div>
      </header>

      {/* 主工作区 */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
            
            {/* 左侧：AI 交互区 */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50} className="border-r">
            <EditorChatPanel appId={appId} />
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* 右侧：预览与代码区 */}
            <ResizablePanel defaultSize={70}>
            <PreviewPanel appId={appId} code={app.latestCode} />
            </ResizablePanel>
            
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

