import React from "react";
import Link from "next/link";
import { ChevronLeft, Play, Globe, Ban, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Id } from "@/convex/_generated/dataModel";

interface FactoryHeaderProps {
  appId: Id<"apps">;
  title: string;
  description?: string;
  version: number;
  isPublished?: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  isPublishing?: boolean;
}

export function FactoryHeader({ 
  appId,
  title, 
  description, 
  version, 
  isPublished,
  onPublish,
  onUnpublish,
  isPublishing
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
          {isPublished && (
            <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 border-green-200 px-1.5 py-0.5 rounded-md border">
              <Globe className="w-3 h-3" />
              已发布
            </span>
          )}
        </div>
      </div>

      {/* 右侧操作栏 */}
      <div className="flex items-center gap-2">
        {isPublished ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1 h-8"
                  onClick={() => window.open(`/share/factory/${appId}`, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  查看分享
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>在新标签页打开分享链接</p>
              </TooltipContent>
            </Tooltip>

            <Button 
                variant="destructive"
                size="sm" 
                className="text-xs flex items-center gap-1 h-8 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none"
                onClick={onUnpublish}
                disabled={isPublishing}
            >
                {isPublishing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <Ban className="w-3 h-3" />
                )}
                取消发布
            </Button>
          </>
        ) : (
            <Button 
                size="sm" 
                className="text-xs flex items-center gap-1 h-8"
                onClick={onPublish}
                disabled={isPublishing}
            >
                {isPublishing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <Play className="w-3 h-3" />
                )}
                发布应用
            </Button>
        )}
      </div>
    </header>
  );
}

