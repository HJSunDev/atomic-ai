"use client";

import { useState, memo, useCallback } from "react";
import { useChatStore } from "@/store/home/useChatStore";
import { ModelSelector } from "@/components/ai-chat/ModelSelector";
import { NetworkSearchEntry } from "@/components/ai-chat/NetworkSearchEntry";
import { ContextAdder, type SelectedContext, type ContextUsageType } from "@/components/ai-chat/ContextAdder";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";

// 将不依赖输入状态的组件 memo 化以避免不必要的重新渲染
const MemoizedContextAdder = memo(ContextAdder);
const MemoizedModelSelector = memo(ModelSelector);
const MemoizedNetworkSearchEntry = memo(NetworkSearchEntry);

// 提交时的参数类型
export interface CreationInputPayload {
  userPrompt: string;
  modelId: string;
  webSearchEnabled: boolean;
  userApiKey?: string;
}

// 组件 Props
export interface AiCreationInputProps {
  // 提交回调函数，返回 Promise<{ success: boolean }>
  onSubmit: (payload: CreationInputPayload) => Promise<{ success: boolean }>;
  // 占位符文本
  placeholder?: string;
  // 是否禁用输入（外部控制）
  disabled?: boolean;
}

/**
 * AI 创作输入组件
 * 
 * 职责：
 * - 提供统一的 AI 创作输入界面（文本输入、模型选择、联网搜索等）
 * - 管理输入状态和提交逻辑
 * - 通过 onSubmit 回调将用户输入传递给外部业务逻辑
 * 
 * 设计原则：
 * - 不包含任何业务逻辑（如文档生成、网页生成等）
 * - 只负责采集用户输入和全局设置
 * - 通过回调函数与外部解耦，便于复用
 */
export const AiCreationInput = ({
  onSubmit,
  placeholder = "Make anything...",
  disabled = false,
}: AiCreationInputProps) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState<SelectedContext[]>([]);

  // 从全局 store 读取 AI 设置
  const selectedModel = useChatStore((state) => state.selectedModel);
  const webSearchEnabled = useChatStore((state) => state.webSearchEnabled);
  const userApiKey = useChatStore((state) => state.userApiKey);

  const handleAddContext = useCallback((context: SelectedContext) => {
    setSelectedContexts((prev) => [...prev, context]);
  }, []);

  const handleRemoveContext = useCallback((contextId: string) => {
    setSelectedContexts((prev) => prev.filter((c) => c.id !== contextId));
  }, []);

  const handleUpdateContext = useCallback((contextId: string, newType: ContextUsageType) => {
    setSelectedContexts((prev) =>
      prev.map((c) => (c.id === contextId ? { ...c, type: newType } : c))
    );
  }, []);

  // 处理提交逻辑
  const handleSend = useCallback(async () => {
    if (!userPrompt.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      const result = await onSubmit({
        userPrompt: userPrompt.trim(),
        modelId: selectedModel,
        webSearchEnabled,
        userApiKey: userApiKey || undefined,
        // TODO: 将 selectedContexts 传递给 onSubmit (目前仅前端展示)
      });

      // 如果提交成功，清空输入框
      if (result.success) {
        setUserPrompt("");
        setSelectedContexts([]);
      }
    } finally {
      setIsSending(false);
    }
  }, [userPrompt, isSending, disabled, onSubmit, selectedModel, webSearchEnabled, userApiKey, selectedContexts]);

  // 处理键盘事件：Enter 提交，Shift+Enter 换行
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <section className="max-w-[43rem] w-full mx-auto flex flex-col items-center border border-border rounded-[18px] overflow-hidden shrink-0">
      <header className="w-full p-2">
        <MemoizedContextAdder 
          selectedContexts={selectedContexts}
          onAddContext={handleAddContext}
          onRemoveContext={handleRemoveContext}
          onUpdateContext={handleUpdateContext}
        />
      </header>
      <Textarea
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[68px] max-h-[110px] p-2 border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/80 shadow-none resize-none overflow-y-auto"
        rows={2}
        disabled={isSending || disabled}
      />
      <footer className="flex items-center justify-between w-full p-2">
        <div className="flex items-center gap-2">
          <MemoizedModelSelector />
          <MemoizedNetworkSearchEntry />
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            className="rounded-lg w-7 h-7 bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={!userPrompt.trim() || isSending || disabled}
          >
            <span className="sr-only">Send</span>
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </footer>
    </section>
  );
};

