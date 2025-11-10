import React, { useState, useRef, useEffect } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/home/useChatStore";
import { ThinkingCursor, TypingCursor } from "@/components/custom";
import { ChatInputHandle } from "./ChatInput";

// 消息类型定义 
export interface Message {
  _id: Id<"messages">;
  conversationId: Id<"conversations">;
  parentMessageId?: Id<"messages">;
  role: "user" | "assistant" | "system";
  content: string;
  isChosenReply?: boolean; // 可选字段
  metadata?: {
    aiModel?: string;
    tokensUsed?: number;
    durationMs?: number;
  };
  // 为了支持 Agent 联网搜索步骤展示，这里增加 steps 字段
  steps?: AgentStep[];
  _creationTime: number;
}


export interface AgentStepResult {
  title: string;
  url: string;
  content?: string;
  score?: number;
  favicon?: string;
}

export interface AgentStep {
  type: string; // 例如 "web_search"
  status: "started" | "in_progress" | "completed" | "failed";
  input?: any;
  output?: AgentStepResult[];
  error?: string;
}

// AiChatCore 组件属性
export interface AiChatCoreProps {
  children: (props: AiChatRenderProps) => React.ReactNode;
  // 可选的系统提示
  systemPrompt?: string;
}

// 传递给子组件的渲染属性
export interface AiChatRenderProps {
  messages: Message[];
  isSendingMessage: boolean;
  isMessagesLoading: boolean;
  isStreaming: boolean; // 是否正在流式传输
  streamingMessageId: Id<"messages"> | null; // 正在流式传输的消息ID
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  chatInputRef: React.RefObject<ChatInputHandle | null>;
  handlePromptClick: (promptText: string) => void;
  handleSendMessage: (messageContent: string) => void;
  // 会话管理功能
  handleNewConversation: () => void;
  handleSelectConversation: (conversationId: Id<"conversations">) => void;
  currentConversationId: Id<"conversations"> | null;
  conversations: any[] | undefined;
}

export function AiChatCore({ 
  children, 
  systemPrompt,
}: AiChatCoreProps) {
  // 认证状态
  const { isSignedIn } = useUser();
  
  // 全局聊天状态管理
  const { 
    currentConversationId, 
    selectedModel,
    selectConversation,
    startNewConversation,
    setSelectedModel,
    userApiKey,
    webSearchEnabled,
  } = useChatStore();
  
  // 是否正在发送消息的状态
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  // 当前正在流式传输的消息ID（如无则为null）
  const [streamingMessageId, setStreamingMessageId] = useState<Id<"messages"> | null>(null);
  
  // DOM引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // ChatInput 组件的 ref，用于调用其暴露的方法
  const chatInputRef = useRef<ChatInputHandle>(null);
  
  // Convex hooks
  const startNewChatRound = useMutation(api.chat.mutations.startNewChatRound);
  const streamAssistantResponse = useAction(api.chat.action.streamAssistantResponse);
  
  // 获取会话列表
  const conversations = useQuery(
    api.chat.queries.getUserConversations,
    isSignedIn ? {} : "skip"
  );

  // 获取当前会话的消息
  const messages = useQuery(
    api.chat.queries.getConversationMessages,
    currentConversationId ? { conversationId: currentConversationId } : "skip"
  );

  // 消息加载中状态：有选中的会话但消息数据尚未获取时为true
  const isMessagesLoading = currentConversationId !== null && messages === undefined;

  // 监听流式传输状态 - 当消息元数据更新完成时清除流式状态
  useEffect(() => {
    if (!streamingMessageId || !messages) return;

    const streamingMessage = messages.find((m) => m._id === streamingMessageId);
    
    // 如果找到消息且已有完整元数据，说明流式传输完成
    if (streamingMessage && streamingMessage.metadata?.durationMs) {
      setStreamingMessageId(null);
    }
  }, [messages, streamingMessageId]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理提示点击 - 通过 ref 设置输入框的值
  const handlePromptClick = (promptText: string) => {
    const placeholderText = "&&&";
    const placeholderIndex = promptText.indexOf(placeholderText);
    
    if (placeholderIndex !== -1) {
      // 包含占位符的情况：移除占位符并设置光标位置
      const newText = promptText.replace(placeholderText, "");
      chatInputRef.current?.setInputValue(newText);
      chatInputRef.current?.focus();
      setTimeout(() => {
        chatInputRef.current?.setSelectionRange(placeholderIndex, placeholderIndex);
      }, 0);
    } else {
      // 不包含占位符：直接设置文本并聚焦
      chatInputRef.current?.setInputValue(promptText);
      chatInputRef.current?.focus();
    }
  };

  // 发送消息 - 接收消息内容作为参数
  const handleSendMessage = async (messageContent: string) => {
    // 验证条件：输入不为空、未登录、不在加载中、不在流式传输中
    const trimmedContent = messageContent.trim();
    if (!trimmedContent || isSendingMessage || !isSignedIn || streamingMessageId) return;

    setIsSendingMessage(true);

    try {
      // 步骤1: 快速创建消息占位符
      const result = await startNewChatRound({
        userMessage: trimmedContent,
        conversationId: currentConversationId || undefined,
      });

      if (result) {
        const { conversationId, assistantMessageId } = result;
        
        // 如果是新会话，更新全局状态
        if (!currentConversationId) {
          selectConversation(conversationId);
        }
        
        // 设置流式传输状态
        setStreamingMessageId(assistantMessageId);

        // 步骤2: 异步开始流式传输（不使用await，让它在后台运行）
        streamAssistantResponse({
          conversationId,
          assistantMessageId,
          modelId: selectedModel,
          userApiKey: userApiKey || undefined,
          systemPrompt: systemPrompt || undefined,
          agentFlags: {
            webSearch: webSearchEnabled,
          },
        }).catch((error) => {
          console.error("流式传输失败:", error);
          // 清除流式状态，允许用户重试
          setStreamingMessageId(null);
        });
      }
    } catch (error) {
      console.error("创建聊天回合失败:", error);
      // 在实际应用中可以显示Toast通知
    } finally {
      // 立即解除加载状态，允许用户继续输入
      setIsSendingMessage(false);
    }
  };

  // 会话管理功能
  const handleNewConversation = () => {
    startNewConversation();
  };

  const handleSelectConversation = (conversationId: Id<"conversations">) => {
    selectConversation(conversationId);
  };

  // 构建渲染属性
  const renderProps: AiChatRenderProps = {
    messages: messages || [],
    isSendingMessage,
    isMessagesLoading,
    isStreaming: !!streamingMessageId,
    streamingMessageId,
    messagesEndRef,
    chatInputRef,
    handlePromptClick,
    handleSendMessage,
    handleNewConversation,
    handleSelectConversation,
    currentConversationId,
    conversations,
  };

  return children(renderProps);
}

// 导出用于在Message组件中渲染流式效果的辅助组件
export function MessageStreamingEffects({ 
  message, 
  streamingMessageId 
}: { 
  message: Message; 
  streamingMessageId: Id<"messages"> | null;
}) {
  const isCurrentlyStreaming = streamingMessageId === message._id;
  
  if (!isCurrentlyStreaming) return null;
  
  // 如果消息内容为空，显示思考光标
  if (!message.content) {
    return <ThinkingCursor color="#947DF2" />;
  }
  
  // 如果有内容，显示打字光标
  return <TypingCursor />;
} 