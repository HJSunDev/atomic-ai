import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Message } from "./AiChatCore";
import { type SceneAction, type AiMessage } from "@/store/home/use-ai-context-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageActionBarProps {
  message: Message;
  actions: SceneAction[];
  className?: string;
}

/**
 * 消息操作栏组件
 * 负责渲染注入的场景操作，并处理执行逻辑和 Loading 状态
 */
export function MessageActionBar({ message, actions, className }: MessageActionBarProps) {
  // 记录正在执行的操作 ID，用于显示 Loading
  const [executingId, setExecutingId] = useState<string | null>(null);

  // 1. 过滤出当前消息可用的操作
  // 将 Message 类型转换为 AiMessage 类型以匹配 SceneAction 的定义
  const visibleActions = actions.filter(action => 
    action.shouldShow ? action.shouldShow(message as unknown as AiMessage) : true
  );

  if (visibleActions.length === 0) return null;

  const handleActionClick = async (action: SceneAction) => {
    try {
      setExecutingId(action.id);
      // 执行操作，支持异步等待
      await action.handler(message as unknown as AiMessage);
    } catch (error) {
      console.error(`Action ${action.id} failed:`, error);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {/* 分隔线：将通用操作(如复制)与场景操作分开 */}
      <div className="w-px h-3 bg-border/60 mx-1" />
      
      <TooltipProvider delayDuration={300}>
        {visibleActions.map((action) => {
          const Icon = action.icon;
          const isLoading = executingId === action.id;

          const ButtonContent = (
            <button
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                // Notion 风格：默认使用无背景、灰色图标
                "text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300",
                isLoading && "opacity-70 cursor-wait"
              )}
              aria-label={action.tooltip}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
            </button>
          );

          if (action.tooltip) {
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  {ButtonContent}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p>{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <React.Fragment key={action.id}>{ButtonContent}</React.Fragment>;
        })}
      </TooltipProvider>
    </div>
  );
}
