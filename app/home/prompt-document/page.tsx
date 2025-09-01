"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DocumentForm } from "../_prompt-studio/_components/DocumentForm";
import { useDocumentStore, DocumentDisplayMode } from "@/store/home/documentStore";

// 全屏文档页面
export default function DocumentPage() {
  const router = useRouter();
  const { isOpen, displayMode } = useDocumentStore();
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

  // 检查访问合法性：全屏页面只能在文档已打开时访问
  useEffect(() => {
    if (!isOpen) {
      // 异常访问场景（直接访问URL、刷新等）：重定向到主页
      console.warn('全屏文档页面需要先打开文档，重定向到主页');
      router.replace('/home');
    }
  }, [isOpen, router]);

  // 返回按钮处理
  const handleBack = () => {
    router.push('/home'); // 返回到主页面
  };

  // 处理显示模式切换
  const handleDisplayModeChange = (mode: DocumentDisplayMode) => {
    // 使用统一的模式切换方法
    useDocumentStore.getState().switchDisplayMode(mode, {
      onNavigateToHome: () => router.push('/home'),
      onNavigateToFullscreen: () => {} // 已在全屏页面，无需处理
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
        ⛶
      </button>
      {modeMenuOpen && (
        <div className="absolute left-0 top-10 w-40 bg-white border rounded-xl shadow-xl p-1 z-50">
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
            onClick={() => handleDisplayModeChange('drawer')}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border rounded-sm" />
              侧边预览
            </span>
          </button>
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50"
            onClick={() => handleDisplayModeChange('modal')}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border rounded-sm" />
              居中预览
            </span>
          </button>
          <button
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50 ring-1 ring-gray-200`}
            onClick={() => handleDisplayModeChange('fullscreen')}
          >
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 border rounded-sm" />
              内容区全屏
            </span>
            ✓
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="h-8 w-8 rounded border flex items-center justify-center text-sm text-gray-500 bg-white hover:bg-gray-50"
            title="返回"
          >
            ←
          </button>
          <DisplayModeSelector />
          <span className="text-sm text-gray-500">全屏文档</span>
        </div>
        <div className="text-xs text-gray-400">
          按 ESC 或点击返回按钮退出全屏
        </div>
      </div>

      {/* 文档内容 */}
      <div className="flex-1 overflow-hidden">
        {/* 在全屏页中，关闭时需要返回主页 */}
        <DocumentForm onRequestClose={() => {
          // 先关闭全局文档状态
          useDocumentStore.getState().close();
          // 再返回主页
          router.push('/home');
        }} />
      </div>
    </div>
  );
}
