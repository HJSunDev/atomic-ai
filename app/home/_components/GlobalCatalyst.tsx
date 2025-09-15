"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalCatalystProps {
  className?: string;
}

export function GlobalCatalyst({ className }: GlobalCatalystProps) {
  // 控制催化剂的展开/收起状态
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={cn(
        "fixed top-[4rem] right-[6rem] z-50 transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* 催化剂触发器 - 圆形按钮 */}
      <button
        onClick={toggleExpanded}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-300",
          "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600",
          "hover:from-violet-600 hover:via-purple-600 hover:to-indigo-700",
          "shadow-lg hover:shadow-xl",
          "border-2 border-white/20 backdrop-blur-sm",
          isExpanded 
            ? "w-12 h-12 scale-95" 
            : "w-14 h-14 hover:scale-105"
        )}
        aria-label={isExpanded ? "收起全局催化剂" : "展开全局催化剂"}
      >
        {/* 根据状态显示不同图标 */}
        {isExpanded ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <>
            {/* 主图标 */}
            <Sparkles className="w-6 h-6 text-white" />
            
            {/* 呼吸效果光环 */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full border-2 border-white/30",
                "animate-ping opacity-20"
              )}
            />
            
            {/* 静态外圈 */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full border border-white/40"
              )}
            />
          </>
        )}
      </button>

      {/* 展开后的内容面板 */}
      {isExpanded && (
        <div 
          className={cn(
            "absolute top-16 right-0 w-80 max-h-96",
            "bg-white dark:bg-gray-900 rounded-xl shadow-2xl",
            "border border-gray-200 dark:border-gray-700",
            "backdrop-blur-md bg-opacity-95 dark:bg-opacity-95",
            "animate-in slide-in-from-top-2 fade-in-0 duration-200"
          )}
        >
          {/* 面板头部 */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  全局催化剂
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  智能助手为您服务
                </p>
              </div>
            </div>
          </div>

          {/* 面板内容 - 占位内容 */}
          <div className="p-4 space-y-4">
            {/* 快速操作区域 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                快速操作
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    智能分析
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    分析当前内容
                  </div>
                </button>
                <button className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    创意建议
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    获取创意灵感
                  </div>
                </button>
              </div>
            </div>

            {/* 交互提示区域 */}
            <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 rounded-lg border border-violet-200 dark:border-violet-800">
              <p className="text-xs text-violet-700 dark:text-violet-300">
                💡 <span className="font-medium">提示：</span>
                催化剂已准备就绪，可以与当前模块进行智能交互
              </p>
            </div>

            {/* 状态信息 */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>状态：活跃</span>
              <span>模式：通用助手</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
