import React from "react";

// 导入抽象出的组件
import { AiChatCore } from "@/components/ai-chat/AiChatCore";
import { MessageList } from "@/components/ai-chat/MessageList";
import { ChatInput } from "@/components/ai-chat/ChatInput";
import { EmptyState } from "@/components/ai-chat/EmptyState";
import { useAiPanelStore, AiPanelMode } from "@/store/home/use-ai-panel-store";
import { useAiContextStore } from "@/store/home/use-ai-context-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, RefreshCw } from "lucide-react";

export function AiChatPanel() {

  const panelMode = useAiPanelStore((state) => state.panelMode);
  const setPanelMode = useAiPanelStore((state) => state.setPanelMode);

  const activeContext = useAiContextStore((state) => state.getActiveContext());
  const sceneName = activeContext?.metadata?.name ?? activeContext?.type ?? "无场景";

  // 处理模式切换
  const handleModeSwitch = (targetMode: AiPanelMode) => {
    setPanelMode(targetMode);
  };
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
    <div className="relative w-[40%] h-full border-l bg-background flex flex-col overflow-hidden">
      <AiChatCore 
        systemPrompt="你是一个专业的开发助手，擅长解答技术问题，尤其是关于Web开发、React和TypeScript的问题。"
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
            {/* 左上角模式指示 */}
            <aside className="absolute top-1 left-2 z-20 select-none text-muted-foreground/70">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={`h-5 w-5 flex items-center justify-center rounded-sm cursor-pointer transition-colors ${panelMode === "chat" ? "text-foreground/80 hover:text-foreground" : "text-muted-foreground/40 hover:text-muted-foreground/70"}`}
                      onClick={() => handleModeSwitch("chat")}
                      aria-label="切换到Chat模式：多轮对话"
                    >
                      <MessageSquare className="h-[14px] w-[14px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={4}>Chat 模式</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 h-5 px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${panelMode === "context" ? "text-foreground/80 border-border/60 bg-muted/50 hover:bg-muted/60" : "text-muted-foreground/40 border-border/30 bg-muted/20 hover:bg-muted/30 hover:text-muted-foreground/60"}`}
                      onClick={() => handleModeSwitch("context")}
                      aria-label="切换到Context模式：场景化交互"
                    >
                      <RefreshCw className="h-[14px] w-[14px]" />
                      {/* 场景名称 */}
                      <span className="text-[11px] leading-none font-medium">
                        {sceneName}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={4}>场景交互</TooltipContent>
                </Tooltip>
              </div>
            </aside>
            {/* 内容区域 */}
            <article className="flex-1 overflow-y-auto">
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
                    className="h-full py-8 px-4"
                  />
                }
              />
            </article>
            
            {/* 输入区域 */}
            <ChatInput
              ref={chatInputRef}
              onSendMessage={handleSendMessage}
              onNewConversation={handleNewConversation}
              isLoading={isSendingMessage || isStreaming || isMessagesLoading}
            />
          </>
        )}
      </AiChatCore>
    </div>
  );
} 