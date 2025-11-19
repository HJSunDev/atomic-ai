"use client";

import { useState, memo, useCallback } from "react";
import { PromptBoard } from "./PromptBoard";
import { useCreateDocument } from "@/hooks/useCreateDocument";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  MoreHorizontal,
  Plus,
} from "lucide-react";

// Memoize 组件避免不必要的重渲染
const MemoizedPromptBoard = memo(PromptBoard);

export const DocumentCreationView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { createAndOpen, isCreating } = useCreateDocument();
  
  // 使用防抖优化搜索性能
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const handleCreateNewDocument = useCallback(async () => {
    await createAndOpen();
  }, [createAndOpen]);

  return (
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
      {/* 提示词管理看板 */}
      <MemoizedPromptBoard searchTerm={debouncedSearchTerm} />
      <footer className="flex justify-end w-full max-w-[43rem] mx-auto">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70 cursor-pointer">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </footer>
    </section>
  );
};

