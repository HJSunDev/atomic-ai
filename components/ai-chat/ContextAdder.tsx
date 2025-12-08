"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  AtSign, 
  Search, 
  FileText, 
  Loader2, 
  X,
  Check,
  Target,
  Settings2,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// 定义上下文类型，对应后端 ContextBuilder 支持的类型
export type ContextUsageType = "core_task" | "specification" | "background_info";

export interface SelectedContext {
  id: Id<"documents">;
  title: string;
  type: ContextUsageType;
}

export interface ContextAdderProps {
  selectedContexts: SelectedContext[];
  onAddContext: (context: SelectedContext) => void;
  onRemoveContext: (contextId: string) => void;
  onUpdateContext?: (contextId: string, newType: ContextUsageType) => void;
}

// 映射类型到显示配置 (Label, Icon, BadgeVariant, Description)
const TYPE_CONFIG: Record<ContextUsageType, {
  label: string;
  icon: React.ElementType;
  variant: "default" | "secondary" | "outline"; // 对应 Shadcn Badge variants
  className?: string; // 额外的样式微调
  description: string;
}> = {
  core_task: {
    label: "Core Task",
    icon: Target,
    variant: "default",
    description: "Primary objective for the AI"
  },
  specification: {
    label: "Specification",
    icon: Settings2,
    variant: "outline",
    className: "border-orange-500/50 text-orange-700 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20",
    description: "Format constraints & requirements"
  },
  background_info: {
    label: "Background",
    icon: FileText,
    variant: "secondary",
    description: "Reference material & context"
  },
};

export function ContextAdder({
  selectedContexts,
  onAddContext,
  onRemoveContext,
  onUpdateContext,
}: ContextAdderProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  // 防抖搜索
  const debouncedSearch = useDebouncedValue(searchValue, 300);
  
  // 查询文档
  const documents = useQuery(api.prompt.queries.searchDocumentsByTitle, {
    searchTerm: debouncedSearch,
  });

  // 处理选择
  const handleSelect = (doc: Doc<"documents">, type: ContextUsageType = "background_info") => {
    // 检查是否已选择
    if (selectedContexts.some((c) => c.id === doc._id)) {
      return;
    }

    onAddContext({
      id: doc._id,
      title: doc.title || "Untitled",
      type: type, 
    });
    setOpen(false);
    setSearchValue("");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 1. 上下文添加器 Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center h-7 px-2 rounded-md transition-colors",
              "text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer",
              open && "bg-muted text-foreground"
            )}
          >
            <AtSign className="mr-1 h-3.5 w-3.5 opacity-70" />
            Add context
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start" sideOffset={8}>
          <Command shouldFilter={false} className="overflow-hidden rounded-lg border-0 shadow-none">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Search documents..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                autoFocus
              />
              {documents === undefined && (
                <Loader2 className="h-3.5 w-3.5 animate-spin opacity-50" />
              )}
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto py-1">
              {documents === undefined ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Loading...
                </div>
              ) : documents.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                  No documents found.
                </CommandEmpty>
              ) : (
                <CommandGroup heading="Documents">
                  {documents.map((doc) => {
                    const isSelected = selectedContexts.some((c) => c.id === doc._id);
                    return (
                      <CommandItem
                        key={doc._id}
                        // 使用唯一 value 防止同名文档在 hover 时同时高亮
                        value={`${doc.title || "Untitled"}-${doc._id}`}
                        onSelect={() => handleSelect(doc)}
                        className={cn(
                          "relative flex items-center gap-2 px-3 py-2 cursor-pointer group aria-selected:bg-accent",
                          isSelected && "opacity-50 cursor-default"
                        )}
                        disabled={isSelected}
                      >
                        {/* 默认都是作为参考资料添加，所以这里显示 FileText */}
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                        <div className="flex-1 min-w-0 pr-0">
                          <div className="text-sm font-medium truncate text-foreground">
                            {doc.title || "Untitled"}
                          </div>
                          {doc.description && (
                            <div className="text-xs text-muted-foreground truncate opacity-80">
                              {doc.description}
                            </div>
                          )}
                        </div>
                        
                        {/* 悬停时显示的类型选择操作区 - 绝对定位覆盖在右侧 */}
                        {!isSelected && (
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-aria-selected:flex items-center gap-0.5 bg-accent pl-2 py-1 rounded-l-lg shadow-[-8px_0_12px_-4px_hsl(var(--accent))]">
                            {(Object.entries(TYPE_CONFIG) as [ContextUsageType, typeof TYPE_CONFIG[ContextUsageType]][]).map(([type, config]) => {
                              const Icon = config.icon;
                              return (
                                <div
                                  key={type}
                                  role="button"
                                  title={`Add as ${config.label}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(doc, type);
                                  }}
                                  className="p-1.5 rounded-md hover:bg-background/80 hover:text-primary text-muted-foreground/70 transition-colors cursor-pointer"
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isSelected && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 2. 已选上下文展示 (Interactive Badges) */}
      {selectedContexts.map((context) => {
        const config = TYPE_CONFIG[context.type];
        const TypeIcon = config.icon;

        return (
          <Badge
            key={context.id}
            variant={config.variant}
            className={cn(
              "h-7 pl-0 pr-1 gap-0 font-normal transition-all group overflow-hidden",
              // 如果提供了 update 回调，则允许 hover 效果
              onUpdateContext && "hover:ring-1 hover:ring-ring/20",
              config.className
            )}
          >
            {/* 类型切换菜单 Trigger (点击左侧大部分区域) */}
            {onUpdateContext ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 h-full px-2 cursor-pointer focus:outline-none">
                    <TypeIcon className="h-3.5 w-3.5 opacity-70" />
                    <span className="truncate max-w-[120px]">{context.title}</span>
                    <ChevronDown className="h-3 w-3 opacity-30" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Usage Type
                  </DropdownMenuLabel>
                  
                  {(Object.entries(TYPE_CONFIG) as [ContextUsageType, typeof config][]).map(([type, conf]) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => onUpdateContext(context.id, type)}
                      className="gap-2 cursor-pointer"
                    >
                      <conf.icon className={cn(
                        "h-4 w-4",
                        context.type === type ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="flex flex-col gap-0.5">
                        <span className={cn(context.type === type && "font-medium")}>
                          {conf.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground opacity-80">
                          {conf.description}
                        </span>
                      </div>
                      {context.type === type && (
                        <Check className="ml-auto h-3.5 w-3.5" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onRemoveContext(context.id)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 如果没有 update 回调（只读模式），仅展示
              <div className="flex items-center gap-1.5 h-full px-2">
                <TypeIcon className="h-3.5 w-3.5 opacity-70" />
                <span className="truncate max-w-[120px]">{context.title}</span>
              </div>
            )}

            {/* 快速删除按钮 (独立的右侧小按钮) */}
            <div className="h-4 w-[1px] bg-current opacity-20 mx-0.5" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveContext(context.id);
              }}
              className="ml-0.5 rounded-full p-0.5 text-current opacity-60 hover:opacity-100 transition-opacity focus:outline-none cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </button>
          </Badge>
        );
      })}
    </div>
  );
}
