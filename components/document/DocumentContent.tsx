"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useDocumentStore } from "@/store/home/documentStore";
import { useGenerationJob } from "@/store/prompt/generationJobStore";
import { useGenerationJobStore } from "@/store/prompt/generationJobStore";
import { DocumentForm } from "./DocumentForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, X, MoreHorizontal, Plus, AlignLeft, Loader2, Sparkles, AlertCircle, Globe, Share2, Ban, ExternalLink } from "lucide-react";
import { LocalCatalyst } from "@/components/ai-assistant/LocalCatalyst";
import { SidebarDisplayIcon, ModalDisplayIcon, FullscreenDisplayIcon } from "@/components/icons";
import { useAutoSaveDocument } from "@/hooks/useAutoSaveDocument";
import { useCallback, useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { markdownToTiptapJSON } from "@/lib/markdown";

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

// 定义向外暴露的接口句柄
export interface DocumentContentHandle {
  /**
   * 将 Markdown 内容追加到文档末尾
   * @param markdown - 要追加的 Markdown 字符串
   */
  appendContent: (markdown: string) => void;
}

// 文档内容容器：统一的头部+主体布局，便于在不同容器中复用
interface DocumentContentProps {
  onRequestClose?: () => void;
  // 由父容器（如 DocumentViewer）传入的上下文ID，用于在局部渲染唤醒器
  contextId?: string;
  // 文档ID：全屏模式通过 prop 传入，drawer/modal 从 Store 读取
  documentId?: string;
}

export const DocumentContent = forwardRef<DocumentContentHandle, DocumentContentProps>(
  ({ onRequestClose, contextId, documentId: propDocumentId }, ref) => {
  const router = useRouter();
  const displayMode = useDocumentStore((s) => s.displayMode);
  const storeDocumentId = useDocumentStore((s) => s.documentId);
  const close = useDocumentStore((s) => s.close);
  const switchDisplayMode = useDocumentStore((s) => s.switchDisplayMode);
  
  // 优先使用 prop documentId（全屏模式），否则从 Store 读取（drawer/modal）
  const finalDocumentId = propDocumentId ?? storeDocumentId;
  
  const touchDocument = useMutation(api.prompt.mutations.touchDocument);

  // 记录文档访问时间（所有模式统一处理）
  useEffect(() => {
    if (finalDocumentId) {
      touchDocument({ id: finalDocumentId as Id<"documents"> });
    }
  }, [finalDocumentId, touchDocument]);
  
  // 订阅生成任务状态
  const { job, isLocked } = useGenerationJob(finalDocumentId);
  const { cancelJob } = useGenerationJobStore();

  // 文档发布状态管理
  const publishDocument = useMutation(api.prompt.mutations.publishDocument);
  const unpublishDocument = useMutation(api.prompt.mutations.unpublishDocument);
  // 获取完整文档信息（包含发布状态）
  const documentInfo = useQuery(api.prompt.queries.getDocumentWithContent, 
    finalDocumentId ? { documentId: finalDocumentId as Id<"documents"> } : "skip"
  );
  const isPublished = documentInfo?.document.isPublished;
  const [isPublishing, setIsPublishing] = useState(false);

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
    // AI 流式生成状态
    streamingMarkdown,
    isStreaming,
  } = useAutoSaveDocument(finalDocumentId ?? null);

  // 向外暴露能力：追加内容到文档
  useImperativeHandle(ref, () => ({
    appendContent: (newMarkdown: string) => {
      if (!newMarkdown) return;

      try {
        // 1. 解析新内容为 Tiptap JSON
        const newContentJson = markdownToTiptapJSON(newMarkdown);
        if (!newContentJson || !newContentJson.content) return;

        // 2. 解析当前文档内容
        let currentDoc: any = { type: 'doc', content: [] };
        if (content) {
          try {
            currentDoc = JSON.parse(content);
          } catch (e) {
            // 如果解析失败（比如是空字符串），使用默认空文档结构
            currentDoc = { type: 'doc', content: [] };
          }
        }
        
        // 确保 content 数组存在
        if (!Array.isArray(currentDoc.content)) {
          currentDoc.content = [];
        }

        // 3. 追加内容 (在中间加一个空段落以保持间距，提升阅读体验)
        if (currentDoc.content.length > 0) {
          currentDoc.content.push({ type: "paragraph" });
        }
        currentDoc.content.push(...newContentJson.content);

        // 4. 更新状态 (这将触发 useAutoSaveDocument 的防抖保存)
        setContent(JSON.stringify(currentDoc));
        toast.success("已追加到文档结尾", { position: 'top-center' });
      } catch (error) {
        console.error("追加内容失败", error);
        toast.error("追加内容失败", { position: 'top-center' });
      }
    }
  }), [content, setContent]);


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

  // 发布处理
  const handlePublish = async () => {
    if (!finalDocumentId) return;
    setIsPublishing(true);
    try {
      await publishDocument({ id: finalDocumentId as Id<"documents"> });
    } catch (error) {
      toast.error("发布失败，请稍后重试", { position: "top-center" });
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!finalDocumentId) return;
    setIsPublishing(true);
    try {
      await unpublishDocument({ id: finalDocumentId as Id<"documents"> });
    } catch (error) {
      toast.error("取消发布失败", { position: "top-center" });
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

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
          {/* 发布/分享按钮 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-7 w-7 rounded-md flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="分享"
                onClick={!isPublished ? (e) => { e.preventDefault(); handlePublish(); } : undefined}
              >
                {isPublished ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Globe className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>文档已公开</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Share2 className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>分享文档</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </button>
            </DropdownMenuTrigger>
            
            {/* 只有在已发布状态下才显示下拉菜单 */}
            {isPublished && (
              <DropdownMenuContent align="end" className="w-48 p-1">
                <DropdownMenuItem 
                  onClick={() => window.open(`/share/prompt-document/${finalDocumentId}`, '_blank')}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <span>查看分享</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleUnpublish}
                  disabled={isPublishing}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                  <span>取消发布</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>

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
          
          {/* 关闭按钮 */}
          <button
            className="h-7 w-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 focus:outline-none cursor-pointer"
            onClick={onRequestClose ?? close}
            aria-label="关闭"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      
      {/* AI 生成中横幅 */}
      {job && (job.status === "starting" || job.status === "streaming") && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2">
            {job.status === "starting" && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
            {job.status === "streaming" && <Sparkles className="w-4 h-4 animate-pulse text-blue-600" />}
            <span className="text-sm text-blue-900">
              {job.status === "starting" && `正在启动 ${job.modelConfig.shortName}...`}
              {job.status === "streaming" && `${job.modelConfig.shortName} 正在生成中...`}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => finalDocumentId && cancelJob(finalDocumentId)}
            className="h-7 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100"
          >
            取消
          </Button>
        </div>
      )}

      {/* 错误横幅 */}
      {job && job.status === "error" && (
        <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-900 truncate">
              {job.error}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // 清除当前错误状态，允许用户手动编辑或重新生成
                if (finalDocumentId) {
                  useGenerationJobStore.getState().cleanupJob(finalDocumentId, 0);
                }
              }}
              className="h-7 text-xs text-red-700 hover:text-red-900 hover:bg-red-100"
            >
              关闭
            </Button>
          </div>
        </div>
      )}
      
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
          streamingMarkdown={streamingMarkdown}
          isStreaming={isStreaming}
          documentId={finalDocumentId ?? undefined}
          disabled={isLocked}
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
});

// 设置组件显示名称，便于调试
DocumentContent.displayName = "DocumentContent";
