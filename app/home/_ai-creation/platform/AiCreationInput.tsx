"use client";

import { useState, memo, useCallback } from "react";
import { useChatStore } from "@/store/home/useChatStore";
import { ModelSelector } from "@/components/ai-chat/ModelSelector";
import { NetworkSearchEntry } from "@/components/ai-chat/NetworkSearchEntry";
import { ContextAdder, type SelectedContext, type ContextUsageType } from "@/components/ai-chat/ContextAdder";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ArrowUp, Loader2, BrainCircuit, MessageSquare, FileText, Blocks } from "lucide-react";

// 将不依赖输入状态的组件 memo 化以避免不必要的重新渲染
const MemoizedContextAdder = memo(ContextAdder);
const MemoizedModelSelector = memo(ModelSelector);
const MemoizedNetworkSearchEntry = memo(NetworkSearchEntry);

// 定义支持的模式类型
export type CreationMode = "auto" | "chat" | "document" | "app";

// 提交时的参数类型
export interface CreationInputPayload {
  userPrompt: string;
  modelId: string;
  webSearchEnabled: boolean;
  userApiKey?: string;
  // 指定模式
  forcedIntent?: CreationMode;
}

// 组件 Props
export interface AiCreationInputProps {
  // 提交回调函数，返回 Promise<{ success: boolean }>
  onSubmit: (payload: CreationInputPayload, contexts?: SelectedContext[]) => Promise<{ success: boolean }>;
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
  
  // 模式状态，默认为 auto
  const [creationMode, setCreationMode] = useState<CreationMode>("auto");

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

  // 计算动态 Placeholder
  const activePlaceholder = (() => {
    switch (creationMode) {
      case "document": return "Describe the document you want to write...";
      case "chat": return "Ask anything...";
      case "app": return "Describe the app you want to build...";
      default: return placeholder;
    }
  })();

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
        forcedIntent: creationMode, 
      }, selectedContexts);

      // 如果提交成功，清空输入框
      if (result.success) {
        setUserPrompt("");
        setSelectedContexts([]);
      }
    } finally {
      setIsSending(false);
    }
  }, [userPrompt, isSending, disabled, onSubmit, selectedModel, webSearchEnabled, userApiKey, selectedContexts, creationMode]);

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

  // 获取当前模式图标
  const ModeIcon = (() => {
    switch (creationMode) {
      case "chat": return MessageSquare;
      case "document": return FileText;
      case "app": return Blocks;
      default: return BrainCircuit;
    }
  })();

  return (
    <section className="max-w-[43rem] w-full mx-auto flex flex-col items-center border border-border rounded-[18px] overflow-hidden shrink-0 bg-background/50 backdrop-blur-sm transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_2px_rgba(var(--primary),0.05)]">
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
        placeholder={activePlaceholder}
        className="min-h-[68px] max-h-[110px] p-3 border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/60 shadow-none resize-none overflow-y-auto bg-transparent"
        rows={2}
        disabled={isSending || disabled}
      />
      <footer className="flex items-center justify-between w-full p-2 pl-3">
        <div className="flex items-center gap-1">
          {/* [新增] 模式选择器 - 极简 Notion 风格 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-7 w-7 rounded-md transition-all ${
                    creationMode === 'auto' 
                        ? 'text-muted-foreground/70 hover:bg-muted hover:text-foreground cursor-pointer' 
                        : 'text-primary/80 bg-primary/5 hover:bg-primary/10 hover:text-primary cursor-pointer'
                }`}
                disabled={isSending || disabled}
              >
                <ModeIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Routing Mode</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => setCreationMode("auto")} className="gap-2 cursor-pointer">
                <BrainCircuit className="w-4 h-4 text-muted-foreground" />
                <span>Auto Detect</span>
                {creationMode === "auto" && <span className="ml-auto text-xs text-muted-foreground">Default</span>}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setCreationMode("document")} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Document</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setCreationMode("chat")} className="gap-2 cursor-pointer">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span>Chat</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setCreationMode("app")} className="gap-2 cursor-pointer">
                <Blocks className="w-4 h-4 text-muted-foreground" />
                <span>App Factory</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-4 bg-border/60 mx-1" /> {/* 细微的分隔线 */}

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
