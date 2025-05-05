import React, { useState } from "react";
import { AiChatCore } from "@/components/ai-chat/AiChatCore";
import { MessageList } from "@/components/ai-chat/MessageList";
import { ChatInput } from "@/components/ai-chat/ChatInput";
import { EmptyState } from "@/components/ai-chat/EmptyState";
import { User, Search, ChevronLeft, ChevronDown, PanelLeftClose, PanelLeftOpen, MessageSquare, Star, Clock, MoreVertical, Bookmark } from "lucide-react";

// 聊天侧边栏组件
const ChatSidebar = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <div className="w-[13.5rem] h-full border-r bg-white dark:bg-[#202020] flex flex-col">
      {/* 顶部搜索和折叠区域 */}
      <div className="p-3 flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="搜索智能体或聊天" 
            className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-[#27272A] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#947CF1] focus:border-[#947CF1]"
          />
        </div>
        <button 
          onClick={onToggle}
          className="ml-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#27272A] cursor-pointer"
          title="收起聊天侧边栏"
        >
          <PanelLeftClose className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      
      {/* AI模型列表 */}
      <div className="overflow-y-auto">
        {/* Monica */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-500"></div>
          </div>
          <span className="text-sm font-medium">Monica</span>
        </div>
        
        {/* Claude 3.7 Sonnet */}
        <div className="flex items-center p-3 bg-gray-50 dark:bg-[#27272A] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">Claude 3.7 Sonnet</span>
          <Star className="w-4 h-4 ml-auto text-blue-500 fill-blue-500 dark:text-gray-300 dark:fill-gray-300" />
        </div>
        
        {/* DeepSeek R1 */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">DeepSeek R1</span>
          <Star className="w-4 h-4 ml-auto text-blue-500 fill-blue-500 dark:text-gray-300 dark:fill-gray-300" />
        </div>
        
        {/* DeepSeek V3 */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">DeepSeek V3</span>
          <Star className="w-4 h-4 ml-auto text-blue-500 fill-blue-500 dark:text-gray-300 dark:fill-gray-300" />
        </div>
        
        {/* GPT-4o */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center mr-2"></div>
          <span className="text-sm font-medium">GPT-4o</span>
        </div>
        
        {/* 更多 */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm text-gray-500 pl-1">更多</span>
          <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
        </div>
      </div>
      
      {/* 收藏区域 */}
      <div className="mt-5">
        <div className="px-3 py-2 text-sm font-medium">收藏</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">购房财务报告</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm text-gray-500 pl-1">更多</span>
          <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
        </div>
      </div>
      
      {/* 最近聊天区域 */}
      <div className="mt-5 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-sm font-medium flex items-center justify-between">
          <span>最近</span>
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </div>
        
        {/* 7天内 */}
        <div className="px-3 py-1 text-xs text-gray-500">7天内</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">帮助commit信息</span>
          <MoreVertical className="w-4 h-4 ml-auto text-gray-400 opacity-0 group-hover:opacity-100" />
        </div>
        
        {/* 30天内 */}
        <div className="px-3 py-1 text-xs text-gray-500">30天内</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">专业人事顾问服务</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">dnd-kit 拖拽库使用介绍</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">Zustand 在 Next.js 应用中的...</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">@dnd-kit/core 模块介绍</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">前端开发工作产品构思</span>
        </div>
        
        {/* 更远 */}
        <div className="px-3 py-1 text-xs text-gray-500">更远</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">使用Tailwind CSS实现响应式...</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">心理需求与情绪分析</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">soulpilot应用git</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">和室友沟通</span>
        </div>
      </div>
    </div>
  );
};

// 聊天内容组件 - 使用我们之前抽离的组件
const ChatContent = ({ showSidebar, onToggleSidebar }: { showSidebar: boolean; onToggleSidebar: () => void }) => {
  // 定义提示卡片数据
  const promptCards = [
    {
      title: "知识节点",
      description: "帮我拓宽知识边界，探索知识节点",
      promptText: "&&&是什么？有什么用？使用场景是什么？如何使用？用不用的区别是什么？最佳实践是什么？",
    }
  ];
  
  return (
    <div className="flex-1 h-full flex flex-col bg-white dark:bg-[#202020]">
      {/* 当侧边栏收起时，显示展开按钮 */}
      {!showSidebar && (
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            title="展开聊天侧边栏"
          >
            <PanelLeftOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}
      
      <AiChatCore>
        {({ 
          messages, 
          inputValue, 
          textareaRef, 
          messagesEndRef, 
          handleInputChange, 
          handlePromptClick, 
          handleSendMessage,
        }) => (
          <>
            {/* 内容区域 - 让内容区域占满宽度并允许滚动 */}
            <div className="flex-1 overflow-y-auto w-full scrollbar-hide">
              {/* 内容居中容器 - 限制内容最大宽度并居中 */}
              <div className="w-[50rem] mx-auto">
                <MessageList 
                  messages={messages} 
                  messagesEndRef={messagesEndRef}
                  emptyState={
                    <EmptyState
                      promptCards={promptCards.map(card => ({
                        ...card,
                        onClick: handlePromptClick
                      }))}
                    />
                  }
                />
              </div>
            </div>
            
            {/* 输入区域 - 限制最大宽度并居中 */}
            <div className="w-[50rem] mx-auto">
              <ChatInput
                inputValue={inputValue}
                textareaRef={textareaRef}
                handleInputChange={handleInputChange}
                handleSendMessage={handleSendMessage}
              />
            </div>
          </>
        )}
      </AiChatCore>
    </div>
  );
};

// 聊天模块主组件
export const ChatModule = () => {
  // 添加状态控制侧边栏显示
  const [showSidebar, setShowSidebar] = useState(true);
  
  // 切换侧边栏
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  return (
    <div className="h-full flex bg-white dark:bg-[#202020]">
      {/* 聊天侧边栏 - 根据状态显示或隐藏 */}
      {showSidebar && <ChatSidebar onToggle={toggleSidebar} />}
      
      {/* 聊天内容区域 - 直接占满剩余空间 */}
      <div className="flex-1">
        <ChatContent showSidebar={showSidebar} onToggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
};
