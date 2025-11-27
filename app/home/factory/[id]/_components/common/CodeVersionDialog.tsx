"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Download } from "lucide-react";
import { useState } from "react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            代码版本 v{version?.version || "?"}
          </DialogTitle>
          <DialogDescription>
            {version?.diffDescription || "查看此版本的完整代码"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {version === undefined ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : version === null ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              版本不存在或已被删除
            </div>
          ) : (
            <>
              {/* 代码预览区 */}
              <div className="flex-1 overflow-auto bg-muted/30 rounded-lg p-4">
                <pre className="text-sm">
                  <code className="language-html">{version.code}</code>
                </pre>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
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
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  加载此版本
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

