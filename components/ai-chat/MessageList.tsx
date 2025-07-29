import React from "react";
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Bot, Clock } from "lucide-react";
import { Message, MessageStreamingEffects } from "./AiChatCore";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  emptyState?: React.ReactNode;
  streamingMessageId?: Id<"messages"> | null; // 流式传输消息ID
  isMessagesLoading?: boolean; // 消息加载状态
}

// 骨架屏组件 - 模拟真实的消息对话结构
const MessagesSkeleton = () => (
  <div className="p-4">
    {/* 模拟用户消息 */}
    <div className="group mb-6">
      <div className="flex flex-col items-end">
        {/* 用户消息气泡骨架 */}
        <div className="w-3/4 bg-gray-100 dark:bg-gray-800 rounded-tl-lg rounded-tr-lg rounded-bl-lg p-4 ml-auto">
          <div className="space-y-2 animate-pulse">
            <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        
        {/* 用户消息时间戳骨架 */}
        <div className="mt-1 mr-2">
          <Skeleton className="h-3 w-12 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>

    {/* 模拟AI消息 */}
    <div className="group mb-6">
      <div className="flex flex-col">
        <div className="w-full">
          {/* AI信息栏骨架 */}
          <div className="flex items-center gap-2 mb-1.5">
            {/* AI头像骨架 - 降低透明度，使用更柔和的颜色 */}
            <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 animate-pulse"></div>
            {/* AI名称骨架 */}
            <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
            {/* 模型标签骨架 */}
            <Skeleton className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          
          {/* AI消息内容骨架 - 模拟多行段落 */}
          <div className="space-y-2">
            <div className="animate-pulse space-y-2">
              <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-11/12 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 模拟第二轮对话 - 用户消息 */}
    <div className="group mb-6">
      <div className="flex flex-col items-end">
        <div className="w-2/3 bg-gray-100 dark:bg-gray-800 rounded-tl-lg rounded-tr-lg rounded-bl-lg p-4 ml-auto">
          <div className="animate-pulse">
            <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="mt-1 mr-2">
          <Skeleton className="h-3 w-12 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>

    {/* 模拟第二轮对话 - AI消息（正在输入状态） */}
    <div className="group mb-2">
      <div className="flex flex-col">
        <div className="w-full">
          {/* AI信息栏骨架 */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 animate-pulse"></div>
            <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          
          {/* 正在输入的内容骨架 - 更短，模拟正在生成 */}
          <div className="space-y-2">
            <div className="animate-pulse space-y-2">
              <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);


export function MessageList({ 
  messages, 
  messagesEndRef, 
  emptyState, 
  streamingMessageId,
  isMessagesLoading,
}: MessageListProps) {

  if (isMessagesLoading) {
    return <MessagesSkeleton />;
  }
  
  if (messages.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  // 格式化时间戳为可读格式
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-4">
      {messages.map((message, index) => (
        <div 
          key={message._id}
          className="group mb-6 last:mb-2"
        >
          {message.role === "user" ? (
            // 用户消息容器
            <div className="flex flex-col items-end">
              {/* 用户消息内容 */}
              <div className="w-3/4 bg-[#F1F2F3] dark:bg-[#2B2B2D] rounded-tl-lg rounded-tr-lg rounded-bl-lg p-4 ml-auto">
                <div className="text-sm whitespace-pre-line">{message.content}</div>
              </div>
              
              {/* 用户消息时间戳 */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-2">
                {formatTimestamp(message._creationTime)}
              </div>
              
              {/* 用户消息功能区 - 根据是否为最后一条消息决定是否默认显示 */}
              <div className={`mt-2 flex items-center gap-1 ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                <button className="w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A]">
                  <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A]">
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          ) : (
            // AI消息容器
            <div className="flex flex-col">
              {/* AI消息内容 */}
              <div className="w-full">
                {/* AI信息栏 */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">OmniAid</span>
                  {message.metadata?.aiModel && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-blue-800 dark:text-blue-200">
                      {message.metadata.aiModel}
                    </span>
                  )}
                </div>
                
                {/* AI消息内容 */}
                <div className="text-sm whitespace-pre-line">
                  {message.content}
                  {/* 流式传输效果 */}
                  <MessageStreamingEffects 
                    message={message} 
                    streamingMessageId={streamingMessageId || null} 
                  />
                </div>
                
                {/* 消息元数据信息 - 只在流式传输完成后显示 */}
                {message.metadata && !streamingMessageId && message.metadata.durationMs && (
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    {message.metadata.tokensUsed && (
                      <span>Tokens: {message.metadata.tokensUsed}</span>
                    )}
                    {message.metadata.durationMs && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {(message.metadata.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                    <span>{formatTimestamp(message._creationTime)}</span>
                  </div>
                )}
              </div>
              
              {/* AI消息功能区 - 根据是否为最后一条消息决定是否默认显示 */}
              <div className={`mt-2 flex items-center gap-1.5 ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A]">
                  <ThumbsUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A]">
                  <ThumbsDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A]">
                  <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A]">
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {/* 用于滚动到底部的空div */}
      <div ref={messagesEndRef} />
    </div>
  );
} 