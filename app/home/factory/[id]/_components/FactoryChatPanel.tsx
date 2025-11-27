"use client";

import { Id } from "@/convex/_generated/dataModel";
import { FactoryChatCore } from "./common/FactoryChatCore";
import { FactoryMessageList } from "./common/FactoryMessageList";
import { FactoryChatInput } from "./common/FactoryChatInput";
import { FactoryEmptyState } from "./common/FactoryEmptyState";

interface FactoryChatPanelProps {
  appId: Id<"apps">;
  appType: "html" | "react";
  onCodeGenerated?: (code: string, versionId: Id<"app_versions">) => void;
}

/**
 * FactoryChatPanel - Factory 工坊聊天面板主容器
 * 
 * 设计理念：
 * - 整合所有子组件，提供统一的聊天界面
 * - 使用 FactoryChatCore 管理状态和业务逻辑
 * - 采用 Render Props 模式实现组件组合
 * - 响应式布局，适配不同屏幕尺寸
 */
export const FactoryChatPanel = ({
  appId,
  appType,
  onCodeGenerated,
}: FactoryChatPanelProps) => {


  return (
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
        <div className="h-full bg-background flex flex-col">
          <section className="flex-1 overflow-y-auto">
            <FactoryMessageList
              messages={messages}
              messagesEndRef={messagesEndRef}
              emptyState={<FactoryEmptyState appType={appType} />}
              streamingMessageId={streamingMessageId}
              isMessagesLoading={isMessagesLoading}
            />
          </section>

          <section className="shrink-0 relative">
            <FactoryChatInput
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
            />
          </section>
        </div>
      )}
    </FactoryChatCore>
  );
};

