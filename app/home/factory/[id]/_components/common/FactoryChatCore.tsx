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
  relatedCodeVersion?: number; // 关联的代码版本号（冗余字段，避免 Join 查询）
  isStreaming?: boolean;
  _creationTime: number;
}

/**
 * FactoryChatCore 组件属性
 */
export interface FactoryChatCoreProps {
  appId: Id<"apps">;
  appType: "html" | "react";
  // 增加 isHistoryView 参数，用于区分新生成和历史查看
  onCodeGenerated?: (code: string, versionId: Id<"app_versions">, isHistoryView?: boolean) => void;
  children: (props: FactoryChatRenderProps) => React.ReactNode;
}

/**
 * 传递给子组件的渲染属性
 */
export interface FactoryChatRenderProps {
  messages: AppMessage[];
  isGenerating: boolean; // 对外暴露的状态，包含发送中或流式传输中
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
 * - 状态管理优化：区分 "请求发送中(isSending)" 和 "流式生成中(streamingMessage)"
 */
export function FactoryChatCore({
  appId,
  appType,
  onCodeGenerated,
  children,
}: FactoryChatCoreProps) {
  const { isSignedIn } = useUser();
  const { selectedModel, userApiKey } = useChatStore();

  // isSending: 仅表示API请求正在发送中，未收到响应
  // 一旦收到响应（或失败），此状态即结束
  const [isSending, setIsSending] = useState(false);

  // 用于自动滚动到消息列表底部，确保用户始终看到最新消息
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const streamGenerateApp = useAction(api.factory.action.streamGenerateApp);

  // 未登录用户不应访问消息数据，使用 "skip" 跳过查询以避免不必要的请求
  const messages = useQuery(
    api.factory.queries.getAppMessages,
    isSignedIn ? { appId } : "skip"
  );

  // Convex 查询在加载过程中返回 undefined，需要区分"未登录"和"加载中"两种状态
  const isMessagesLoading = !!(isSignedIn && messages === undefined);

  // 直接从消息列表中查找正在流式传输的消息
  // 这是 Single Source of Truth，不需要维护额外的本地状态
  const streamingMessage = messages?.find((m) => m.isStreaming === true);
  const streamingMessageId = streamingMessage?._id || null;

  // 综合状态：是否正在生成（发送中 或 流式传输中）
  const isGenerating = isSending || !!streamingMessageId;

  // 使用平滑滚动提供更好的用户体验，避免突兀的跳转
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 每当消息列表更新时自动滚动到底部，确保新消息（包括流式消息）始终可见
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    // 多重防护：空消息、正在生成、未登录、流式传输中都不允许发送新消息
    // 这些检查防止了无效提交和并发请求导致的竞态条件
    if (!trimmedPrompt || isGenerating || !isSignedIn) {
      return;
    }

    setIsSending(true);

    try {
      const result = await streamGenerateApp({
        appId,
        userPrompt: trimmedPrompt,
        // 第一阶段先支持 html 模式
        appType: "html",
        modelId: selectedModel,
        // 将空字符串转换为 undefined，避免后端接收到空字符串而非未定义值
        userApiKey: userApiKey || undefined,
      });

      // 仅在成功生成代码时触发 回调，允许父组件执行后续操作（如预览、保存等）
      if (result.success && result.code && result.versionId) {
        // 这里是新生成代码，所以 isHistoryView = false (默认)
        onCodeGenerated?.(result.code, result.versionId, false);
      } else if (!result.success && result.error) {
        console.error("代码生成失败:", result.error);
      }
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      // API 请求结束，后续可能还有流式传输（由 Convex 订阅更新 UI），
      // 或者请求失败。无论如何，这里释放发送锁。
      setIsSending(false);
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
