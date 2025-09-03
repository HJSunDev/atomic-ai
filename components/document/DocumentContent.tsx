"use client";

import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/home/documentStore";
import { DocumentForm } from "./DocumentForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PanelLeft, Square, Maximize, Check } from "lucide-react";

// 文档内容容器：统一的头部+主体布局，便于在不同容器中复用
interface DocumentContentProps {
  onRequestClose?: () => void;
}

export const DocumentContent = ({ onRequestClose }: DocumentContentProps) => {
  const router = useRouter();
  const displayMode = useDocumentStore((s) => s.displayMode);
  const close = useDocumentStore((s) => s.close);
  const switchDisplayMode = useDocumentStore((s) => s.switchDisplayMode);

  const handleDisplayModeChange = (mode: 'drawer' | 'modal' | 'fullscreen') => {
    switchDisplayMode(mode, {
      onNavigateToHome: () => {
        router.push('/home');
      },
      onNavigateToFullscreen: () => {
        router.push('/home/prompt-document');
      }
    });
  };

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

  return (
    <section className="flex flex-col h-full">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <DisplayModeSelector />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50"
            onClick={onRequestClose ?? close}
            aria-label="关闭"
            title="关闭"
          >
            关闭
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <DocumentForm />
      </main>
    </section>
  );
};
