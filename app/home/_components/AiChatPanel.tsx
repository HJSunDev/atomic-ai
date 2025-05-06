import React from "react";

// 导入抽象出的组件
import { AiChatCore } from "@/components/ai-chat/AiChatCore";
import { MessageList } from "@/components/ai-chat/MessageList";
import { ChatInput } from "@/components/ai-chat/ChatInput";
import { EmptyState } from "@/components/ai-chat/EmptyState";

export function AiChatPanel() {
  // 定义提示卡片数据
  const promptCards = [
    {
      title: "知识节点",
      description: "帮我拓宽知识边界，探索知识节点",
      promptText: "&&&是什么？有什么用？使用场景是什么？如何使用？用不用的区别是什么？最佳实践是什么？",
    }
  ];
  
  // 使用核心组件
  return (
    // AI聊天面板 - 固定占据右侧宽度
    <div className="w-[45%] h-full border-l bg-background flex flex-col overflow-hidden">
      <AiChatCore 
        systemPrompt="你是一个专业的开发助手，擅长解答技术问题，尤其是关于Web开发、React和TypeScript的问题。"
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
            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto">
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
              isLoading={isLoading}
            />
          </>
        )}
      </AiChatCore>
    </div>
  );
} 