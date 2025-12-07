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
      description: "拓宽知识边界，探索知识节点",
      promptText: "&&&是什么？有什么用？使用场景是什么？如何使用？用不用它的区别是什么？最佳实践是什么？",
    },
    {
      title: "社交洞察",
      description: "运用第一性原理，透视社交本质",
      promptText: "我遇到了一个社交难题：&&&。\n\n请运用“第一性原理”进行深度剖析：\n1. 【剥离表象】：抛弃社会惯例和既定假设，找到问题的最基本事实。\n2. 【本质追问】：回溯到人际关系的根本动力（如价值交换、部落归属、安全感等）。\n3. 【重构方案】：基于这些本质真理，推导出最符合逻辑的破局策略。",
    },
  ];
  
  return (
    <div className="relative flex-1 h-full flex flex-col dark:bg-[#202020]">
      {/* 当侧边栏收起时，显示展开按钮 */}
      {!showSidebar && (
        <section className="absolute top-4 left-4 z-10">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            title="展开聊天侧边栏"
          >
            <PanelLeftOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </section>
      )}
      
      <AiChatCore 
        systemPrompt="你是一个智能的AI助手，能够提供友好、准确和富有帮助的回答。"
      >
        {({ 
          messages, 
          messagesEndRef, 
          chatInputRef,
          handlePromptClick, 
          handleSendMessage,
          handleNewConversation,
          isSendingMessage,
          isMessagesLoading,
          isStreaming,
          streamingMessageId
        }) => (
          <>
            {/* 内容区域 - 让内容区域占满宽度并允许滚动 */}
            <div className="flex-1 overflow-y-auto w-full">
              {/* 内容居中容器 - 限制内容最大宽度并居中，同时占满父容器高度 */}
              <div className="w-[50rem] mx-auto h-full">
                <MessageList 
                  messages={messages} 
                  messagesEndRef={messagesEndRef}
                  streamingMessageId={streamingMessageId}
                  isMessagesLoading={isMessagesLoading}
                  emptyState={
                    <EmptyState
                      promptCards={promptCards.map(card => ({
                        ...card,
                        onClick: handlePromptClick
                      }))}
                      className="h-full py-16"
                    />
                  }
                />
              </div>
            </div>
            
            {/* 输入区域 - 限制最大宽度并居中 */}
            <div className="w-[50rem] mx-auto">
              <ChatInput
                ref={chatInputRef}
                onSendMessage={handleSendMessage}
                onNewConversation={handleNewConversation}
                isLoading={isSendingMessage || isStreaming || isMessagesLoading}
              />
            </div>
          </>
        )}
      </AiChatCore>
    </div>
  );
}; 