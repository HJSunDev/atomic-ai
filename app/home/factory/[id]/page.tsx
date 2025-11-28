"use client";

import { useState } from "react";
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

  // 仅用于"历史版本预览"的代码覆盖
  // 正常流式生成时，此状态应为 undefined，让子组件直接从 DB 读取最新代码
  const [previewVersionCode, setPreviewVersionCode] = useState<string | undefined>(undefined);
  
  const [appType, setAppType] = useState<AppType>("html");

  // 处理模式切换：切换模式时清空之前生成的代码（因为 React 和 HTML 代码格式不兼容）
  const handleAppTypeChange = (newType: AppType) => {
    if (newType !== appType) {
      setAppType(newType);
      setPreviewVersionCode(undefined);
    }
  };

  // 处理代码生成/加载事件
  // code: 代码内容
  // isHistoryView: 是否是查看历史版本（如果是新生成，则为 false）
  const handleCodeEvent = (code: string, versionId: Id<"app_versions">, isHistoryView: boolean = false) => {
    if (isHistoryView) {
      // 查看历史版本：强制覆盖编辑器内容
      setPreviewVersionCode(code);
    } else {
      // 新生成：清空覆盖状态，让编辑器自动同步 DB 的 latestCode
      setPreviewVersionCode(undefined);
    }
  };

  // 3. 获取应用详情 (仅用于 Header 显示，不传给 Editor)
  const app = useQuery(api.factory.queries.getApp, { appId });

  if (app === undefined) {
      return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在加载应用环境...</p>
        </div>
      );
  }

  // 如果 app 真的为 null (例如权限不足或不存在)，显示错误或重定向
  if (app === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">无法加载应用，可能已被删除或无权访问。</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部导航栏 */}
      <FactoryHeader 
        title={app.name}
        description={app.description}
        version={app.v}
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
                  // 传递回调：区分是"新生成"还是"查看历史"
                  // 注意：FactoryChatPanel 目前的 onCodeGenerated 主要用于"查看历史"或者"生成完成提示"
                  // 我们需要约定：如果是点击历史记录，视为 isHistoryView=true
                  // 如果是流式生成结束，视为 isHistoryView=false
                  onCodeGenerated={(code, versionId, isHistoryView) => handleCodeEvent(code, versionId, isHistoryView)}
                />
            </ResizablePanel>
            
            <ResizableHandle className="w-[1px] bg-border" />
            
            {/* 右侧：预览与代码区 */}
            <ResizablePanel defaultSize={78}>
                <FactoryPreviewEditor 
                  appId={appId}
                  // 关键修改：只传递需要强制覆盖的代码，否则传 undefined
                  activeCodeOverride={previewVersionCode}
                  appType={appType}
                  onAppTypeChange={handleAppTypeChange}
                />
            </ResizablePanel>
            
        </ResizablePanelGroup>
      </article>
    </div>
  );
}
