import React from "react";
import Link from "next/link";
import { ChevronLeft, Code2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FactoryHeaderProps {
  title: string;
  description?: string;
  version: number;
  onPublish?: () => void;
}

export function FactoryHeader({ 
  title, 
  description, 
  version, 
  onPublish 
}: FactoryHeaderProps) {
  return (
    <header className="h-14 border-b flex items-center px-4 justify-between shrink-0 bg-white dark:bg-slate-950 z-10">
      <div className="flex items-center">
        {/* 返回工坊 (面包屑层级 1) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-muted-foreground hover:text-foreground px-2"
              asChild
            >
              <Link href="/home/factory">
                <ChevronLeft className="w-4 h-4" />
                <span className="font-medium text-sm">工坊</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>返回工坊列表</p>
          </TooltipContent>
        </Tooltip>

        {/* 分隔符 */}
        <span className="mx-2 text-muted-foreground/20 text-lg font-light">/</span>

        {/* 当前应用 (面包屑层级 2) */}
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm">{title}</h2>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border">
            v{version}.0
          </span>
        </div>
      </div>

      {/* 右侧操作栏 */}
      <div className="flex items-center gap-2">
        <Button 
            size="sm" 
            className="text-xs flex items-center gap-1 h-8"
            onClick={onPublish}
        >
            <Play className="w-3 h-3" />
            发布
        </Button>
      </div>
    </header>
  );
}

