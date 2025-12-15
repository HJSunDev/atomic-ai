"use client";

import { useState, useEffect } from "react";
import { useAiContextStore } from "@/store/home/use-ai-context-store";
import { ScanEye, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SceneContextIndicator() {
  // 直接订阅 getter 函数的存在性
  const sceneContextGetter = useAiContextStore((s) => s.sceneContextGetter);
  const [context, setContext] = useState<{ type: string; content: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 当场景切换时重置
  useEffect(() => {
    setContext(null);
  }, [sceneContextGetter]);

  const handleMouseEnter = () => {
    if (sceneContextGetter) {
      const data = sceneContextGetter();
      setContext(data);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  if (!sceneContextGetter) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div 
          className={cn(
            "flex items-center gap-1.5 px-2 h-6 rounded-md cursor-help transition-all duration-200",
            "text-muted-foreground/60 hover:text-foreground",
            "hover:bg-muted/60"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ScanEye className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium select-none">
            Context
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        className="w-[320px] p-0 overflow-hidden rounded-lg shadow-lg border border-border/40 bg-background/95 backdrop-blur-sm"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={handleMouseLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
          {/* 头部 */}
          <header className="px-3 py-2.5 bg-muted/30 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-background border border-border/50 shadow-sm text-muted-foreground">
                <AlignLeft className="w-3 h-3" />
              </span>
              <span className="text-xs font-medium text-foreground/80">
                {context?.type || "Loading..."}
              </span>
            </div>
            {context && (
              <span className="text-[10px] text-muted-foreground/70 font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                {context.content.length} chars
              </span>
            )}
          </header>
          
          {/* 内容区域 */}
          <article className="max-h-[300px] overflow-y-auto p-3 bg-muted/5">
            {context ? (
              <pre className="text-[10px] leading-relaxed text-muted-foreground font-mono whitespace-pre-wrap break-all select-text">
                {context.content}
              </pre>
            ) : (
              <div className="h-20 flex items-center justify-center text-xs text-muted-foreground/40">
                Reading context...
              </div>
            )}
          </article>
      </PopoverContent>
    </Popover>
  );
}
