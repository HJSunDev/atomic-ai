import React from "react";
import { AiChatCore } from "@/components/ai-chat/AiChatCore";
import { MessageList } from "@/components/ai-chat/MessageList";
import { ChatInput } from "@/components/ai-chat/ChatInput";
import { EmptyState } from "@/components/ai-chat/EmptyState";
import { User, Search, Clock, Bookmark, Settings } from "lucide-react";

// 聊天侧边栏组件
const ChatSidebar = () => {
  return (
    <div className="w-[260px] h-full border-r bg-white dark:bg-gray-800 flex flex-col">
      {/* 顶部搜索区域 */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input 
            type="text" 
            placeholder="搜索聊天记录..." 
            className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* 聊天历史列表 */}
      <div className="flex-1 overflow-y-auto">
        {/* 当前活跃的聊天 */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 cursor-pointer">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">React Hooks 探讨</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">今天</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            useMemo和useCallback的主要区别是什么...
          </p>
        </div>
        
        {/* 其他聊天记录 */}
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">聊天记录 {item}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">昨天</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              这是一段聊天记录的简短预览...
            </p>
          </div>
        ))}
      </div>
      
      {/* 底部按钮区 */}
      <div className="p-3 border-t flex items-center justify-between">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bookmark className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

// 聊天内容组件 - 使用我们之前抽离的组件
const ChatContent = () => {
  // 定义提示卡片数据
  const promptCards = [
    {
      title: "知识节点",
      description: "帮我拓宽知识边界，探索知识节点",
      promptText: "&&&是什么？有什么用？使用场景是什么？如何使用？用不用的区别是什么？最佳实践是什么？",
    }
  ];
  
  return (
    <div className="flex-1 h-full flex flex-col">
      <AiChatCore>
        {({ 
          messages, 
          inputValue, 
          textareaRef, 
          messagesEndRef, 
          handleInputChange, 
          handlePromptClick, 
          handleSendMessage,
          scrollToBottom 
        }) => (
          <>
            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
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
            
            {/* 输入区域 */}
            <ChatInput
              inputValue={inputValue}
              textareaRef={textareaRef}
              handleInputChange={handleInputChange}
              handleSendMessage={handleSendMessage}
            />
          </>
        )}
      </AiChatCore>
    </div>
  );
};

// 聊天模块主组件
export const ChatModule = () => {
  return (
    <div className="h-full flex">
      {/* 聊天侧边栏 */}
      <ChatSidebar />
      
      {/* 聊天内容区域 - 在剩余空间中居中显示 */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl">
          <ChatContent />
        </div>
      </div>
    </div>
  );
};
