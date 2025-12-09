"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { FactoryChatPanel } from "./_components/FactoryChatPanel";
import { FactoryPreviewContainer } from "./_components/FactoryPreviewContainer";
import { FactoryHeader } from "./_components/FactoryHeader";
import { AppType } from "./_components/common/types";
import { toast } from "sonner";



// 工坊应用-工作台页
export default function FactoryEditorPage() {
  const params = useParams();
  const appId = params.id as Id<"apps">; 

  // 仅用于"历史版本预览"的代码覆盖
  // 正常流式生成时，此状态应为 undefined，让子组件直接从 DB 读取最新代码
  const [previewVersionCode, setPreviewVersionCode] = useState<string | undefined>(undefined);
  
  const [appType, setAppType] = useState<AppType>("html");
  const [isPublishing, setIsPublishing] = useState(false);


  const publishApp = useMutation(api.factory.mutations.publishApp);
  const unpublishApp = useMutation(api.factory.mutations.unpublishApp);

  // 处理模式切换：切换模式时清空之前生成的代码（因为 React 和 HTML 代码不兼容）
  const handleAppTypeChange = (newType: AppType) => {
    if (newType !== appType) {
      setAppType(newType);
      setPreviewVersionCode(undefined);
    }
  };

  /**
   * 处理代码生成/加载事件，统一管理编辑器代码显示策略
   * 
   * 设计背景：
   * FactoryPreviewContainer 组件采用"覆盖优先"的数据流设计：
   * - 当 activeCodeOverride 有值时，优先显示覆盖代码（用于历史版本预览）
   * - 当 activeCodeOverride 为 undefined 时，组件自动从数据库读取最新代码（用于实时同步）
   * 
   * 此函数根据不同的触发场景，通过设置或清空 previewVersionCode 来控制编辑器的显示行为。
   * 
   * 触发场景：
   * 1. 新代码生成完成（isHistoryView = false）
   *    - 触发位置：FactoryChatCore.handleSendMessage，当流式生成成功完成时
   *    - 行为：清空 previewVersionCode，让编辑器从数据库读取最新代码，确保显示的是最新版本
   * 
   * 2. 查看历史版本（isHistoryView = true）
   *    - 触发位置：FactoryChatPanel.handleLoadVersion，当用户在版本对话框中点击"恢复此版本"时
   *    - 行为：设置 previewVersionCode 为历史代码，强制编辑器显示该版本，覆盖数据库的最新代码
   * 
   * @param code 代码内容
   * @param versionId 代码版本 ID
   * @param isHistoryView 是否为历史版本查看模式，默认为 false（新生成模式）
   */
  const handleCodeEvent = (code: string, versionId: Id<"app_versions">, isHistoryView: boolean = false) => {
    if (isHistoryView) {
      // 历史版本查看：设置覆盖代码，强制编辑器显示历史快照而非最新代码
      setPreviewVersionCode(code);
    } else {
      // 新代码生成：清空覆盖状态，让编辑器自动从数据库同步最新代码
      setPreviewVersionCode(undefined);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishApp({ appId });
      toast.success("应用发布成功", { position: "top-center" });
      // 发布成功后，自动在新标签页打开分享链接
      window.open(`/share/factory/${appId}`, '_blank');
    } catch (error) {
      toast.error("发布失败，请稍后重试", { position: "top-center" });
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    try {
      await unpublishApp({ appId });
      toast.success("应用已取消发布", { position: "top-center" });
    } catch (error) {
      toast.error("取消发布失败", { position: "top-center" });
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  // 获取应用详情 (仅用于当前页应用状态加载 和 Header 信息显示)
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
        appId={appId}
        title={app.name}
        description={app.description}
        version={app.v}
        isPublished={app.isPublished}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        isPublishing={isPublishing}
      />

      {/* 主工作区 */}
      <article className="flex-1 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full">
            
            {/* 左侧：AI 交互区 */}
            <ResizablePanel defaultSize={22} minSize={20} maxSize={40} className="border-r z-10 bg-background">
                <FactoryChatPanel 
                  appId={appId}
                  appType={appType}
                  onCodeGenerated={
                    (code, versionId, isHistoryView) => handleCodeEvent(code, versionId, isHistoryView)
                  }
                />
            </ResizablePanel>
            
            <ResizableHandle className="w-[1px] bg-border" />
            
            {/* 右侧：预览与代码区 */}
            <ResizablePanel defaultSize={78}>
                <FactoryPreviewContainer 
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
