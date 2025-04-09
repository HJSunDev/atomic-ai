import React from "react";
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
  return (
    <div className="bg-white">
      {/* 提示词功能区 */}
      <div className="px-4 py-1 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button className="h-7 px-2 rounded-full hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-600">写作</span>
          </button>
          <button className="h-7 px-2 rounded-full hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-600">写日程</span>
          </button>
          <button className="h-7 px-2 rounded-full hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-600">数据分析</span>
          </button>
        </div>
      </div>
      
      {/* 设置区 */}
      <div className="px-4 py-1 flex items-center border-gray-100">
        <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center">
          <Brain className="w-4 h-4 text-[#212125]" />
        </button>
        <div className="flex items-center justify-center ml-auto">
          {/* 历史消息图标 */}
          <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center">
            <Clock className="h-4 w-4 text-[#212125]" />
          </button>
        </div>
      </div>
      
      {/* 输入整体模块 */}
      <div className="mx-4 mt-1 mb-2">
        {/* textarea区域 - 默认两行高度，最多五行后滚动 */}
        <div className="rounded-t-md border border-gray-200 overflow-hidden">
          <Textarea 
            placeholder="问我任何问题..." 
            className="min-h-[3.7rem] max-h-[6.25rem] w-full resize-none rounded-none border-0 focus-visible:ring-0 focus:outline-none px-3 py-2.5 text-sm overflow-y-auto"
            value={inputValue}
            onChange={handleInputChange}
            ref={textareaRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          {/* textarea右下侧功能区 */}
          <div className="bg-white pb-[2px] px-3 flex items-center justify-end border-gray-100">
            <div className="flex items-center">
              <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Sparkles className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Maximize2 className="w-4 h-4 text-gray-500" />
              </button>
              
              {/* 发送按钮 - 根据输入内容决定样式和交互性 */}
              <button 
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  inputValue.trim() ? "hover:bg-gray-100 cursor-pointer" : "cursor-not-allowed"
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
        <div className="px-3 py-2.5 border border-t-0 border-gray-200 rounded-b-md flex items-center gap-4 bg-gray-50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-500">选项1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-500">选项2</span>
          </div>
        </div>
      </div>
    </div>
  );
} 