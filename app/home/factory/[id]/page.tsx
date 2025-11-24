"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Play, Code2 } from "lucide-react";
import { FactoryChatPanel } from "./_components/FactoryChatPanel";
import { FactoryPreviewEditor } from "./_components/FactoryPreviewEditor";
import { AppType } from "./types";

export default function FactoryEditorPage() {
  const params = useParams();
  const appId = params.id as Id<"apps">; 

  // 本地状态管理生成的代码（模拟模式）
  const [generatedCode, setGeneratedCode] = useState<string | undefined>(undefined);
  // 本地状态管理应用类型（模拟模式，默认 html）
  const [appType, setAppType] = useState<AppType>("html");

  // 处理模式切换：切换模式时清空之前生成的代码（因为 React 和 HTML 代码格式不兼容）
  const handleAppTypeChange = (newType: AppType) => {
    if (newType !== appType) {
      setAppType(newType);
      setGeneratedCode(undefined); // 清空之前生成的代码
    }
  };

  // 3. 获取应用详情（暂时使用 mock 数据，如果查询失败）
  const app = useQuery(api.app_generation.queries.getApp, { appId });

  // 模拟模式：即使没有后端数据也能运行
  if (app === undefined) {
      return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在加载应用环境...</p>
        </div>
      );
  }

  // 如果后端数据不存在，使用模拟数据
  const appData = app || {
    name: "演示应用",
    description: "前端模拟模式",
    v: 0,
    latestCode: undefined,
  };

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
                    <h2 className="font-semibold text-sm">{appData.name}</h2>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full border">v{appData.v}.0</span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {appData.description || "无描述"}
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
      <article className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
            
            {/* 左侧：AI 交互区 */}
            <ResizablePanel defaultSize={22} minSize={20} maxSize={40} className="border-r z-10 bg-background">
                <FactoryChatPanel 
                  appId={appId}
                  appType={appType}
                  onCodeGenerated={(code) => setGeneratedCode(code)}
                />
            </ResizablePanel>
            
            <ResizableHandle className="w-[1px] bg-border" />
            
            {/* 右侧：预览与代码区 */}
            <ResizablePanel defaultSize={78}>
                <FactoryPreviewEditor 
                  appId={appId}
                  code={generatedCode || appData.latestCode}
                  appType={appType}
                  onAppTypeChange={handleAppTypeChange}
                />
            </ResizablePanel>
            
        </ResizablePanelGroup>
      </article>
    </div>
  );
}
