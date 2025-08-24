"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePanelStore } from "@/store/ui/panelStore";

// 通用编辑面板：支持 create/edit/preview 模式
export const EditorPanel = () => {
  const { isOpen, type, mode, initialData, onSave, onCancel, close, displayMode, setDisplayMode } = usePanelStore();

  const visible = isOpen && Boolean(type) && Boolean(mode);

  const isReadonly = useMemo(() => mode === "preview", [mode]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
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

  useEffect(() => {
    if (!visible) return;
    if (initialData && typeof initialData === "object") {
      const data = initialData as { title?: string; description?: string; content?: string };
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setContent(data.content ?? "");
    } else {
      setTitle("");
      setDescription("");
      setContent("");
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (isReadonly) return;
    const payload = { title, description, content };
    if (onSave) onSave(payload as unknown as never);
    close();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    close();
  };

  // 锁定背景滚动并阻断滚动链（modal/fullscreen）
  useEffect(() => {
    if (!visible) return;
    if (displayMode === 'modal' || displayMode === 'fullscreen' || displayMode === 'drawer') {
      const mainEl = document.querySelector('main[class*="overflow-y-auto"]') as HTMLElement | null;
      if (!mainEl) return;
      const prevOverflow = mainEl.style.overflow;
      const prevOverscroll = (mainEl.style as any).overscrollBehavior;
      mainEl.style.overflow = 'hidden';
      (mainEl.style as any).overscrollBehavior = 'contain';
      return () => {
        mainEl.style.overflow = prevOverflow;
        (mainEl.style as any).overscrollBehavior = prevOverscroll;
      };
    }
  }, [visible, displayMode]);

  if (!visible) return null;

  // 根据 displayMode 计算容器类名
  const containerClass = (() => {
    if (displayMode === 'fullscreen') {
      return 'absolute inset-0 h-full w-full bg-white flex flex-col overscroll-contain';
    }
    if (displayMode === 'modal') {
      return 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,800px)] max-h-[90vh] bg-white shadow-xl border rounded-xl flex flex-col overscroll-contain';
    }
    // drawer 默认
    return 'absolute right-0 top-0 h-full w-full sm:w-[720px] max-w-[90vw] bg-white shadow-xl border-l flex flex-col overscroll-contain';
  })();

  // 全屏模式下内容核心区居中显示
  const contentWrapperClass = displayMode === 'fullscreen' ? 'max-w-[50rem] mx-auto' : '';

  return (
    <div className="absolute inset-0 z-50 overscroll-contain">
      <div
        className="absolute inset-0 bg-black/30 overscroll-contain"
        onClick={handleCancel}
        onWheel={(e) => { e.preventDefault(); }}
        onTouchMove={(e) => { e.preventDefault(); }}
      />

      <div className={containerClass}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {/* 左侧：显示模式选择器（类似 Notion） */}
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
                    onClick={() => { setDisplayMode('drawer'); setModeMenuOpen(false); }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 border rounded-sm" />
                      侧边预览
                    </span>
                    {displayMode === 'drawer' ? '✓' : ''}
                  </button>
                  <button
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50 ${displayMode === 'modal' ? 'ring-1 ring-gray-200' : ''}`}
                    onClick={() => { setDisplayMode('modal'); setModeMenuOpen(false); }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 border rounded-sm" />
                      居中预览
                    </span>
                    {displayMode === 'modal' ? '✓' : ''}
                  </button>
                  <button
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded hover:bg-gray-50 ${displayMode === 'fullscreen' ? 'ring-1 ring-gray-200' : ''}`}
                    onClick={() => { setDisplayMode('fullscreen'); setModeMenuOpen(false); }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 border rounded-sm" />
                      内容区全屏
                    </span>
                    {displayMode === 'fullscreen' ? '✓' : ''}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm rounded border" onClick={handleCancel}>关闭</button>
            {!isReadonly && (
              <button className="px-3 py-1.5 text-sm rounded bg-black text-white" onClick={handleSave}>保存</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className={contentWrapperClass}>
            <div className="mb-6">
              <input
                className="w-full text-3xl font-bold outline-none placeholder:text-gray-300 disabled:opacity-60"
                placeholder="无标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isReadonly}
              />
            </div>

            <div className="mb-6">
              <textarea
                className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 disabled:opacity-60"
                rows={2}
                placeholder="添加描述..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isReadonly}
              />
            </div>

            <div>
              <textarea
                className="w-full min-h-[300px] outline-none placeholder:text-gray-300 disabled:opacity-60"
                placeholder="输入内容...（后续可替换为富文本/模块化编辑器）"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isReadonly}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


