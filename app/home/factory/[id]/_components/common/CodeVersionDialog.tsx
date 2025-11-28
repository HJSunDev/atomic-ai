"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Check, RotateCcw, GitCommitHorizontal, Calendar, FileCode } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { cn } from "@/lib/utils";

interface CodeVersionDialogProps {
  versionId: Id<"app_versions"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadVersion?: (code: string, versionId: Id<"app_versions">) => void;
}

/**
 * CodeVersionDialog - 代码版本预览对话框
 * 
 * 功能：
 * - 显示特定版本的代码详情
 * - 支持复制代码
 * - 支持加载该版本代码到编辑器
 */
export function CodeVersionDialog({
  versionId,
  open,
  onOpenChange,
  onLoadVersion,
}: CodeVersionDialogProps) {
  const [copied, setCopied] = useState(false);

  const version = useQuery(
    api.factory.queries.getAppVersion,
    versionId ? { versionId } : "skip"
  );

  const handleCopy = async () => {
    if (version?.code) {
      await navigator.clipboard.writeText(version.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLoadVersion = () => {
    if (version && versionId) {
      onLoadVersion?.(version.code, versionId);
      onOpenChange(false);
    }
  };

  // 格式化时间
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-background rounded-xl border-border/50 shadow-2xl">
        
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCode className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col justify-center">
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  代码快照
                  {version && (
                    <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0 h-5 gap-1 bg-muted text-muted-foreground hover:bg-muted">
                      <GitCommitHorizontal className="w-3 h-3" />
                      v{version.version}
                    </Badge>
                  )}
                </DialogTitle>
                {version?.diffDescription && (
                  <DialogDescription className="text-xs text-muted-foreground line-clamp-1 max-w-[400px] mt-1">
                      {version.diffDescription}
                  </DialogDescription>
                )}
              </div>
            </div>

            {version?._creationTime && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                <span>{formatTime(version._creationTime)}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {version === undefined ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/50">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">正在获取代码...</p>
            </div>
          ) : version === null ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              版本数据不存在或已被移除
            </div>
          ) : (
            <CodeEditor
              value={version.code}
              language="html"
              readOnly={true}
              className="h-full"
              showLineNumbers={true}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-background/50 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-muted-foreground pl-2">
            {version?.code ? `${version.code.length} 字符` : ''}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className={cn(
                "gap-2 transition-all",
                copied && "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制代码
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleLoadVersion}
              className="gap-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              恢复此版本
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

