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
import { Check, X, MoreHorizontal, Plus, AlignLeft } from "lucide-react";
import { LocalCatalyst } from "@/components/ai-assistant/LocalCatalyst";
import { SidebarDisplayIcon, ModalDisplayIcon, FullscreenDisplayIcon } from "@/components/icons";
import { useAutoSaveDocument } from "@/hooks/useAutoSaveDocument";
import { useCallback, useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// 提取为独立组件，避免因父组件重渲染而导致自身被重新创建
interface DisplayModeSelectorProps {
  displayMode: 'drawer' | 'modal' | 'fullscreen';
  onDisplayModeChange: (mode: 'drawer' | 'modal' | 'fullscreen') => void;
}

const DisplayModeSelector = ({ displayMode, onDisplayModeChange }: DisplayModeSelectorProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        aria-label="选择显示模式"
        title="选择显示模式"
        className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 focus:outline-none focus:bg-gray-100"
      >
        {displayMode === 'drawer' && <SidebarDisplayIcon size={20} color="#737270" />}
        {displayMode === 'modal' && <ModalDisplayIcon size={20} color="#737270" />}
        {displayMode === 'fullscreen' && <FullscreenDisplayIcon size={20} color="#737270" />}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-48 p-1" sideOffset={8}>
      <DropdownMenuItem
        onClick={() => onDisplayModeChange('drawer')}
        className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm hover:bg-gray-50 focus:bg-gray-50"
      >
        <div className="flex items-center justify-center w-5 h-5">
          <SidebarDisplayIcon size={20} color="#737270" />
        </div>
        <span className="flex-1">侧边预览</span>
        {displayMode === 'drawer' && (
          <Check className="h-4 w-4 text-blue-600" />
        )}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onDisplayModeChange('modal')}
        className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm hover:bg-gray-50 focus:bg-gray-50"
      >
        <div className="flex items-center justify-center w-5 h-5">
          <ModalDisplayIcon size={20} color="#737270" />
        </div>
        <span className="flex-1">居中预览</span>
        {displayMode === 'modal' && (
          <Check className="h-4 w-4 text-blue-600" />
        )}
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onDisplayModeChange('fullscreen')}
        className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer rounded-sm hover:bg-gray-50 focus:bg-gray-50"
      >
        <div className="flex items-center justify-center w-5 h-5">
          <FullscreenDisplayIcon size={20} color="#737270" />
        </div>
        <span className="flex-1">内容区全屏</span>
        {displayMode === 'fullscreen' && (
          <Check className="h-4 w-4 text-blue-600" />
        )}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// 文档内容容器：统一的头部+主体布局，便于在不同容器中复用
interface DocumentContentProps {
  onRequestClose?: () => void;
  // 由父容器（如 DocumentViewer）传入的上下文ID，用于在局部渲染唤醒器
  contextId?: string;
  // 文档ID：全屏模式通过 prop 传入，drawer/modal 从 Store 读取
  documentId?: string;
}

export const DocumentContent = ({ onRequestClose, contextId, documentId: propDocumentId }: DocumentContentProps) => {
  const router = useRouter();
  const displayMode = useDocumentStore((s) => s.displayMode);
  const storeDocumentId = useDocumentStore((s) => s.documentId);
  const close = useDocumentStore((s) => s.close);
  const switchDisplayMode = useDocumentStore((s) => s.switchDisplayMode);
  
  // 优先使用 prop documentId（全屏模式），否则从 Store 读取（drawer/modal）
  const finalDocumentId = propDocumentId ?? storeDocumentId;

  // 状态提升：将 useAutoSaveDocument Hook 从 DocumentForm 移至此处
  const {
    title,
    setTitle,
    description,
    setDescription,
    promptPrefix,
    setPromptPrefix,
    content,
    setContent,
    isSaving,
    // `promptSuffix` 和 `setPromptSuffix` 将在后续步骤中使用
    promptSuffix,
    setPromptSuffix,
  } = useAutoSaveDocument(finalDocumentId ?? null);

  // 当用户点击“添加”后，此状态为 true，输入框出现并自动聚焦。
  // 如果输入框失去焦点且内容为空，此状态将重置为 false，输入框消失。
  const [isEditingSuffix, setIsEditingSuffix] = useState(false);

  // 为了进入编辑模式时可以从文本末尾继续输入，保存 textarea 的引用
  const suffixTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 当进入编辑模式时，将光标移动到现有文本的末尾，便于用户继续追加内容
  useEffect(() => {
    if (!isEditingSuffix) return;
    const el = suffixTextareaRef.current;
    if (!el) return;
    // 等待浏览器完成 autoFocus 后再设置选择区，避免被覆盖
    requestAnimationFrame(() => {
      try {
        const len = el.value.length;
        el.setSelectionRange(len, len);
        el.focus();
      } catch {
        // 某些环境下 setSelectionRange 可能抛错（例如元素处于不可编辑态），忽略以不打断输入体验。
      }
    });
  }, [isEditingSuffix]);

  // 处理显示模式切换
  const handleDisplayModeChange = useCallback((mode: 'drawer' | 'modal' | 'fullscreen') => {
    switchDisplayMode(mode, {
      onNavigateToHome: () => {
        router.push('/home');
      },
      onNavigateToFullscreen: (documentId: string) => {
        router.push(`/home/prompt-document/${documentId}`);
      },
      // 从全屏切到其他模式时，传递当前文档ID
      documentIdToOpen: finalDocumentId ?? undefined,
    });
  }, [switchDisplayMode, router, finalDocumentId]);

  // 基于显示模式的内容区内边距映射：
  // 通过集中配置的方式统一管理三种模式下的水平留白，避免在各容器和页面中分散定义。
  // 全屏模式的边距在页面层（`/home/prompt-document`）已有自定义处理，为避免叠加，这里保持为空。
  const contentPaddingByMode: Record<'drawer' | 'modal' | 'fullscreen', string> = {
    drawer: 'px-12',
    modal: 'px-21',
    fullscreen: '',
  };


  return (
    <section className="relative flex flex-col h-full">
      {/* Notion风格的简洁头部，需要相对定位以容纳局部唤醒器 */}
      <header className="relative flex items-center justify-between px-3 py-2 min-h-[48px]">
        <div className="flex items-center gap-2">
          <DisplayModeSelector 
            displayMode={displayMode}
            onDisplayModeChange={handleDisplayModeChange}
          />
        </div>

        {/* 局部 AI 唤醒器：当提供了 contextId 时显示 */}
        {contextId && <LocalCatalyst ownerContextId={contextId} />}

        <div className="flex items-center gap-1">
          {/* 保存中状态指示：绿色小圆点，仅在保存中显示 */}
          {isSaving && (
            <span
              className="relative inline-flex h-3 w-3 items-center justify-center"
              aria-label="保存中"
              title="保存中"
            >
              <span className="inline-flex h-[5px] w-[5px] rounded-full bg-emerald-400" />
            </span>
          )}
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
        <DocumentForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          promptPrefix={promptPrefix}
          setPromptPrefix={setPromptPrefix}
          content={content}
          setContent={setContent}
        />
      </main>

      {/* 页脚：仅在编辑后置指令时显示 */}
      {isEditingSuffix && (
        <footer className={`py-2 border-t ${contentPaddingByMode[displayMode]}`}>
          <div className="max-w-[42rem] mx-auto">
            <div className="relative flex items-start">
              <Textarea
                className="w-full resize-none border-0 shadow-none focus-visible:ring-0 !text-[14px] text-gray-600 placeholder:text-gray-300 !leading-[1.4] min-h-[2.8rem] max-h-[8.9rem] overflow-y-auto bg-gray-50 rounded-md p-2"
                placeholder="添加后置指令..."
                value={promptSuffix}
                onChange={(e) => setPromptSuffix(e.target.value)}
                onFocus={() => setIsEditingSuffix(true)}
                onBlur={() => setIsEditingSuffix(false)}
                autoFocus
                ref={suffixTextareaRef}
              />
            </div>
          </div>
        </footer>
      )}

      {/* 后置指令浮动按钮 - 不在编辑时显示 */}
      {!isEditingSuffix && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsEditingSuffix(true)}
                className={`absolute bottom-4 left-4 h-9 w-9 rounded-full shadow-lg flex items-center justify-center transition-all duration-150 cursor-pointer bg-white text-gray-500 hover:bg-gray-50`}
                aria-label={promptSuffix.length > 0 ? "编辑后置指令" : "添加后置指令"}
              >
                {promptSuffix.length > 0 ? (
                  <AlignLeft className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              <p>后置指令</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </section>
  );
};
