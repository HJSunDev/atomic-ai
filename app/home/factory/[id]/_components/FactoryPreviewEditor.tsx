import { useState, useEffect, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { AppTypeSwitcher } from "./AppTypeSwitcher";
import type { AppType } from "../types";
import { ReactPreviewEditor } from "./react/ReactPreviewEditor";
import { HTMLPreviewPanel } from "./html/HTMLPreviewPanel";

interface FactoryPreviewEditorProps {
  appId: Id<"apps">;
  code?: string;
  appType?: AppType;
  onAppTypeChange?: (type: AppType) => void;
}

export const FactoryPreviewEditor = ({ appId, code, appType: externalAppType, onAppTypeChange }: FactoryPreviewEditorProps) => {
  const [appType, setAppType] = useState<AppType>(externalAppType || "react");
  const prevExternalAppType = useRef(externalAppType);

  // 同步外部传入的 appType 变化
  useEffect(() => {
    if (externalAppType !== undefined && externalAppType !== prevExternalAppType.current) {
      setAppType(externalAppType);
      prevExternalAppType.current = externalAppType;
    }
  }, [externalAppType]);

  // 处理 appType 切换
  const handleAppTypeChange = (type: AppType) => {
    setAppType(type);
    onAppTypeChange?.(type);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* 顶部模式切换 */}
      <div className="h-12 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0">
        <AppTypeSwitcher value={appType} onChange={handleAppTypeChange} />
      </div>

      {/* 编辑器主体 */}
      <div className="flex-1 overflow-hidden relative">
        {appType === "html" ? (
          <HTMLPreviewPanel appId={appId} code={code} />
        ) : (
          <ReactPreviewEditor code={code} />
        )}
      </div>
    </div>
  );
};
