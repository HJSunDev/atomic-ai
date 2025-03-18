import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Clock, Brain, Sparkles, Maximize2 } from "lucide-react";

export function AiChatPanel() {
  // 添加状态来跟踪输入内容
  const [inputValue, setInputValue] = useState("");
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  return (
    // AI聊天面板 - 固定占据右侧50%宽度
    <div className="w-[45%] h-full border-l bg-background flex flex-col overflow-hidden">
      {/* 面板标题 */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">AI助手</h2>
      </div>
      
      {/* 聊天内容区域 - 使用不同颜色块占位 */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
        <div className="space-y-4">
          {/* 模拟聊天消息 - 使用色块占位 */}
          <div className="w-3/4 h-20 bg-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-800">AI消息占位</div>
          </div>
          
          <div className="w-3/4 h-16 bg-green-100 rounded-lg p-4 ml-auto">
            <div className="text-sm text-green-800">用户消息占位</div>
          </div>
          
          <div className="w-3/4 h-24 bg-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-800">AI消息占位</div>
          </div>
        </div>
      </div>
      
      {/* 输入区域 */}
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
    </div>
  );
} 