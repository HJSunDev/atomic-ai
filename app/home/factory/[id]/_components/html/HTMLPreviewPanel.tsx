import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Eye, Code2, Download, ExternalLink, Smartphone, Monitor, Tablet, Columns2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { HTML_EMPTY_TEMPLATE } from "./templates-html";

interface HTMLPreviewPanelProps {
  appId: Id<"apps">;
  code?: string;
}

export const HTMLPreviewPanel = ({ appId, code }: HTMLPreviewPanelProps) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('split');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const activeCode = code || HTML_EMPTY_TEMPLATE;

  // 当代码更新时，刷新 iframe
  useEffect(() => {
    const updateIframe = () => {
      if (iframeRef.current && (viewMode === 'preview' || viewMode === 'split')) {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(activeCode);
          iframeDoc.close();
        }
      }
    };

    // 稍微延迟以确保 DOM 已渲染
    const timer = setTimeout(updateIframe, 0);
    return () => clearTimeout(timer);
  }, [activeCode, viewMode]);

  const handleDownload = () => {
    const blob = new Blob([activeCode], { type: 'text/html;charset=utf-8' });
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
    const blob = new Blob([activeCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // 注意：URL 不会立即撤销，因为新窗口需要使用它
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  const getDeviceHeight = () => {
    switch (previewDevice) {
      case 'mobile': return 'calc(100% - 2rem)';
      case 'tablet': return 'calc(100% - 2rem)';
      case 'desktop': return '100%';
    }
  };

  const renderPreview = () => (
    <div className="h-full flex items-center justify-center bg-gray-100/50 dark:bg-slate-950/50 overflow-auto">
      <div
        className={cn(
          "transition-all duration-300 bg-white shadow-lg border h-full",
          previewDevice === 'desktop' && "w-full h-full border-none",
          previewDevice === 'tablet' && "w-[768px] my-4 rounded-lg border-gray-200 dark:border-gray-800",
          previewDevice === 'mobile' && "w-[375px] my-4 rounded-[2rem] border-4 border-gray-800 dark:border-gray-700 overflow-hidden"
        )}
        style={{
          width: getDeviceWidth(),
          height: getDeviceHeight(),
        }}
      >
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          title="HTML Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>
    </div>
  );

  const renderCode = () => (
    <div className="h-full overflow-auto bg-slate-900 text-slate-100">
      <pre className="p-4 text-sm font-mono leading-relaxed">
        <code>{activeCode}</code>
      </pre>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* 工具栏 */}
      <header className="h-10 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-3 shrink-0">
        {/* 左侧：视图切换 */}
        <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md">
          <button 
            onClick={() => setViewMode('preview')}
            className={cn(
              "px-2 py-1 text-xs rounded-sm flex items-center gap-1.5 transition-all", 
              viewMode === 'preview' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            预览
          </button>
          <button 
            onClick={() => setViewMode('split')}
            className={cn(
              "px-2 py-1 text-xs rounded-sm flex items-center gap-1.5 transition-all", 
              viewMode === 'split' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Columns2 className="w-3.5 h-3.5" />
            分屏
          </button>
          <button 
            onClick={() => setViewMode('code')}
            className={cn(
              "px-2 py-1 text-xs rounded-sm flex items-center gap-1.5 transition-all", 
              viewMode === 'code' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            源码
          </button>
        </div>

        {/* 右侧：设备切换 + 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 设备切换（仅预览模式显示） */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex items-center gap-1 border-l pl-3 ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors",
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
                      "p-1.5 rounded hover:bg-muted transition-colors",
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
                      "p-1.5 rounded hover:bg-muted transition-colors",
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
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
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
                  className="p-1.5 rounded hover:bg-primary/10 transition-colors text-primary hover:text-primary-dark flex items-center gap-1.5"
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
      <main className="flex-1 overflow-hidden relative">
        {viewMode === 'preview' && renderPreview()}
        
        {viewMode === 'code' && renderCode()}
        
        {viewMode === 'split' && (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              {renderPreview()}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              {renderCode()}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>
    </div>
  );
};


