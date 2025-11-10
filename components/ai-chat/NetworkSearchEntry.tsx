import React from "react";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useChatStore } from "@/store/home/useChatStore";

// 网络查询入口组件：提供全网开关（与全局 Store 打通）
export function NetworkSearchEntry() {
  const enabled = useChatStore((s) => s.webSearchEnabled);
  const setWebSearchEnabled = useChatStore((s) => s.setWebSearchEnabled);

  return (
    <button
      className={cn(
        "h-7 rounded-full flex items-center gap-1 cursor-pointer",
        "px-2 transition-colors border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none",
        enabled
          ? "bg-[#F1EDFF] text-[#5A43D8] dark:bg-[#2A2540] dark:text-[#C6BBFF]"
          : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      title="网络查询"
      onClick={() => setWebSearchEnabled(!enabled)}
      aria-pressed={enabled}
    >
      {/* 左侧图标 */}
      <Globe className={cn("w-3.5 h-3.5", enabled ? "text-[#7C6AF2]" : "text-gray-500 dark:text-gray-400")} />
      {/* 文案 */}
      <span className="text-[12px]">全网</span>
      {/* 右侧小开关（视觉样式，不含表单语义） */}
      <span
        className={cn(
          "ml-1 inline-flex items-center w-8 h-4 rounded-full transition-colors",
          enabled ? "bg-[#7C6AF2]" : "bg-gray-300 dark:bg-gray-600"
        )}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={cn(
            "inline-block w-3 h-3 bg-white rounded-full shadow transform transition-transform",
            enabled ? "translate-x-4" : "translate-x-1"
          )}
        />
      </span>
    </button>
  );
}
