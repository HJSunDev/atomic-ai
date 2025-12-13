import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Message } from "./AiChatCore";
import { type SceneAction, type AiMessage } from "@/store/home/use-ai-context-store";

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
      // 这里未来可以集成 toast.error("操作失败")
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* 分隔线：将通用操作(如复制)与场景操作分开 */}
      <div className="w-px h-3 bg-border mx-1" />
      
      {visibleActions.map((action) => {
        const Icon = action.icon;
        const isLoading = executingId === action.id;

        return (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors border select-none",
              // 根据 variant 应用不同的样式
              action.variant === 'secondary' 
                ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50 dark:hover:bg-blue-900/60"
                : action.variant === 'outline'
                  ? "bg-transparent text-foreground border-border hover:bg-accent"
                  : action.variant === 'ghost'
                    ? "bg-transparent border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground", // default
              isLoading && "opacity-70 cursor-wait"
            )}
            title={action.tooltip || action.label}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : Icon ? (
              <Icon className="w-3 h-3" />
            ) : null}
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
