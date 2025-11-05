"use client";

import { useState, memo, useCallback } from "react";
import { TestBlock } from "./_components/TestBlock";
import { PromptBoard } from "./_components/PromptBoard";

import { useCreateDocument } from "@/hooks/useCreateDocument";
import { useGenerationOrchestrator } from "@/services/prompt/generationOrchestrator";
import { useChatStore } from "@/store/home/useChatStore";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";
import { ModelSelector } from "@/components/ai-chat/ModelSelector";
import { NetworkSearchEntry } from "@/components/ai-chat/NetworkSearchEntry";
import { ContextAdder } from "@/components/ai-chat/ContextAdder";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

// 将不依赖输入状态的组件 memo 化以避免不必要的重新渲染
const MemoizedPromptBoard = memo(PromptBoard);
const MemoizedContextAdder = memo(ContextAdder);
const MemoizedModelSelector = memo(ModelSelector);
const MemoizedNetworkSearchEntry = memo(NetworkSearchEntry);

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUp,
  X,
  File,
  Search,
  MoreHorizontal,
  Plus,
  Loader2,
} from "lucide-react";


export const PromptStudioModule = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { createAndOpen, isCreating } = useCreateDocument();
  const { startGeneration } = useGenerationOrchestrator();
  // 只订阅需要的状态，避免不必要的重新渲染
  const selectedModel = useChatStore((state) => state.selectedModel);
  
  // 使用防抖优化搜索性能，避免每次输入都触发查询
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const handleCreateNewDocument = useCallback(async () => {
    await createAndOpen();
  }, [createAndOpen]);

  const handleSend = useCallback(async () => {
    if (!userPrompt.trim() || isSending) return;

    setIsSending(true);
    try {
      const result = await startGeneration({
        userPrompt: userPrompt.trim(),
        modelId: selectedModel,
        systemPrompt: "请以文档的形式生成内容，不要添加任何其他内容。",
      });

      if (result.success) {
        setUserPrompt("");
      }
    } finally {
      setIsSending(false);
    }
  }, [userPrompt, isSending, startGeneration, selectedModel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    // 采用可退化的垂直居中：当空间充足时居中，内容超出时自动顶对齐，避免顶部内容不可见
    <main className="relative w-full min-h-[100svh] overflow-y-auto bg-background flex flex-col">
      {/* 使用 my-auto 在可用空间内垂直居中；当内容高度超过视口时，自动变为顶部对齐 */}
      <div className="my-auto">
        {/* 欢迎区*/}
        <section>
          <div className="max-w-[43rem] w-full mx-auto py-8 flex flex-col items-center">
            {/* 使用自有头像组件以保持风格统一 */}
            <AiAssistantAvatar />

            {/* 标题采用简洁问句，引导用户输入意图 */}
            <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-center text-foreground">
              How can I help you today?
            </h1>
          </div>
        </section>
        {/* 输入区 */}
        <section className="max-w-[43rem] w-full mx-auto flex flex-col items-center border border-border rounded-[18px] overflow-hidden shrink-0">
          <header className="w-full p-2">
            <MemoizedContextAdder />
          </header>
          <Textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Make anything..."
            className="min-h-[68px] max-h-[110px] p-2 border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/80 shadow-none resize-none overflow-y-auto"
            rows={2}
            disabled={isSending}
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
                disabled={!userPrompt.trim() || isSending}
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
        {/* 卡片列表区 */}
        <section className="mt-4">
          <header className="flex items-center justify-between text-sm text-muted-foreground/90 pl-2 w-full max-w-[43rem] mx-auto">
              <div className="flex items-center">
                <span>Card List</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground/70 hover:text-foreground ml-1 cursor-pointer"
                        onClick={handleCreateNewDocument}
                        disabled={isCreating}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add new document</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add new document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative w-48 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground"/>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search documents..."
                  className="h-9 pl-9 text-sm rounded-lg bg-transparent border-0 shadow-none focus-visible:bg-background focus-visible:ring-0 transition-colors"
                />
              </div>
          </header>
          {/* 提示词管理区 */}
          <MemoizedPromptBoard searchTerm={debouncedSearchTerm} />
          <footer className="flex justify-end w-full max-w-[43rem] mx-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
          </footer>
        </section>
      </div>
    </main>
  );
};
