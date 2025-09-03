"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useDocumentStore } from "@/store/home/documentStore";
import { DocumentContent } from "@/components/document/DocumentContent";

// 文档查看器：根据显示模式选择合适的容器（Sheet/Dialog/路由）
export const DocumentViewer = () => {
  
  const isOpen = useDocumentStore((state) => state.isOpen);
  const displayMode = useDocumentStore((state) => state.displayMode);
  const close = useDocumentStore((state) => state.close);


  if (!isOpen) return null;

  // 侧边抽屉模式
  if (displayMode === 'drawer') {
    return (
      <Sheet open onOpenChange={(open) => !open && close()}>
        <SheetContent side="right" className="sm:max-w-[720px] w-full p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">文档查看器</SheetTitle>
          <DocumentContent />
        </SheetContent>
      </Sheet>
    );
  }

  // 居中模态框模式
  if (displayMode === 'modal') {
    return (
      <Dialog open onOpenChange={(open) => !open && close()}>
        <DialogContent className="w_[min(90vw,800px)] max-h-[90vh] p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">文档查看器</DialogTitle>
          <DocumentContent />
        </DialogContent>
      </Dialog>
    );
  }

  // 全屏模式由路由页面处理，这里不渲染
  return null;
};
