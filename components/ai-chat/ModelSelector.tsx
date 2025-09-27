import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABLE_MODELS } from "@/convex/_lib/models";
import { useChatStore } from "@/store/home/useChatStore";
import { getModelIcon } from "@/lib/model-icon-utils";
import Image from "next/image";

// 模型选择器组件：显示当前选择的模型，点击弹出下拉列表
export function ModelSelector() {
  // 读取与更新全局选择的模型ID
  const { selectedModel, setSelectedModel } = useChatStore();
  // 控制下拉菜单打开状态，用于切换触发器图标方向
  const [open, setOpen] = useState(false);

  // 当前模型配置
  const current = AVAILABLE_MODELS[selectedModel];

  // 排序：推荐优先，其次按名称
  const entries = Object.entries(AVAILABLE_MODELS).sort((a, b) => {
    const ma = a[1];
    const mb = b[1];
    if (ma.isRecommended !== mb.isRecommended) return ma.isRecommended ? -1 : 1;
    return (ma.shortName || ma.modelName).localeCompare(mb.shortName || mb.modelName);
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="h-7 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-colors border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none"
          title="选择模型"
        >
          {/* 当前选中模型的图标 */}
          <div className="w-3.5 h-3.5 rounded-full overflow-hidden">
            <Image
              src={getModelIcon(current?.modelSeries || '')}
              alt={`${current?.shortName || current?.modelName || 'model'} icon`}
              width={14}
              height={14}
              className="w-full h-full object-cover"
              onError={(e) => {
                // 图标加载失败时显示默认背景
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
              }}
            />
            <div className="w-3.5 h-3.5 bg-gray-400 dark:bg-gray-600 rounded-full" style={{ display: 'none' }}></div>
          </div>
          <span className="text-[12px] text-gray-700 dark:text-gray-300">
            {current?.shortName ?? current?.modelName ?? "选择模型"}
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform", open && "rotate-180")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 max-h-80 overflow-y-auto p-1 bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* 面板标题行：图标 + 文本"模型" */}
        <div className="px-2 py-1.5 mb-1 bg-white dark:bg-[#202020] border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span className="text-[11px] text-gray-500 dark:text-gray-400">模型</span>
        </div>
        {entries.map(([id, model]) => (
          <DropdownMenuItem
            key={id}
            className="relative flex items-center mt-2 gap-2 py-2 pl-8 pr-6 text-[12px] cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
            onClick={() => setSelectedModel(id)}
          >
            {/* 左侧模型图标 */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded overflow-hidden">
              <Image
                src={getModelIcon(model.modelSeries)}
                alt={`${model.shortName || model.modelName} icon`}
                width={16}
                height={16}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 图标加载失败时显示默认背景
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block';
                }}
              />
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" style={{ display: 'none' }}></div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="truncate block">{model.shortName || model.modelName}</span>
            </div>
            {/* 左上角绝对定位的小型标签，不参与整体宽度计算 */}
            <div className="absolute left-8 -top-1 flex gap-1 pointer-events-none">
              {model.isRecommended && (
                <span className="text-[9px] leading-none px-1 py-[1px] rounded bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  推荐
                </span>
              )}
              {model.isFree && (
                <span className="text-[9px] leading-none px-1 py-[1px] rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  免费
                </span>
              )}
            </div>
            {selectedModel === id && (
              <Check className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#947DF2]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
