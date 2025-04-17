import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Maximize2, Brain, Clock } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  textareaRef: any; // 使用any类型避免类型问题
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
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
  promptOptions = [] 
}: ChatInputProps) {
  // 添加聚焦状态管理
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="bg-white dark:bg-[#202020]">
      {/* 提示词功能区 */}
      <div className="px-4 py-1 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button className="h-7 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700">
            <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">写作</span>
          </button>
          <button className="h-7 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700">
            <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">写日程</span>
          </button>
          <button className="h-7 px-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700">
            <div className="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">数据分析</span>
          </button>
        </div>
      </div>
      
      {/* 设置区 */}
      <div className="px-4 py-1 flex items-center border-gray-100 dark:border-gray-800">
        <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
          <Brain className="w-4 h-4 text-[#212125] dark:text-gray-300" />
        </button>
        <div className="flex items-center justify-center ml-auto">
          {/* 历史消息图标 */}
          <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            <Clock className="h-4 w-4 text-[#212125] dark:text-gray-300" />
          </button>
        </div>
      </div>
      
      {/* 输入整体模块 */}
      <div className={`mx-4 mt-1 mb-2 border rounded-md overflow-hidden ${isFocused ? 'border-[#947DF2]' : 'border-gray-200 dark:border-gray-700'}`}>
        {/* textarea区域 - 默认两行高度，最多五行后滚动 */}
        <div className="overflow-hidden">
          <Textarea 
            placeholder="问我任何问题..." 
            className="min-h-[3.7rem] max-h-[6.25rem] w-full resize-none rounded-none border-0 focus-visible:ring-0 focus:outline-none px-3 py-2.5 text-sm overflow-y-auto bg-white dark:bg-[#202020] dark:text-gray-100"
            value={inputValue}
            onChange={handleInputChange}
            ref={textareaRef}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          {/* textarea右下侧功能区 */}
          <div className="bg-white dark:bg-[#202020] pb-[2px] px-3 flex items-center justify-end border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              
              {/* 发送按钮 - 根据输入内容决定样式和交互性 */}
              <button 
                className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  inputValue.trim() ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" : "cursor-not-allowed"
                }`}
                disabled={!inputValue.trim()}
                onClick={handleSendMessage}
              >
                <Send 
                  className="h-4 w-4" 
                  style={{ 
                    color: inputValue.trim() ? "#3D8CDD" : "#BCC1C8" 
                  }} 
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* 选择区 */}
        <div className="px-3 py-2.5 bg-[#f9fafb] dark:bg-[#1b1b1d]  border-gray-100 dark:border-gray-800 rounded-b-md flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">选项1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">选项2</span>
          </div>
        </div>
      </div>
    </div>
  );
} 