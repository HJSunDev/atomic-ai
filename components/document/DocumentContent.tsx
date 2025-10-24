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
import { Check, X, MoreHorizontal, Plus } from "lucide-react";
import { LocalCatalyst } from "@/components/ai-assistant/LocalCatalyst";
import { SidebarDisplayIcon, ModalDisplayIcon, FullscreenDisplayIcon } from "@/components/icons";
import { useAutoSaveDocument } from "@/hooks/useAutoSaveDocument";
import { useCallback, useState } from "react";

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

  // 后置指令输入框展开状态
  const [isSuffixManuallyExpanded, setIsSuffixManuallyExpanded] = useState(false);

  // 派生状态：当有内容或用户手动点击时，显示后置指令输入框
  const shouldShowSuffixInput = promptSuffix.length > 0 || isSuffixManuallyExpanded;

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
    <section className="flex flex-col h-full">
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

      {/* 页脚：固定在底部，用于放置后置指令等不参与滚动的内容 */}
      <footer className={`px-12 py-2 border-t border-gray-100 ${contentPaddingByMode[displayMode]}`}>
        {!shouldShowSuffixInput ? (
          <button
            onClick={() => setIsSuffixManuallyExpanded(true)}
            className="flex items-center gap-1 py-1 px-[4px] text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all duration-150 outline-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>添加后置指令</span>
          </button>
        ) : (
          <div>
            <textarea
              className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 leading-relaxed text-sm"
              rows={3}
              placeholder="添加后置指令（例如：输出格式要求、结束语等）..."
              value={promptSuffix}
              onChange={(e) => setPromptSuffix(e.target.value)}
            />
          </div>
        )}
      </footer>
    </section>
  );
};
