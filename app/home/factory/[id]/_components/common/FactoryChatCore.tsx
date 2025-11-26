"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/home/useChatStore";

/**
 * Factory 应用消息类型定义
 * 对应 convex/factory/schema.ts 中的 app_messages 表
 */
export interface AppMessage {
  _id: Id<"app_messages">;
  appId: Id<"apps">;
  role: "user" | "assistant" | "system";
  content: string;
  relatedCodeId?: Id<"app_versions">;
  isStreaming?: boolean;
  _creationTime: number;
}

/**
 * FactoryChatCore 组件属性
 */
export interface FactoryChatCoreProps {
  appId: Id<"apps">;
  appType: "html" | "react";
  onCodeGenerated?: (code: string, versionId: Id<"app_versions">) => void;
  children: (props: FactoryChatRenderProps) => React.ReactNode;
}

/**
 * 传递给子组件的渲染属性
 */
export interface FactoryChatRenderProps {
  messages: AppMessage[];
  isGenerating: boolean;
  isMessagesLoading: boolean;
  streamingMessageId: Id<"app_messages"> | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: (prompt: string) => void;
}

/**
 * FactoryChatCore - Factory 工坊聊天核心逻辑组件
 * 
 * 设计理念：
 * - 使用 Render Props 模式，保持组件逻辑与 UI 分离
 * - 适配 Factory 数据模型（apps/app_messages/app_versions）
 * - 管理代码生成的流式传输状态
 * - 通过回调通知父组件代码生成完成
 */
export function FactoryChatCore({
  appId,
  appType,
  onCodeGenerated,
  children,
}: FactoryChatCoreProps) {
  const { isSignedIn } = useUser();
  const { selectedModel, userApiKey } = useChatStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<Id<"app_messages"> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const streamGenerateApp = useAction(api.factory.action.streamGenerateApp);

  const messages = useQuery(
    api.factory.queries.getAppMessages,
    isSignedIn ? { appId } : "skip"
  );

  const isMessagesLoading = !!(isSignedIn && messages === undefined);

  useEffect(() => {
    if (!streamingMessageId || !messages) return;

    const streamingMessage = messages.find((m) => m._id === streamingMessageId);

    if (streamingMessage && !streamingMessage.isStreaming) {
      setStreamingMessageId(null);
    }
  }, [messages, streamingMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isGenerating || !isSignedIn || streamingMessageId) {
      return;
    }

    setIsGenerating(true);

    try {
      const result = await streamGenerateApp({
        appId,
        userPrompt: trimmedPrompt,
        appType,
        modelId: selectedModel,
        userApiKey: userApiKey || undefined,
      });

      if (result.success && result.code && result.versionId) {
        onCodeGenerated?.(result.code, result.versionId);
      } else if (!result.success && result.error) {
        console.error("代码生成失败:", result.error);
      }
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderProps: FactoryChatRenderProps = {
    messages: messages || [],
    isGenerating,
    isMessagesLoading,
    streamingMessageId,
    messagesEndRef,
    handleSendMessage,
  };

  return <>{children(renderProps)}</>;
}


