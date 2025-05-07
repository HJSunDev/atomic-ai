import React from "react";
import { PanelLeftOpen } from "lucide-react";
import { AiChatCore } from "@/components/ai-chat/AiChatCore";
import { MessageList } from "@/components/ai-chat/MessageList";
import { ChatInput } from "@/components/ai-chat/ChatInput";
import { EmptyState } from "@/components/ai-chat/EmptyState";

// 聊天内容组件
export const ChatContent = ({ showSidebar, onToggleSidebar }: { showSidebar: boolean; onToggleSidebar: () => void }) => {
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
      
      <AiChatCore 
        systemPrompt="你是一个智能的AI助手，能够提供友好、准确和富有帮助的回答。"
      >
        {({ 
          messages, 
          inputValue, 
          textareaRef, 
          messagesEndRef, 
          handleInputChange, 
          handlePromptClick, 
          handleSendMessage,
          isLoading
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
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </AiChatCore>
    </div>
  );
}; 