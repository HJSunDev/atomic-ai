"use client";

import { FileText } from "lucide-react";

/**
 * 极简空状态组件 - Notion风格
 * 保持h-[5rem]高度限制，使用lucide-react图标
 */
export function EmptyGridState() {
  return (
    <div className="col-span-full h-[3rem] flex items-center justify-center">
      <div className="flex items-center gap-1 text-gray-400">
        <FileText className="w-5 h-5" />
        <span className="text-sm font-normal">暂无模块</span>
      </div>
    </div>
  );
}
