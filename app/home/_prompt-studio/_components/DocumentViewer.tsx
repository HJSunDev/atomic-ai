"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useDocumentStore } from "@/store/home/documentStore";
import { DocumentForm } from "./DocumentForm";

// 文档查看器：根据显示模式选择合适的容器（Sheet/Dialog/路由）
export const DocumentViewer = () => {
  const router = useRouter();
  const {
    isOpen,
    displayMode,
    close,
  } = useDocumentStore();

  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭模式菜单
  useEffect(() => {
    if (!modeMenuOpen) return;
    const handleDocClick = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [modeMenuOpen]);

  // 处理显示模式切换
  const handleDisplayModeChange = (mode: 'drawer' | 'modal' | 'fullscreen') => {
    // 使用统一的模式切换方法
    useDocumentStore.getState().switchDisplayMode(mode, {
      onNavigateToFullscreen: () => {
        router.push('/home/prompt-document');
      }
    });
    setModeMenuOpen(false);
  };

  // 模式选择器组件
  const DisplayModeSelector = () => (
    <div className="relative" ref={modeMenuRef}>
      <button
        aria-label="选择显示模式"
        title="选择显示模式"
        onClick={() => setModeMenuOpen((v) => !v)}
        className="h-8 w-8 rounded border flex items-center justify-center text-xs text-gray-500 bg-white hover:bg-gray-50"
      >
        {displayMode === 'drawer' && '⇤'}
        {displayMode === 'modal' && '▭'}
        {displayMode === 'fullscreen' && '⛶'}
      </button>
      {modeMenuOpen && (
        <div className="absolute left-0 top-10 w-40 bg-white border rounded-xl shadow-xl p-1 z-50">
          <button
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50 ${displayMode === 'drawer' ? 'ring-1 ring-gray-200' : ''}`}
            onClick={() => handleDisplayModeChange('drawer')}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border rounded-sm" />
              侧边预览
            </span>
            {displayMode === 'drawer' ? '✓' : ''}
          </button>
          <button
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50 ${displayMode === 'modal' ? 'ring-1 ring-gray-200' : ''}`}
            onClick={() => handleDisplayModeChange('modal')}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border rounded-sm" />
              居中预览
            </span>
            {displayMode === 'modal' ? '✓' : ''}
          </button>
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
            onClick={() => handleDisplayModeChange('fullscreen')}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border rounded-sm" />
              内容区全屏
            </span>
          </button>
        </div>
      )}
    </div>
  );

  // 带模式选择器的表单
  const FormWithModeSelector = () => (
    <div className="flex flex-col h-full">
      {/* 模式选择器头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <DisplayModeSelector />
        <div className="text-xs text-gray-500">文档查看器</div>
      </div>
      
      {/* 表单内容 */}
      <div className="flex-1 overflow-hidden">
        <DocumentForm />
      </div>
    </div>
  );

  if (!isOpen) return null;

  // 侧边抽屉模式
  if (displayMode === 'drawer') {
    return (
      <Sheet open onOpenChange={(open) => !open && close()}>
        <SheetContent side="right" className="sm:max-w-[720px] w-full p-0">
          <SheetTitle className="sr-only">文档查看器</SheetTitle>
          <FormWithModeSelector />
        </SheetContent>
      </Sheet>
    );
  }

  // 居中模态框模式
  if (displayMode === 'modal') {
    return (
      <Dialog open onOpenChange={(open) => !open && close()}>
        <DialogContent className="w-[min(90vw,800px)] max-h-[90vh] p-0">
          <DialogTitle className="sr-only">文档查看器</DialogTitle>
          <FormWithModeSelector />
        </DialogContent>
      </Dialog>
    );
  }

  // 全屏模式由路由页面处理，这里不渲染
  return null;
};
