import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Eye, Code2, Download, ExternalLink, Smartphone, Monitor, Tablet, Columns2, Loader2, Cloud } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { HTML_EMPTY_TEMPLATE, generateMicroAppHtml } from "./templates-html";
import { useAutoSaveAppCode } from "@/hooks/useAutoSaveAppCode";

// 子组件
import { HTMLCodeEditor } from "./components/HTMLCodeEditor";
import { HTMLPreviewRenderer, PreviewDevice } from "./components/HTMLPreviewRenderer";

interface HTMLPreviewPanelProps {
  appId: Id<"apps">;
  // 重命名为 override，明确其用途
  activeCodeOverride?: string;
}

export const HTMLPreviewPanel = ({ appId, activeCodeOverride }: HTMLPreviewPanelProps) => {
  
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('split');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  // 使用自动保存 Hook 管理代码状态
  // code: 实时代码（用于编辑器绑定，无延迟）
  // debouncedCode: 稳定代码（用于预览渲染，有1000ms延迟）
  const { code, debouncedCode, setCode, setCodeWithoutSave, isSaving } = useAutoSaveAppCode(appId);

  // 当外部传入的 override (历史版本查看) 发生变化时，强制更新本地状态
  // 注意：这里使用 setCodeWithoutSave，因为我们是在"查看"旧版本，不应立即触发"保存"
  // 只有当用户在旧版本基础上开始编辑时，才会触发 setCode -> useAutoSaveAppCode 的 save 逻辑
  const prevOverride = useRef<string | undefined>(activeCodeOverride);
  
  useEffect(() => {
    if (activeCodeOverride !== undefined && activeCodeOverride !== prevOverride.current) {
      setCodeWithoutSave(activeCodeOverride);
      prevOverride.current = activeCodeOverride;
    }
  }, [activeCodeOverride, setCodeWithoutSave]);

  // 使用本地状态作为当前活跃代码（如果为空则使用空模板）
  const activeCode = code || HTML_EMPTY_TEMPLATE;
  
  // 生成完整的 HTML 用于预览和导出
  // 只有当稳定代码变化时才重新生成，避免频繁重绘 iframe
  const fullHtml = generateMicroAppHtml({ 
    title: "AI Micro App", 
    code: debouncedCode || HTML_EMPTY_TEMPLATE, // 使用 Hook 返回的稳定值
    theme: 'light' // 这里后续可以接入主题切换
  });

  const handleDownload = () => {
    // 下载时重新生成基于当前即时代码(非防抖)的完整HTML
    const currentFullHtml = generateMicroAppHtml({
      title: "AI Micro App",
      code: activeCode,
      theme: 'light'
    });
    
    const blob = new Blob([currentFullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-app-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    const currentFullHtml = generateMicroAppHtml({
      title: "AI Micro App",
      code: activeCode,
      theme: 'light'
    });

    const blob = new Blob([currentFullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* 工具栏 */}
      <header className="h-10 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-3 shrink-0">
        {/* 左侧：视图切换 */}
        <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md">
          <button 
            onClick={() => setViewMode('preview')}
            className={cn(
              "px-2 py-1 text-xs rounded-sm flex items-center gap-1.5 transition-all cursor-pointer", 
              viewMode === 'preview' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            预览
          </button>
          <button 
            onClick={() => setViewMode('split')}
            className={cn(
              "px-2 py-1 text-xs rounded-sm flex items-center gap-1.5 transition-all cursor-pointer", 
              viewMode === 'split' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Columns2 className="w-3.5 h-3.5" />
            分屏
          </button>
          <button 
            onClick={() => setViewMode('code')}
            className={cn(
              "px-2 py-1 text-xs rounded-sm flex items-center gap-1.5 transition-all cursor-pointer", 
              viewMode === 'code' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            源码
          </button>
        </div>

        {/* 右侧：设备切换 + 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 保存状态 - Notion 风格 */}
          <div className="flex items-center mr-2 h-full">
            {isSaving ? (
              <div className="flex items-center gap-1.5 text-muted-foreground animate-in fade-in duration-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs text-muted-foreground/80 font-medium">保存中...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground/30 animate-in fade-in duration-300">
                <Cloud className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">已保存</span>
              </div>
            )}
          </div>

          {/* 设备切换（仅预览模式显示） */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex items-center gap-1 border-l pl-3 ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors cursor-pointer",
                      previewDevice === 'desktop' && "text-primary bg-primary/10"
                    )}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>桌面视图</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors cursor-pointer",
                      previewDevice === 'tablet' && "text-primary bg-primary/10"
                    )}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>平板视图</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors cursor-pointer",
                      previewDevice === 'mobile' && "text-primary bg-primary/10"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>手机视图</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 border-l pl-3 ml-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOpenInNewTab}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>在新标签页打开</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded hover:bg-primary/10 transition-colors text-primary hover:text-primary-dark flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs font-medium">下载 HTML</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>下载为独立 HTML 文件</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <article className="flex-1 overflow-hidden relative">

        {viewMode === 'split' && (
          <ResizablePanelGroup direction="horizontal" className="h-full">

            <ResizablePanel defaultSize={50} minSize={30}>
              <HTMLPreviewRenderer html={fullHtml} device={previewDevice} />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={50} minSize={30}>
              <HTMLCodeEditor 
                code={activeCode} 
                onChange={setCode}
              />
            </ResizablePanel>
            
          </ResizablePanelGroup>
        )}

        {viewMode === 'preview' && (
          <HTMLPreviewRenderer html={fullHtml} device={previewDevice} />
        )}
        
        {viewMode === 'code' && (
          <HTMLCodeEditor 
            code={activeCode} 
            onChange={setCode}
          />
        )}
      </article>
    </div>
  );
};
