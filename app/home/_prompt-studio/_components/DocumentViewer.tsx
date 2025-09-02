"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentStore } from "@/store/home/documentStore";
import { DocumentForm } from "./DocumentForm";
import { PanelLeft, Square, Maximize, Check } from "lucide-react";

// 文档查看器：根据显示模式选择合适的容器（Sheet/Dialog/路由）
export const DocumentViewer = () => {
  
  const router = useRouter();

  const isOpen = useDocumentStore((state) => state.isOpen);
  const displayMode = useDocumentStore((state) => state.displayMode);
  const close = useDocumentStore((state) => state.close);
  const switchDisplayMode = useDocumentStore((state) => state.switchDisplayMode);


  // 处理显示模式切换
  const handleDisplayModeChange = (mode: 'drawer' | 'modal' | 'fullscreen') => {
    // 使用通过hook获取的switchDisplayMode方法
    switchDisplayMode(mode, {
      onNavigateToFullscreen: () => {
        router.push('/home/prompt-document');
      }
    });
  };

  // 模式选择器组件：使用DropdownMenu提供更好的用户体验
  const DisplayModeSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="选择显示模式"
          title="选择显示模式"
          className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {displayMode === 'drawer' && <PanelLeft className="h-4 w-4" />}
          {displayMode === 'modal' && <Square className="h-4 w-4" />}
          {displayMode === 'fullscreen' && <Maximize className="h-4 w-4" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-1" sideOffset={8}>
        <DropdownMenuItem
          onClick={() => handleDisplayModeChange('drawer')}
          className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm hover:bg-gray-50 focus:bg-gray-50"
        >
          <div className="flex items-center justify-center w-5 h-5">
            <PanelLeft className="h-4 w-4 text-gray-500" />
          </div>
          <span className="flex-1">侧边预览</span>
          {displayMode === 'drawer' && (
            <Check className="h-4 w-4 text-blue-600" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDisplayModeChange('modal')}
          className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm hover:bg-gray-50 focus:bg-gray-50"
        >
          <div className="flex items-center justify-center w-5 h-5">
            <Square className="h-4 w-4 text-gray-500" />
          </div>
          <span className="flex-1">居中预览</span>
          {displayMode === 'modal' && (
            <Check className="h-4 w-4 text-blue-600" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDisplayModeChange('fullscreen')}
          className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm hover:bg-gray-50 focus:bg-gray-50"
        >
          <div className="flex items-center justify-center w-5 h-5">
            <Maximize className="h-4 w-4 text-gray-500" />
          </div>
          <span className="flex-1">内容区全屏</span>
          {displayMode === 'fullscreen' && (
            <Check className="h-4 w-4 text-blue-600" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // 带模式选择器的表单
  const FormWithModeSelector = () => (
    <div className="flex flex-col h-full">
      {/* 模式选择器头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <DisplayModeSelector />
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
        <SheetContent side="right" className="sm:max-w-[720px] w-full p-0" showCloseButton={false}>
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
        <DialogContent className="w_[min(90vw,800px)] max-h-[90vh] p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">文档查看器</DialogTitle>
          <FormWithModeSelector />
        </DialogContent>
      </Dialog>
    );
  }

  // 全屏模式由路由页面处理，这里不渲染
  return null;
};
