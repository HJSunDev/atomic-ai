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

// 为了实现数据与UI的解耦，提高代码的可维护性和可扩展性
// 定义卡片数据接口，确保类型安全
interface PromptCardData {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 模拟的卡片数据，集中管理以便后续维护和扩展
const mockPromptCards: PromptCardData[] = [
  {
    id: "notion-ai",
    title: "What's new in Notion AI",
    icon: File,
  },
  {
    id: "meeting-agenda",
    title: "Write meeting agenda",
    icon: File,
  },
  {
    id: "analyze-pdfs",
    title: "Analyze PDFs or images",
    icon: File,
  },
  {
    id: "task-tracker",
    title: "Create a task tracker",
    icon: File,
  },
  {
    id: "video-presentation",
    title: "Create video presentation",
    icon: File,
  },
  {
    id: "project-proposal",
    title: "Draft project proposal",
    icon: File,
  },
  {
    id: "summary-report",
    title: "Generate summary report",
    icon: File,
  },
  {
    id: "presentation-slides",
    title: "Design presentation slides",
    icon: File,
  },
];

// 为了提高代码的模块化和可重用性，创建独立的卡片组件
// 单一职责原则：只负责单个卡片的渲染
interface PromptCardProps {
  card: PromptCardData;
}

const PromptCard = ({ card }: PromptCardProps) => {
  const IconComponent = card.icon;

  // 为了在调试阶段显示右下角的文件图标和数字
  // 后续可以根据实际需求调整显示条件
  const showBadge = true; // 当前设为true用于调试

  return (
    <div className="relative p-[12px] bg-[#422303]/3 rounded-[16px] cursor-pointer text-[#807d78] flex flex-col text-[12px] whitespace-nowrap">
      <IconComponent className="w-4 h-4 text-muted-foreground/90 flex-shrink-0" />
      <span className="truncate mt-[6px]">{card.title}</span>

      {/* 右下角的文件图标和数字徽章 - 条件显示 */}
      {showBadge && (
        <div className="absolute bottom-[-1] right-[0.5]">
          <div className="flex items-center gap-[4px] bg-white rounded-[6px] px-1 py-[2px] border border-border/50 shadow-sm">
            <File className="w-[10px] h-[10px] text-muted-foreground/70" />
            <span className="text-[12px] text-black leading-none">3</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PromptStudioModule = () => {

  // 打开文档创建对话框
  const openCreateDocumentDialog = () => {
    useDocumentStore.getState().switchDisplayMode('modal');
    useDocumentStore.getState().openDocument();
  };

  return (
    // 采用居中布局是为了聚焦输入主任务，后续功能区可按需扩展
    <main className="relative w-full h-full overflow-y-auto bg-background flex flex-col">

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

      {/* 卡片列表区 */}
      <section className="w-full max-w-[43rem] mx-auto mt-4 ">
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
        {/* 使用数据驱动的方式渲染卡片列表，提高可维护性 */}
        <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {mockPromptCards.map((card) => (
            <PromptCard key={card.id} card={card} />
          ))}
        </article>
        <footer className="mt-1 flex justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
        </footer>
          {/* 提示词管理区 */}
        <PromptBoard />
      </section>

    </main>
  );
};
