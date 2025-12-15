import React, { useState } from "react";
import { Copy, Check, Clock, Globe, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { Message, MessageStreamingEffects } from "./AiChatCore";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageRenderer, type MessagePart } from "./MessageRenderer";
import { MessageActionBar } from "./MessageActionBar";
import { type SceneAction } from "@/store/home/use-ai-context-store";
import { FaceIcon } from "@/components/ai-assistant/FaceIcon";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  emptyState?: React.ReactNode;
  streamingMessageId?: Id<"messages"> | null; // 流式传输消息ID
  isMessagesLoading?: boolean; // 消息加载状态
  /** 当前场景注入的动态动作 */
  sceneActions?: SceneAction[];
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

/**
 * 错误匹配模式配置接口
 */
interface ErrorPattern {
  // 匹配器函数：判断是否匹配此错误类型
  matcher: (error: string) => boolean;
  // 友好的错误提示
  friendlyMessage: string;
  // 可选的操作建议
  suggestion?: string;
}

/**
 * 工具调用相关的错误模式配置
 * 采用配置化方式，便于后续扩展新的错误类型
 */
const TOOL_ERROR_PATTERNS: ErrorPattern[] = [
  {
    // 模型不支持工具调用错误
    // 使用多个关键词组合判断，提高匹配的健壮性
    matcher: (error: string) => {
      const lowerError = error.toLowerCase();
      return (
        (lowerError.includes('no endpoints') && lowerError.includes('tool')) ||
        (lowerError.includes('404') && lowerError.includes('tool use')) ||
        lowerError.includes('support tool use')
      );
    },
    friendlyMessage: "该模型尚不支持模型原生工具调用 (Tool Calling)",
    suggestion: "请更换模型联网查询"
  },
  // 未来可以在这里添加更多错误类型，例如：
  // {
  //   matcher: (error) => {
  //     const lower = error.toLowerCase();
  //     return lower.includes('rate limit') || lower.includes('too many requests');
  //   },
  //   friendlyMessage: "请求频率超限",
  //   suggestion: "请稍后再试或降低请求频率"
  // },
];

/**
 * 保底错误提示（用于工具调用步骤）
 * 当所有错误模式都不匹配时使用此提示，避免向用户暴露技术细节
 */
const FALLBACK_ERROR: { message: string; suggestion: string } = {
  message: "工具调用失败且无法匹配任何错误模式，可能是该模型尚不支持模型原生工具调用 (Tool Calling)",
  suggestion: "请更换模型联网查询"
};

/**
 * 将技术性的错误信息转换为用户友好的提示（用于工具调用步骤）
 */
function transformToolError(originalError: string): {
  message: string;
  suggestion?: string;
  isTransformed: boolean;
} {
  // 遍历所有错误模式，找到第一个匹配的
  for (const pattern of TOOL_ERROR_PATTERNS) {
    if (pattern.matcher(originalError)) {
      return {
        message: pattern.friendlyMessage,
        suggestion: pattern.suggestion,
        isTransformed: true
      };
    }
  }
  
  // 如果没有匹配到任何已知模式，使用保底错误提示
  // 避免向用户暴露技术性的错误细节
  return {
    message: FALLBACK_ERROR.message,
    suggestion: FALLBACK_ERROR.suggestion,
    isTransformed: true
  };

  // 返回原始错误信息
  // return {
  //   message: originalError,
  //   suggestion: undefined,
  //   isTransformed: false
  // };
}




/**
 * 消息内容错误匹配模式配置接口
 */
interface MessageErrorPattern {
  // 匹配器函数：判断消息内容是否为此类错误
  matcher: (content: string) => boolean;
  // 转换函数：将错误内容转换为友好提示
  transformer: (originalContent: string) => string;
}

/**
 * 消息内容错误模式配置
 * 用于将AI返回的错误信息转换为用户友好的提示
 */
const MESSAGE_ERROR_PATTERNS: MessageErrorPattern[] = [
  {
    // 429 速率限制错误
    matcher: (content: string) => {
      const lowerContent = content.toLowerCase();
      return (
        lowerContent.includes('429') && 
        lowerContent.includes('provider')
      ) || (
        lowerContent.includes('rate') && 
        lowerContent.includes('limit')
      );
    },
    transformer: () => 
      "⏱️ 该模型服务暂不可用，或遇到速率限制\n\n💡 请稍后再试或者更换模型-429 速率限制错误"
  },
  {
    // 502 网关错误
    matcher: (content: string) => {
      const lowerContent = content.toLowerCase();
      return (
        lowerContent.includes('502') && 
        lowerContent.includes('provider')
      ) || (
        lowerContent.includes('bad gateway') ||
        lowerContent.includes('gateway error')
      );
    },
    transformer: () => 
      "⚠️ 该模型服务暂时不可用\n\n💡 请稍后再试或者更换模型-502 网关错误"
  },
];

/**
 * 将AI消息内容中的技术性错误转换为用户友好的提示
 * 这个函数用于处理整个消息内容，而非工具调用步骤
 * 
 * @param content - 原始消息内容
 * @param status - 消息状态（从 metadata.status 获取）
 * @returns 转换后的消息内容（如果是错误状态且匹配到错误模式则返回友好提示，否则返回原内容）
 */
function transformMessageContent(
  content: string, 
  status?: "success" | "error" | "pending"
): string {
  // 只对明确标记为错误状态的消息进行错误转换
  // 这比之前基于内容长度的判断更准确、更可靠
  if (status !== "error") {
    return content;
  }
  
  // 遍历所有消息错误模式，找到第一个匹配的
  for (const pattern of MESSAGE_ERROR_PATTERNS) {
    if (pattern.matcher(content)) {
      return pattern.transformer(content);
    }
  }
  
  // 如果是错误状态但没有匹配到任何已知错误模式，返回原始内容
  // 这样至少能让用户看到具体的错误信息
  return content;
}

// 为了增强可读性，这里为 Agent 步骤渲染提供一个帮助函数
function StepsPanel({ steps }: { steps: NonNullable<Message["steps"]> }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 计算状态
  const isSearching = steps.some(s => s.status === 'in_progress' || s.status === 'started');
  const failedStep = steps.find(s => s.status === 'failed');
  
  // 收集所有搜索结果
  const allOutputs = steps.flatMap(s => s.output || []);
  const totalResults = allOutputs.length;

  // 概览文案
  let summary = "准备搜索...";
  if (isSearching) summary = "正在搜索互联网...";
  else if (failedStep && totalResults === 0) summary = "搜索过程中遇到问题";
  else if (totalResults > 0) summary = `已找到 ${totalResults} 个相关结果`;
  else summary = "搜索完成";

  return (
    <div className="my-2 rounded-md bg-muted/50 border border-transparent hover:bg-muted/70 transition-colors group/callout">
       {/* Summary Row (Click to toggle) */}
       <div
          className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
       >
          <div className={cn(
            "transition-transform duration-200 text-muted-foreground/70 group-hover/callout:text-muted-foreground", 
            isExpanded && "rotate-90"
          )}>
             <ChevronRight className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {/* Icon based on state */}
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500"/> 
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground/70 group-hover/callout:text-blue-500/80 transition-colors"/>
              )}
              <span className="text-sm text-foreground/80 truncate font-medium">{summary}</span>
          </div>
       </div>

       {/* Expanded Content */}
       {isExpanded && (
          <div className="px-3 pb-3 pl-9 space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
             
             {/* 错误提示 (如果有) */}
             {steps.map((step, idx) => {
               const errorDisplay = step.error ? transformToolError(step.error) : null;
               if (!errorDisplay) return null;
               return (
                 <div key={`err-${idx}`} className="text-xs p-2 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 mb-2">
                    <div className="font-medium">{errorDisplay.message}</div>
                    {errorDisplay.suggestion && <div className="mt-1 opacity-80">💡 {errorDisplay.suggestion}</div>}
                 </div>
               );
             })}

             {/* 结果列表 */}
             {totalResults > 0 ? (
               <div className="space-y-1">
                 {allOutputs.map((res, i) => (
                   <a
                     key={i}
                     href={res.url}
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-start gap-2 p-1.5 rounded-md hover:bg-muted/80 transition-colors group/item no-underline"
                   >
                     <div className="mt-0.5 flex-shrink-0 text-muted-foreground/50 group-hover/item:text-blue-500/70">
                       <ExternalLink className="w-3.5 h-3.5" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="text-sm text-foreground/90 truncate font-medium group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 group-hover/item:underline decoration-blue-500/30 underline-offset-2">
                         {res.title}
                       </div>
                       <div className="text-xs text-muted-foreground/60 truncate mt-0.5 font-mono">
                         {(() => {
                           try {
                             return new URL(res.url).hostname;
                           } catch {
                             return res.url;
                           }
                         })()}
                       </div>
                       {res.content && (
                         <div className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 leading-relaxed border-l-2 border-muted pl-2">
                           {res.content}
                         </div>
                       )}
                     </div>
                   </a>
                 ))}
               </div>
             ) : (
               !isSearching && (
                 <div className="text-xs text-muted-foreground py-2 italic">
                   暂无具体搜索结果
                 </div>
               )
             )}
          </div>
       )}
    </div>
  );
}

export function MessageList({ 
  messages, 
  messagesEndRef, 
  emptyState, 
  streamingMessageId,
  isMessagesLoading,
  sceneActions = [], 
}: MessageListProps) {
  const [copiedId, setCopiedId] = useState<Id<"messages"> | null>(null);

  // 复制消息内容，提供短暂的反馈状态
  const handleCopy = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message._id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      // 保留错误日志，便于排查复制失败原因（如权限或不安全上下文）
      console.error("复制消息内容失败:", error);
    }
  };

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
    <article className="p-4">
      {messages.map((message, index) => (
        <div 
          key={message._id}
          className="group mb-6 last:mb-2"
        >
          {message.role === "user" ? (
            // 用户消息容器
            <section className="flex flex-col items-end">
              {/* 用户消息内容 */}
              <div className="w-3/4 bg-[#F1F2F3] dark:bg-[#2B2B2D] rounded-tl-lg rounded-tr-lg rounded-bl-lg p-4 ml-auto">
                <MessageRenderer
                  className="prose prose-sm dark:prose-invert max-w-none text-sm"
                  parts={[{ type: "md", content: message.content } satisfies MessagePart]}
                />
              </div>
              
              {/* 用户消息时间戳 */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-2">
                {formatTimestamp(message._creationTime)}
              </div>
              
              {/* 用户消息功能区 - 仅保留复制 */}
              <footer className={`mt-2 flex items-center gap-1 ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                <button
                  className="w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A] cursor-pointer"
                  onClick={() => handleCopy(message)}
                  aria-label="复制消息"
                >
                  {copiedId === message._id ? (
                    <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-200" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </footer>
            </section>
          ) : (
            // AI消息容器
            <section className="flex flex-col">
              {/* AI消息内容 */}
              <div className="w-full">
                {/* AI信息栏 */}
                <div className="flex items-center gap-2 mb-1.5">
                  {/* 仅添加 ring-1 ring-black/5 dark:ring-white/10 */}
                  <div className="w-7 h-7 rounded-full bg-transparent flex-shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                    <FaceIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                  </div>
                  <span className="text-sm font-medium">OmniAid</span>
                  {message.metadata?.aiModel && (
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800/50">
                      {message.metadata.aiModel}
                    </span>
                  )}
                </div>

                {/* 联网搜索步骤：显示在 AI 内容上方 */}
                {Array.isArray(message.steps) && message.steps.length > 0 && (
                  <StepsPanel steps={message.steps} />
                )}
                
                {/* AI消息内容 */}
                <div className="markdown-content">
                  <MessageRenderer
                    className="prose prose-sm dark:prose-invert max-w-none text-sm"
                    parts={[{ 
                      type: "md", 
                      content: transformMessageContent(
                        message.content, 
                        message.metadata?.status
                      ) 
                    } satisfies MessagePart]}
                  />
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
              
              {/* AI消息功能区 */}
              <footer className={`mt-2 flex items-center gap-1.5 flex-wrap ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                <button
                  className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center bg-white dark:bg-[#27272A] cursor-pointer"
                  onClick={() => handleCopy(message)}
                  aria-label="复制AI回复"
                >
                  {copiedId === message._id ? (
                    <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-200" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  )}
                </button>

                {/* 场景注入的动态操作 */}
                {sceneActions && sceneActions.length > 0 && (
                  <MessageActionBar 
                    message={message} 
                    actions={sceneActions} 
                  />
                )}
              </footer>
            </section>
          )}
        </div>
      ))}
      {/* 用于滚动到底部的空div */}
      <aside className="h-4" ref={messagesEndRef} />
    </article>
  );
} 