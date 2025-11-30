import { Id } from "@/convex/_generated/dataModel";
import { AppTypeSwitcher } from "./common/AppTypeSwitcher";
import type { AppType } from "./common/types";
import { ReactPreviewEditor } from "./react/ReactPreviewEditor";
import { HTMLPreviewPanel } from "./html/HTMLPreviewPanel";

interface FactoryPreviewContainerProps {
  appId: Id<"apps">;
  // 其用途是"覆盖"而非"主要数据源"
  activeCodeOverride?: string;
  appType?: AppType;
  onAppTypeChange?: (type: AppType) => void;
}

/**
 * FactoryPreviewContainer - Factory 工坊预览容器组件
 * 
 * 设计职责：
 * - 作为容器组件，组合和协调多个预览编辑器子组件
 * - 根据应用类型条件渲染不同的预览编辑器（HTMLPreviewPanel 或 ReactPreviewEditor）
 * - 提供统一的布局结构（顶部切换器 + 编辑器主体区域）
 * - 作为一个纯受控组件 (Controlled Component)，完全依赖父组件传递的 appType
 * 
 * 数据流设计：
 * - 状态控制：不维护内部 appType 状态，直接使用 props 传入的 appType
 * - 代码预览：采用"覆盖优先"策略
 *   - 当 activeCodeOverride 有值时，优先显示覆盖代码（用于历史版本预览）
 *   - 当 activeCodeOverride 为 undefined 时，子组件自动从数据库读取最新代码（用于实时同步）
 */
export const FactoryPreviewContainer = ({ 
  appId, 
  activeCodeOverride, 
  appType = "react", // 默认值，确保即使父组件未传也有默认行为
  onAppTypeChange 
}: FactoryPreviewContainerProps) => {
  
  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* 顶部模式切换 */}
      <header className="h-12 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-4 shrink-0">
        <AppTypeSwitcher 
          value={appType} 
          onChange={(type) => onAppTypeChange?.(type)} 
        />
      </header>

      {/* 编辑器主体 */}
      <div className="flex-1 overflow-hidden relative">
        {appType === "html" ? (
          // 将 override 传给 HTMLPreviewPanel
          <HTMLPreviewPanel appId={appId} activeCodeOverride={activeCodeOverride} />
        ) : (
          <ReactPreviewEditor code={''} />
        )}
      </div>
    </div>
  );
};
