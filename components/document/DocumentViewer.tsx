"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useDocumentStore } from "@/store/home/documentStore";
import { DocumentContent } from "@/components/document/DocumentContent";
import { useEffect, useRef } from "react";
import { useAiContextStore, AiContext } from "@/store/home/use-ai-context-store";

// 文档查看器：根据显示模式选择合适的容器（Sheet/Dialog/路由）
export const DocumentViewer = () => {
  
  const isOpen = useDocumentStore((state) => state.isOpen);
  const displayMode = useDocumentStore((state) => state.displayMode);
  const close = useDocumentStore((state) => state.close);

  const { pushContext, popContext } = useAiContextStore();
  // 使用 ref 为每一次“打开”会话创建一个稳定的上下文ID
  const contextIdRef = useRef<string | null>(null);

  // 响应文档打开/关闭/模式切换的副作用
  useEffect(() => {
    if (isOpen) {
      // 当文档打开或切换模式时，生成一个新的、唯一的上下文ID
      const newContextId = `document-${displayMode}-${Date.now()}`;
      contextIdRef.current = newContextId;

      // 创建新的AI上下文对象
      const context: AiContext = {
        id: newContextId,
        type: "document",
        showAiAssistant: true, // 文档视图始终需要AI助手
        catalystPlacement: 'local', // 在Dialog或Sheet中，使用局部唤醒器
        metadata: { displayMode } // 将显示模式作为元数据，未来可能有用
      };
      
      // 将新上下文推入堆栈。
      // useAiContextStore 的 pushContext 实现会处理好ID重复的情况（先移除旧的）。
      pushContext(context);
    } else {
      // 当文档关闭时，如果存在上一个上下文ID，则将其弹出
      if (contextIdRef.current) {
        popContext(contextIdRef.current);
        // 清空ref，为下一次打开做准备
        contextIdRef.current = null;
      }
    }
    // 依赖项：监听打开状态和显示模式的变化
  }, [isOpen, displayMode, pushContext, popContext]);


  if (!isOpen) return null;

  // 侧边抽屉模式
  if (displayMode === 'drawer') {
    return (
      <Sheet open onOpenChange={(open) => !open && close()}>
        <SheetContent side="right" className="sm:max-w-[37rem] w-full p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">文档查看器</SheetTitle>
          <DocumentContent contextId={contextIdRef.current ?? undefined} />
        </SheetContent>
      </Sheet>
    );
  }

  // 居中模态框模式
  if (displayMode === 'modal') {
    return (
      <Dialog open onOpenChange={(open) => !open && close()}>
        <DialogContent className="max-w-none sm:max-w-none w-[54rem] h-[84vh] p-0 overflow-hidden flex flex-col" showCloseButton={false}>
          <DialogTitle className="sr-only">文档查看器</DialogTitle>
          <DocumentContent contextId={contextIdRef.current ?? undefined} />
        </DialogContent>
      </Dialog>
    );
  }

  // 全屏模式由路由页面处理，这里不渲染
  return null;
};
