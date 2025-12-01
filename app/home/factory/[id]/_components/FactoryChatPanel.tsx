"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { FactoryChatCore } from "./common/FactoryChatCore";
import { FactoryMessageList } from "./common/FactoryMessageList";
import { FactoryChatInput } from "./common/FactoryChatInput";
import { FactoryEmptyState } from "./common/FactoryEmptyState";
import { CodeVersionDialog } from "./common/CodeVersionDialog";

interface FactoryChatPanelProps {
  appId: Id<"apps">;
  appType: "html" | "react";
  onCodeGenerated?: (code: string, versionId: Id<"app_versions">, isHistoryView?: boolean) => void;
}

/**
 * FactoryChatPanel - Factory 工坊聊天面板主容器
 */
export const FactoryChatPanel = ({
  appId,
  appType,
  onCodeGenerated,
}: FactoryChatPanelProps) => {
  const [selectedVersionId, setSelectedVersionId] = useState<Id<"app_versions"> | null>(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);

  // 点击消息列表 版本号触发-查看预览版本代码
  const handleVersionClick = (versionId: Id<"app_versions">) => {
    setSelectedVersionId(versionId);
    setIsVersionDialogOpen(true);
  };

  // 处理加载版本代码
  const handleLoadVersion = (code: string, versionId: Id<"app_versions">) => {
    // 这里是显式加载历史版本，所以 isHistoryView = true
    onCodeGenerated?.(code, versionId, true);
  };

  return (
    <>
      <FactoryChatCore
        appId={appId}
        appType={appType}
        onCodeGenerated={onCodeGenerated}
      >
        {({
          messages,
          isGenerating,
          isMessagesLoading,
          streamingMessageId,
          messagesEndRef,
          handleSendMessage,
        }) => (
          <div className="h-full bg-background flex flex-col relative">
            <section className="flex-1 overflow-y-auto">
              <FactoryMessageList
                messages={messages}
                messagesEndRef={messagesEndRef}
                emptyState={
                  <FactoryEmptyState
                    appType={appType}
                    onSelect={handleSendMessage}
                  />
                }
                streamingMessageId={streamingMessageId}
                isMessagesLoading={isMessagesLoading}
                onVersionClick={handleVersionClick}
              />
            </section>

            <section className="shrink-0">
              <FactoryChatInput
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
              />
            </section>
          </div>
        )}
      </FactoryChatCore>

      {/* 代码版本预览对话框 */}
      <CodeVersionDialog
        versionId={selectedVersionId}
        open={isVersionDialogOpen}
        onOpenChange={setIsVersionDialogOpen}
        onLoadVersion={handleLoadVersion}
      />
    </>
  );
};
