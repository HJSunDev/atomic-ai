"use client";

import { TestBlock } from "./_components/TestBlock";
import { PromptBoard } from "./_components/PromptBoard";

import { usePromptStore } from "@/store/home/promptStore";
import { useDocumentStore } from "@/store/home/documentStore";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";
import { Card, CardContent } from "@/components/ui/card";
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
  // 当前选中的提示词文档
  const selectedPrompt = usePromptStore((state) => state.selectedPrompt);
  // 清除当前选中提示词文档状态的函数
  const clearSelectedPrompt = usePromptStore((state) => state.clearSelectedPrompt);

  // 打开文档创建对话框
  const openCreateDocumentDialog = () => {
    useDocumentStore.getState().switchDisplayMode('modal');
    useDocumentStore.getState().openDocument();
  };

  return (
    // 采用居中布局是为了聚焦输入主任务，后续功能区可按需扩展
    <main className="relative w-full h-full overflow-y-auto bg-background flex flex-col justify-center">

      {/* 页面标题与说明 */}
      <section className="px-6 max-w-[70rem] w-full mx-auto">

        {/* 当前选择的提示词模块指示器 */}
        {selectedPrompt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <span className="text-sm text-blue-600 font-medium">
                当前选择的提示词模块：
              </span>
              <span className="ml-2 font-bold">{selectedPrompt.title}</span>
            </div>
            <button
              className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
              onClick={clearSelectedPrompt}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              清除选择
            </button>
          </div>
        )}
      </section>

      {/* 中心主视觉与输入区 */}
      <section className="px-6 w-full">
        <div className="max-w-[48rem] w-full mx-auto py-8 flex flex-col items-center">
          {/* 使用自有头像组件以保持风格统一 */}
          <AiAssistantAvatar className="w-16 h-16" />

          {/* 标题采用简洁问句，引导用户输入意图 */}
          <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-center text-foreground">
            How can I help you today?
          </h1>

          {/* 输入卡片：仅静态UI，用于占位后续交互 */}
          <Card className="mt-6 w-full">
            <CardContent className="p-3">
              <Textarea
                placeholder="Make anything..."
                className="min-h-0 p-2 border-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/80 shadow-none resize-none"
                rows={1}
              />
              <div className="mt-2 flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <Button size="icon" className="rounded-lg w-7 h-7 bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground">
                    <span className="sr-only">Send</span>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* cardlist 占位区：以卡片引导常见任务，后续可挂接功能 */}
      <section className="px-6 w-full pb-8 ">
        <div className="max-w-[48rem] w-full mx-auto">
          <header className="flex items-center justify-between text-sm text-muted-foreground/90 mb-3">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="h-9 pl-9 pr-3 text-sm rounded-lg bg-transparent border-0 shadow-none focus-visible:bg-background focus-visible:ring-0 transition-colors"
              />
            </div>
          </header>
          <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <footer className="mt-4 flex justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </footer>

        </div>
      </section>

      {/* 提示词管理区 */}
      {/* <PromptBoard /> */}


    </main>
  );
};
