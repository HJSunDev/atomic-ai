import React from "react";
import { Clock, GitCommitHorizontal, Loader2 } from "lucide-react";
import { AppMessage } from "./FactoryChatCore";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageRenderer, type MessagePart } from "@/components/ai-chat/MessageRenderer";
import { ThinkingCursor, TypingCursor } from "@/components/custom";
import { cn } from "@/lib/utils";
import { FaceIcon } from "@/components/ai-assistant/FaceIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FactoryMessageListProps {
  messages: AppMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  emptyState?: React.ReactNode;
  streamingMessageId?: Id<"app_messages"> | null;
  isMessagesLoading?: boolean;
  onVersionClick?: (versionId: Id<"app_versions">) => void; // 点击版本标签时的回调
}



// 在流式阶段隐藏分隔符后的长代码，仅保留说明文字，并决定是否展示占位提示
function sliceContentForStreaming(content: string, isStreaming: boolean) {
  if (!isStreaming) {
    return { displayMd: content, showArtifactPlaceholder: false };
  }

  // 兼容不规范分隔符（缺冒号/多空格/大小写），仅找首个出现位置
  const delimiterIndex = content.search(/:::?\s*artifact/i);
  if (delimiterIndex === -1) {
    return { displayMd: content, showArtifactPlaceholder: false };
  }

  const before = content.slice(0, delimiterIndex).trim();
  return {
    displayMd: before,
    showArtifactPlaceholder: true,
  };
}

// Notion 风格的轻量占位，提示代码正在生成，避免长代码刷屏
function StreamingArtifactPlaceholder() {
  return (
    <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
      <Loader2 className="h-3.5 w-3.5 animate-spin opacity-80" />
      <span className="opacity-90">代码生成中，正在写入片段…</span>
    </div>
  );
}

/**
 * 消息加载骨架屏
 * 用于在首次加载消息时提供视觉反馈
 */
const MessagesSkeleton = () => (
  <div className="p-4 space-y-6">
    <div className="flex flex-col items-end">
      <div className="w-3/4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ml-auto">
        <div className="space-y-2 animate-pulse">
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="mt-1 mr-2">
        <Skeleton className="h-3 w-12 bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>

    <div className="flex flex-col">
      <div className="w-full">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 animate-pulse"></div>
          <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="space-y-2 animate-pulse">
          <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-11/12 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * 格式化时间戳为可读的时间格式
 * 
 * 设计原因：
 * - 纯函数，不依赖组件状态或 props，应放在组件外部避免每次渲染重新创建
 * - 提取到组件外部符合 React 最佳实践，减少不必要的函数创建开销
 * - 对于大量消息列表，避免函数重复创建可以带来轻微的性能提升
 * 
 * @param timestamp Unix 时间戳（毫秒）
 * @returns 格式化的时间字符串，格式为 "HH:mm"
 */
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 流式传输效果组件
 * 根据消息内容显示思考光标或打字光标
 */
function MessageStreamingEffects({
  message,
  streamingMessageId,
}: {
  message: AppMessage;
  streamingMessageId: Id<"app_messages"> | null;
}) {
  const isCurrentlyStreaming = streamingMessageId === message._id;

  if (!isCurrentlyStreaming) return null;

  if (!message.content) {
    return <ThinkingCursor color="#947DF2" />;
  }

  return <TypingCursor />;
}

/**
 * FactoryMessageList - Factory 工坊消息列表组件
 * 
 * 设计要点：
 * - 适配 Factory 数据模型（app_messages）
 * - 简化的 UI，移除不需要的功能（点赞、复制等）
 * - 显示代码版本关联信息
 * - 支持流式传输效果
 */
export function FactoryMessageList({
  messages,
  messagesEndRef,
  emptyState,
  streamingMessageId,
  isMessagesLoading,
  onVersionClick,
}: FactoryMessageListProps) {
  
  if (isMessagesLoading) {
    return <MessagesSkeleton />;
  }

  if (messages.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <article className="p-4">
      {messages.map((message, index) => (
        <section key={message._id} className="group mb-6 last:mb-2">
          {message.role === "user" ? (
            <section className="flex flex-col items-end">
              <div className="w-3/4 bg-[#F1F2F3] dark:bg-[#2B2B2D] rounded-tl-lg rounded-tr-lg rounded-bl-lg p-4 ml-auto">
                <MessageRenderer
                  className="prose prose-sm dark:prose-invert max-w-none text-sm"
                  parts={[{ type: "md", content: message.content } satisfies MessagePart]}
                />
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-2">
                {formatTimestamp(message._creationTime)}
              </div>
            </section>
          ) : (
            <section className="flex flex-col">
              <div className="w-full">
                <header className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-transparent flex-shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                    <FaceIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                  </div>
                  <span className="text-sm font-medium text-foreground/80">AI 工坊</span>
                  {message.relatedCodeId && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onVersionClick?.(message.relatedCodeId!)}
                          className={cn(
                            "group/version flex items-center gap-1.5 px-2 py-0.5 ml-1 rounded-md transition-all",
                            "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary",
                            "cursor-pointer select-none"
                          )}
                        >
                          <GitCommitHorizontal className="w-3.5 h-3.5 opacity-60 group-hover/version:opacity-100 transition-opacity" />
                          <span className="text-xs font-mono opacity-80 group-hover/version:opacity-100">
                            v{message.relatedCodeVersion || '?'}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>查看代码快照 v{message.relatedCodeVersion || '?'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </header>

                {(() => {
                  const isAssistantStreaming = streamingMessageId === message._id;
                  const { displayMd, showArtifactPlaceholder } = sliceContentForStreaming(
                    message.content,
                    isAssistantStreaming
                  );

                  return (
                    <>
                      <div className="markdown-content">
                        <MessageRenderer
                          className="prose prose-sm dark:prose-invert max-w-none text-sm"
                          parts={[{ type: "md", content: displayMd } satisfies MessagePart]}
                        />
                        {/* 当开始生成代码（显示占位符）时，说明文字已生成完毕，隐藏文本光标，避免视觉干扰 */}
                        {!showArtifactPlaceholder && (
                          <MessageStreamingEffects
                            message={message}
                            streamingMessageId={streamingMessageId || null}
                          />
                        )}
                      </div>

                      {showArtifactPlaceholder && <StreamingArtifactPlaceholder />}
                    </>
                  );
                })()}

                {!streamingMessageId && (
                  <footer className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(message._creationTime)}
                    </span>
                  </footer>
                )}
              </div>
            </section>
          )}
        </section>
      ))}
      <aside className="h-4" ref={messagesEndRef} />
    </article>
  );
}


