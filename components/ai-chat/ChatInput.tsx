import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Brain,
  Clock,
  Loader2,
  MessageSquarePlus,
} from "lucide-react";
import { ChatHistory } from "./ChatHistory";
import { cn } from "@/lib/utils";
import { AVAILABLE_MODELS } from "@/convex/_lib/models";
import { useChatStore } from "@/store/home/useChatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Globe } from "lucide-react";
import { getModelIcon } from "@/lib/model-icon-utils";
import Image from "next/image";

interface ChatInputProps {
  inputValue: string;
  textareaRef: any; // 使用any类型避免类型问题
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  onNewConversation?: () => void; // 新建对话回调
  isLoading?: boolean; // 添加加载状态属性
  promptOptions?: Array<{
    type: string;
    text: string;
  }>;
}

export function ChatInput({
  inputValue,
  textareaRef,
  handleInputChange,
  handleSendMessage,
  onNewConversation,
  isLoading = false, // 默认为false
  promptOptions = [],
}: ChatInputProps) {
  // 添加聚焦状态管理
  const [isFocused, setIsFocused] = useState(false);
  // 控制tooltip显示状态，用于解决抽屉关闭后tooltip意外显示的问题
  const [isTooltipDisabled, setIsTooltipDisabled] = useState(false);
  // 输入区放大状态管理
  const [isMaximized, setIsMaximized] = useState(false);

  // 处理放大后自动聚焦
  useEffect(() => {
    if (isMaximized) {
      textareaRef.current?.focus();
    }
  }, [isMaximized, textareaRef]);

  // 切换放大状态
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <>
      {/* 遮罩层 */}
      {isMaximized && (
        <div
          className="absolute inset-0 z-40 bg-black/35 "
          onClick={toggleMaximize} // 点击遮罩层关闭
        />
      )}

      {/* 主容器 */}
      <div
        className={cn(
          "bg-white dark:bg-[#202020] transition-all duration-300 ease-in-out",
          isMaximized
            ? "absolute bottom-0 left-0 right-0 z-50 h-[80%] flex flex-col rounded-t-lg border-t border-gray-200 dark:border-gray-700 shadow-2xl"
            : "relative"
        )}
      >
        {/* 提示词功能区 */}
        {!isMaximized && (
          <div className="px-4 py-1 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                className="h-7 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
                disabled={isLoading} // 加载时禁用按钮
              >
                <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  写作
                </span>
              </button>
              <button
                className="h-7 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
                disabled={isLoading} // 加载时禁用按钮
              >
                <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  写日程
                </span>
              </button>
              <button
                className="h-7 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
                disabled={isLoading} // 加载时禁用按钮
              >
                <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  数据分析
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 会话操作区 */}
        {!isMaximized && (
          <div className="px-4 py-1 flex items-center border-gray-100 dark:border-gray-800">
            <button
              className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
              disabled={isLoading} // 加载时禁用按钮
            >
              <Brain className="w-4 h-4 text-[#212125] dark:text-gray-300" />
            </button>
            <div className="flex items-center justify-center ml-auto gap-1">
              {/* 历史消息图标 */}
              <Tooltip open={isTooltipDisabled ? false : undefined}>
                <TooltipTrigger asChild>
                  <ChatHistory
                    onSheetToggle={(open) => {
                      if (open) {
                        // 抽屉打开时立即禁用tooltip
                        setIsTooltipDisabled(true);
                      } else {
                        // 抽屉关闭时，延迟500ms后重新启用tooltip
                        setTimeout(() => {
                          setIsTooltipDisabled(false);
                        }, 500);
                      }
                    }}
                  >
                    <button
                      className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer"
                      disabled={isLoading} // 加载时禁用按钮
                    >
                      <Clock className="h-4 w-4 text-[#212125] dark:text-gray-300" />
                    </button>
                  </ChatHistory>
                </TooltipTrigger>
                <TooltipContent>
                  <p>聊天历史</p>
                </TooltipContent>
              </Tooltip>
              {/* 新建对话图标 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer"
                    disabled={isLoading} // 加载时禁用按钮
                    onClick={() => onNewConversation?.()} // 调用新建对话回调
                  >
                    <MessageSquarePlus className="h-4 w-4 text-[#212125] dark:text-gray-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>开启新对话</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {/* 放大状态下的顶部操作栏 */}
        {isMaximized && (
          <div className="flex justify-end items-center px-3 py-1 ">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center cursor-pointer"
                  onClick={toggleMaximize}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 16 16"
                    className="min-w-[20px] min-h-[20px]"
                  >
                    <g>
                      <path
                        fill="#8A939D"
                        d="M6 1.375h-.544c-.787 0-1.441 0-1.96.07-.545.073-1.034.234-1.425.626-.392.391-.553.88-.626 1.425-.07.519-.07 1.173-.07 1.96V6a.625.625 0 0 0 1.25 0v-.5c0-.843.001-1.412.058-1.837.055-.407.15-.588.272-.708.12-.121.3-.217.708-.272.425-.057.994-.058 1.837-.058H6a.625.625 0 0 0 0-1.25Zm6.625 4.875c-.843 0-1.412-.001-1.837-.059a3.241 3.241 0 0 1-.083-.012l3.174-3.175a.625.625 0 1 0-.883-.883L9.82 5.295a3.287 3.287 0 0 1-.013-.083c-.057-.425-.058-.994-.058-1.837v-.5a.625.625 0 1 0-1.25 0v.544c0 .787 0 1.441.07 1.96.073.545.234 1.034.626 1.425.391.392.88.553 1.425.626.519.07 1.173.07 1.96.07h.544a.625.625 0 0 0 0-1.25h-.5ZM14 9.375c.345 0 .625.28.625.625v.543c0 .788 0 1.442-.07 1.96-.073.546-.234 1.034-.626 1.426-.392.392-.88.553-1.426.626-.518.07-1.172.07-1.96.07H10a.625.625 0 1 1 0-1.25h.5c.842 0 1.412-.002 1.837-.059.407-.055.588-.15.708-.27.121-.122.217-.302.271-.71.058-.425.059-.994.059-1.836V10c0-.345.28-.625.625-.625Zm-7.75 3.75a.625.625 0 1 0 1.25 0v-.544c0-.787 0-1.441-.07-1.96-.073-.545-.234-1.034-.626-1.425-.391-.392-.88-.553-1.426-.626-.518-.07-1.172-.07-1.96-.07h-.543a.625.625 0 1 0 0 1.25h.5c.843 0 1.412.001 1.837.059.029.003.057.008.083.012l-3.174 3.175a.625.625 0 1 0 .883.883l3.175-3.174c.004.026.009.054.012.083.058.425.059.994.059 1.837v.5Z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                      />
                    </g>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>缩小输入区</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* 输入整体模块 */}
        <div
          className={cn(
            "border rounded-md overflow-hidden", // 基础样式
            isMaximized
              ? "flex-1 flex flex-col mx-4 mb-4" // 放大模式下：去掉上边距，保留左右和下边距
              : "mx-4 mt-1 mb-2", // 正常模式下的布局和间距
            isFocused
              ? "border-[#947DF2]" // 聚焦时，边框为紫色
              : "border-gray-200 dark:border-gray-700" // 未聚焦时，边框统一为灰色
          )}
        >
          {/* textarea区域 */}
          <div
            className={cn(
              "overflow-hidden",
              isMaximized && "flex-1 flex flex-col"
            )}
          >
            <Textarea
              placeholder={isLoading ? "AI正在思考中..." : "问我任何问题..."}
              className={cn(
                "w-full resize-none rounded-none border-0 focus-visible:ring-0 focus:outline-none px-3 py-2.5 text-sm bg-white dark:bg-[#202020] dark:text-gray-100",
                isMaximized
                  ? "flex-1 min-h-0 overflow-y-auto"
                  : "min-h-[3.7rem] max-h-[6.25rem] overflow-y-auto"
              )}
              value={inputValue}
              onChange={handleInputChange}
              ref={textareaRef}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  if (isMaximized) {
                    // 放大状态下：Shift + Enter 发送，单独 Enter 换行
                    if (e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                      // 发送后取消放大状态
                      setIsMaximized(false);
                    }
                    // 单独 Enter 不阻止默认行为，让其自然换行
                  } else {
                    // 正常状态下：Enter 发送，Shift + Enter 换行
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }
                }
              }}
              disabled={isLoading} // 加载时禁用输入
            />

            {/* textarea右下侧功能区 */}
            <div className="bg-white dark:bg-[#202020] pb-[2px] px-3 flex items-center justify-end border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <button
                  className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
                  disabled={isLoading} // 加载时禁用按钮
                >
                  <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                {!isMaximized && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center cursor-pointer"
                        disabled={isLoading} // 加载时禁用按钮
                        onClick={toggleMaximize}
                      >
                        <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>放大输入区</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* 发送按钮 - 根据输入内容决定样式和交互性 */}
                <button
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    inputValue.trim() && !isLoading
                      ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                  disabled={!inputValue.trim() || isLoading}
                  onClick={() => {
                    handleSendMessage();
                    // 发送后取消放大状态
                    if (isMaximized) {
                      setIsMaximized(false);
                    }
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#3D8CDD]" />
                  ) : (
                    <Send
                      className="h-4 w-4"
                      style={{
                        color: inputValue.trim() ? "#3D8CDD" : "#BCC1C8",
                      }}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 选择区 */}
          <div className="px-3 py-2.5 bg-[#f9fafb] dark:bg-[#1b1b1d] border-t border-gray-100 dark:border-gray-800 rounded-b-md flex items-center gap-1">
            {/* 模型选择器 */}
            <ModelSelector />
            {/* 网络查询入口 */}
            <NetworkSearchEntry />
          </div>
        </div>
      </div>
    </>
  );
}

// 模型选择器组件：显示当前选择的模型，点击弹出下拉列表
function ModelSelector() {
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
          className="h-7 rounded-full flex items-center justify-center gap-1.5 cursor-pointer transition-colors  border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none"
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
        {/* 面板标题行：图标 + 文本“模型” */}
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

// 网络查询入口组件：提供全网开关（仅前端状态）
function NetworkSearchEntry() {
  // 控制是否开启全网搜索，仅前端本地状态
  const [enabled, setEnabled] = useState(false);

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
      onClick={() => setEnabled((v) => !v)}
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
