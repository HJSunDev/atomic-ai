"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { FactoryChatPanel } from "./_components/FactoryChatPanel";
import { FactoryPreviewEditor } from "./_components/FactoryPreviewEditor";
import { FactoryHeader } from "./_components/FactoryHeader";
import { AppType } from "./_components/common/types";



// 工坊应用-工作台
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
  const app = useQuery(api.factory.queries.getApp, { appId });

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
      <FactoryHeader 
        title={appData.name}
        description={appData.description}
        version={appData.v}
        onPublish={() => {
          // TODO: 实现发布逻辑
          console.log("发布应用");
        }}
      />

      {/* 主工作区 */}
      <article className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
            
            {/* 左侧：AI 交互区 */}
            <ResizablePanel defaultSize={22} minSize={20} maxSize={40} className="border-r z-10 bg-background">
                <FactoryChatPanel 
                  appId={appId}
                  appType={appType}
                  onCodeGenerated={(code, versionId) => setGeneratedCode(code)}
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
