"use client";

import { TestBlock } from "./_components/TestBlock";
import { PromptBoard } from "./_components/PromptBoard";

import { usePromptStore } from "@/store/home/promptStore";
import { useDocumentStore } from "@/store/home/documentStore";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { ModelSelector } from "@/components/ai-chat/ModelSelector";
import { NetworkSearchEntry } from "@/components/ai-chat/NetworkSearchEntry";
import { ContextAdder } from "@/components/ai-chat/ContextAdder";
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
} from "lucide-react";

export const PromptStudioModule = () => {

  // 打开文档创建对话框
  const openCreateDocumentDialog = () => {
    useDocumentStore.getState().switchDisplayMode('modal');
    useDocumentStore.getState().openDocument();
  };

  return (
    // 采用居中布局是为了聚焦输入主任务，后续功能区可按需扩展
    <main className="relative w-full h-full overflow-y-auto bg-background flex flex-col justify-center">

      {/* 欢迎区*/}
      <section>
        <div className="max-w-[48rem] w-full mx-auto py-8 flex flex-col items-center">
          {/* 使用自有头像组件以保持风格统一 */}
          <AiAssistantAvatar />

          {/* 标题采用简洁问句，引导用户输入意图 */}
          <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-center text-foreground">
            How can I help you today?
          </h1>
        </div>
      </section>

      {/* 输入区 */}
      <section className="max-w-[48rem] w-full mx-auto flex flex-col items-center border border-border rounded-[18px] overflow-hidden">
        <header className="w-full p-2">
          <ContextAdder />
        </header>
        <Textarea
          placeholder="Make anything..."
          className="min-h-[68px] max-h-[110px] p-2 border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/80 shadow-none resize-none overflow-y-auto"
          rows={2}
        />
        <footer className="flex items-center justify-between w-full p-2">
          <div className="flex items-center gap-2">
            <ModelSelector />
            <NetworkSearchEntry />
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" className="rounded-lg w-7 h-7 bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
              <span className="sr-only">Send</span>
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </footer>
      </section>

      {/* cardlist区 */}
      <section className="w-full max-w-[48rem] mx-auto mt-4 ">
        <header className="flex items-center justify-between text-sm text-muted-foreground/90 pl-2 ">
            <div className="flex items-center">
              <span>Card List</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground/70 hover:text-foreground ml-1 cursor-pointer"
                      onClick={openCreateDocumentDialog}
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
                placeholder="Search documents..."
                className="h-9 pl-9 text-sm rounded-lg bg-transparent border-0 shadow-none focus-visible:bg-background focus-visible:ring-0 transition-colors"
              />
            </div>
        </header>
        <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ">
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">What's new in Notion AI</span>
                </div>
              </Card>
            </button>
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">Write meeting agenda</span>
                </div>
              </Card>
            </button>
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">Analyze PDFs or images</span>
                </div>
              </Card>
            </button>
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">Create a task tracker</span>
                </div>
              </Card>
            </button>
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">Create video presentation</span>
                </div>
              </Card>
            </button>
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">Draft project proposal</span>
                </div>
              </Card>
            </button>
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">Generate summary report</span>
                </div>
              </Card>
            </button>
            <button className="group text-left">
              <Card className="p-4 h-full transition-colors bg-muted/40 hover:bg-muted/70 border-transparent hover:border-border/50">
                <div className="flex items-center gap-3 h-full">
                  <File className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
                  <span className="text-xs font-medium">Design presentation slides</span>
                </div>
              </Card>
            </button>
        </article>
        <footer className="mt-1 flex justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
        </footer>
      </section>

      {/* 提示词管理区 */}
      {/* <PromptBoard /> */}


    </main>
  );
};
