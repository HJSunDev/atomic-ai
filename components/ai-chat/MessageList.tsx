import React from "react";
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Bot } from "lucide-react";
import { Message } from "./AiChatCore";

interface MessageListProps {
  messages: Message[];
  messagesEndRef: any; // 使用any类型避免类型问题
  emptyState?: React.ReactNode;
}

export function MessageList({ messages, messagesEndRef, emptyState }: MessageListProps) {
  if ( messages.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {messages.map((message, index) => (
        <div 
          key={message.id}
          className="group mb-6 last:mb-2"
        >
          {message.role === "user" ? (
            // 用户消息容器
            <div className="flex flex-col items-end">
              {/* 用户消息内容 */}
              <div className="w-3/4 bg-[#F1F2F3] rounded-tl-lg rounded-tr-lg rounded-bl-lg p-4 ml-auto">
                <div className="text-sm whitespace-pre-line">{message.content}</div>
              </div>
              
              {/* 用户消息功能区 - 根据是否为最后一条消息决定是否默认显示 */}
              <div className={`mt-2 flex items-center gap-1 ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center bg-white">
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center bg-white">
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          ) : (
            // AI消息容器
            <div className="flex flex-col">
              {/* AI消息内容 */}
              <div className="w-full">
                {/* AI信息栏 */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">OmniAid</span>
                  <span className="text-xs text-gray-500">{message.model}</span>
                </div>
                
                {/* AI消息内容 */}
                <div className="text-sm whitespace-pre-line">{message.content}</div>
              </div>
              
              {/* AI消息功能区 - 根据是否为最后一条消息决定是否默认显示 */}
              <div className={`mt-2 flex items-center gap-1.5 ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                  <ThumbsUp className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                  <ThumbsDown className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                  <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {/* 用于滚动到底部的空div */}
      <div ref={messagesEndRef} />
    </>
  );
} 