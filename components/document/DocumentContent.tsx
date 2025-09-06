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
import { Check, X, MoreHorizontal } from "lucide-react";

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

  // 基于显示模式的内容区内边距映射：
  // 通过集中配置的方式统一管理三种模式下的水平留白，避免在各容器和页面中分散定义。
  // 全屏模式的边距在页面层（`/home/prompt-document`）已有自定义处理，为避免叠加，这里保持为空。
  const contentPaddingByMode: Record<'drawer' | 'modal' | 'fullscreen', string> = {
    drawer: 'px-12',
    modal: 'px-21',
    fullscreen: '',
  };

  // 自定义SVG图标组件
  const SideIcon = () => (
    <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" className="w-5 h-5" style={{ fill: '#737270' }}>
      <path d="M10.392 6.125a.5.5 0 0 0-.5.5v6.75a.5.5 0 0 0 .5.5h4.683a.5.5 0 0 0 .5-.5v-6.75a.5.5 0 0 0-.5-.5z"></path>
      <path d="M4.5 4.125A2.125 2.125 0 0 0 2.375 6.25v7.5c0 1.174.951 2.125 2.125 2.125h11a2.125 2.125 0 0 0 2.125-2.125v-7.5A2.125 2.125 0 0 0 15.5 4.125zM3.625 6.25c0-.483.392-.875.875-.875h11c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-11a.875.875 0 0 1-.875-.875z"></path>
    </svg>
  );

  const CenterIcon = () => (
    <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" className="w-5 h-5" style={{ fill: '#737270' }}>
      <path d="M5.93 7.125a.5.5 0 0 0-.5.5v4.75a.5.5 0 0 0 .5.5h8.145a.5.5 0 0 0 .5-.5v-4.75a.5.5 0 0 0-.5-.5z"></path>
      <path d="M4.5 4.125A2.125 2.125 0 0 0 2.375 6.25v7.5c0 1.174.951 2.125 2.125 2.125h11a2.125 2.125 0 0 0 2.125-2.125v-7.5A2.125 2.125 0 0 0 15.5 4.125zM3.625 6.25c0-.483.392-.875.875-.875h11c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-11a.875.875 0 0 1-.875-.875z"></path>
    </svg>
  );

  const FullIcon = () => (
    <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" className="w-5 h-5" style={{ fill: '#737270' }}>
      <path d="M4.93 6.125a.5.5 0 0 0-.5.5v6.75a.5.5 0 0 0 .5.5h10.145a.5.5 0 0 0 .5-.5v-6.75a.5.5 0 0 0-.5-.5z"></path>
      <path d="M4.5 4.125A2.125 2.125 0 0 0 2.375 6.25v7.5c0 1.174.951 2.125 2.125 2.125h11a2.125 2.125 0 0 0 2.125-2.125v-7.5A2.125 2.125 0 0 0 15.5 4.125zM3.625 6.25c0-.483.392-.875.875-.875h11c.483 0 .875.392.875.875v7.5a.875.875 0 0 1-.875.875h-11a.875.875 0 0 1-.875-.875z"></path>
    </svg>
  );

  const DisplayModeSelector = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="选择显示模式"
          title="选择显示模式"
          className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 focus:outline-none focus:bg-gray-100"
        >
          {displayMode === 'drawer' && <SideIcon />}
          {displayMode === 'modal' && <CenterIcon />}
          {displayMode === 'fullscreen' && <FullIcon />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 p-1" sideOffset={8}>
        <DropdownMenuItem
          onClick={() => handleDisplayModeChange('drawer')}
          className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm hover:bg-gray-50 focus:bg-gray-50"
        >
          <div className="flex items-center justify-center w-5 h-5">
            <SideIcon />
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
            <CenterIcon />
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
            <FullIcon />
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
    <section className="flex flex-col h-full bg-yellow-100">
      {/* Notion风格的简洁头部 */}
      <header className="flex items-center justify-between px-3 py-2 min-h-[48px]">
        <div className="flex items-center gap-2">
          <DisplayModeSelector />
        </div>
        <div className="flex items-center gap-1">
          {/* 更多操作按钮 */}
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 focus:outline-none focus:bg-gray-100"
            aria-label="更多操作"
            title="更多操作"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {/* 关闭按钮 */}
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 focus:outline-none focus:bg-gray-100"
            onClick={onRequestClose ?? close}
            aria-label="关闭"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      
      <main className={`flex-1 overflow-auto ${contentPaddingByMode[displayMode]}`}>
        <DocumentForm />
      </main>
    </section>
  );
};
