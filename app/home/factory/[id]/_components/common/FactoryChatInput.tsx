"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, Maximize2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelSelector } from "@/components/ai-chat/ModelSelector";
import { useFactoryStore } from "@/store/home/useFactoryStore";

interface FactoryChatInputProps {
  onSendMessage: (prompt: string) => void;
  isGenerating?: boolean;
}

/**
 * FactoryChatInput - Factory 工坊输入区组件
 */
export function FactoryChatInput({
  onSendMessage,
  isGenerating = false,
}: FactoryChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // 从全局 Store 获取待处理的 Prompt
  const { pendingPrompt, setPendingPrompt } = useFactoryStore();

  // 处理自动填充 Prompt
  useEffect(() => {
    if (pendingPrompt) {
      setInputValue(pendingPrompt);
      
      // 延迟聚焦并移动光标到末尾，确保 UI 渲染完成
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 100);
      
      // 清除 Store 中的值，避免重复填充
      setPendingPrompt(null);
    }
  }, [pendingPrompt, setPendingPrompt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isGenerating) return;

    onSendMessage(trimmedValue);
    setInputValue("");

    if (isMaximized) {
      setIsMaximized(false);
    }
  };

  useEffect(() => {
    if (isMaximized) {
      textareaRef.current?.focus();
    }
  }, [isMaximized]);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <>
      {isMaximized && (
        <div
          className="absolute inset-0 z-40 bg-black/35"
          onClick={toggleMaximize}
        />
      )}

      <div
        className={cn(
          "bg-white dark:bg-[#202020] transition-all duration-300 ease-in-out",
          isMaximized
            ? "absolute bottom-0 left-0 right-0 z-50 h-[70%] flex flex-col rounded-t-lg border-t border-gray-200 dark:border-gray-700 shadow-2xl"
            : "relative"
        )}
      >
        {isMaximized && (
          <div className="flex justify-end items-center px-3 py-1">
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

        <div
          className={cn(
            "border rounded-md overflow-hidden",
            isMaximized
              ? "flex-1 flex flex-col mx-4 mb-4"
              : "mx-4 mt-1 mb-2",
            isFocused
              ? "border-[#947DF2]"
              : "border-gray-200 dark:border-gray-700"
          )}
        >
          <div
            className={cn(
              "overflow-hidden",
              isMaximized && "flex-1 flex flex-col"
            )}
          >
            <Textarea
              placeholder={
                isGenerating
                  ? "AI 正在生成代码..."
                  : "描述你想要的功能，AI 将为你生成代码..."
              }
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
                if (e.key === "Enter" && !isGenerating) {
                  if (isMaximized) {
                    if (e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  } else {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }
                }
              }}
              disabled={isGenerating}
            />

            <aside className="bg-white dark:bg-[#202020] pb-[2px] px-3 flex items-center justify-end border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                {!isMaximized && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center cursor-pointer"
                        disabled={isGenerating}
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

                <button
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    inputValue.trim() && !isGenerating
                      ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      : "cursor-not-allowed"
                  }`}
                  disabled={!inputValue.trim() || isGenerating}
                  onClick={handleSendMessage}
                >
                  {isGenerating ? (
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
            </aside>
          </div>

          <footer className="px-3 py-2.5 bg-[#f9fafb] dark:bg-[#1b1b1d] border-t border-gray-100 dark:border-gray-800 rounded-b-md flex items-center gap-1">
            <ModelSelector />
          </footer>
        </div>
      </div>
    </>
  );
}


