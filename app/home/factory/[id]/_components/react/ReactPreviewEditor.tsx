import { useState } from "react";
import { Eye, Smartphone, Monitor, Tablet, Code2, Columns2 } from "lucide-react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buildSandpackFiles, EMPTY_TEMPLATE, DEFAULT_DEPENDENCIES } from "./templates";

interface ReactPreviewEditorProps {
  code?: string;
}

export const ReactPreviewEditor = ({ code }: ReactPreviewEditorProps) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'split'>('split');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Use shell & slot architecture to build the file system
  const activeCode = code || EMPTY_TEMPLATE;
  const files = buildSandpackFiles(activeCode);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <header className="h-10 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-3 shrink-0">
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

        <div className="flex items-center gap-2">
          {viewMode !== "code" && (
            <div className="flex items-center gap-1 border-l pl-3 ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors cursor-pointer",
                      previewDevice === "desktop" && "text-primary bg-primary/10"
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
                    onClick={() => setPreviewDevice("tablet")}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors cursor-pointer",
                      previewDevice === "tablet" && "text-primary bg-primary/10"
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
                    onClick={() => setPreviewDevice("mobile")}
                    className={cn(
                      "p-1.5 rounded hover:bg-muted transition-colors cursor-pointer",
                      previewDevice === "mobile" && "text-primary bg-primary/10"
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
        </div>
      </header>

      {/* Sandpack Engine */}
      <main className="flex-1 overflow-hidden relative">
        <SandpackProvider
            template="react-ts"
            theme="auto"
            files={files}
            options={{
                externalResources: ["https://cdn.tailwindcss.com"],
                classes: {
                    "sp-layout": "h-full",
                    "sp-wrapper": "h-full",
                },
                visibleFiles: ["/GeneratedApp.tsx"],
                activeFile: "/GeneratedApp.tsx",
            }}
            customSetup={{
                dependencies: DEFAULT_DEPENDENCIES,
                entry: "/index.tsx",
            }}
            style={{ height: '100%' }}
        >
            <SandpackLayout className="h-full !bg-transparent !border-none !rounded-none !block md:!flex">
                <section 
                    className={cn(
                        "h-full flex-1 transition-all duration-300 flex justify-center bg-gray-100/50 dark:bg-slate-950/50 overflow-hidden relative",
                        (viewMode === 'code') && "hidden"
                    )}
                >
                    <div className={cn(
                        "transition-all duration-300 bg-white shadow-lg border h-full w-full",
                        previewDevice === 'desktop' && "w-full h-full border-none",
                        previewDevice === 'tablet' && "w-[768px] my-4 rounded-lg border-gray-200 dark:border-gray-800",
                        previewDevice === 'mobile' && "w-[375px] my-4 rounded-[2rem] border-4 border-gray-800 dark:border-gray-700 overflow-hidden"
                    )}>
                        <SandpackPreview 
                            showNavigator={false} 
                            showOpenInCodeSandbox={false}
                            showRefreshButton={true}
                            className="h-full w-full"
                        />
                    </div>
                </section>
                
                <section 
                     className={cn(
                        "h-full border-l transition-all duration-300",
                        viewMode === 'preview' ? "hidden" : "flex-1 min-w-0",
                        viewMode === 'split' ? "w-1/2" : "w-full"
                    )}
                >
                    <SandpackCodeEditor 
                        showTabs={false}
                        showLineNumbers={true}
                        showInlineErrors={true}
                        wrapContent={true}
                        closableTabs={false}
                        initMode="lazy"
                        className="h-full"
                    />
                </section>
            </SandpackLayout>
        </SandpackProvider>
      </main>
    </div>
  );
};

