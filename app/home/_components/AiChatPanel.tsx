import React from "react";
import { motion } from "framer-motion";

// 导入抽象出的组件
import { AiChatCore } from "@/components/ai-chat/AiChatCore";
import { MessageList } from "@/components/ai-chat/MessageList";
import { ChatInput } from "@/components/ai-chat/ChatInput";
import { EmptyState } from "@/components/ai-chat/EmptyState";
import { useAiPanelStore, AiPanelMode } from "@/store/home/use-ai-panel-store";
import { useAiContextStore } from "@/store/home/use-ai-context-store";
import { MessageSquare, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiChatPanel() {

  const panelMode = useAiPanelStore((state) => state.panelMode);
  const setPanelMode = useAiPanelStore((state) => state.setPanelMode);

  const activeContext = useAiContextStore((state) => state.getActiveContext());
  const sceneName = activeContext?.metadata?.name ?? activeContext?.type ?? "无场景";

  // 定义提示卡片数据
  const promptCards = [
    {
      title: "知识节点",
      description: "帮我拓宽知识边界，探索知识节点",
      promptText: "&&&是什么？有什么用？使用场景是什么？如何使用？用不用的区别是什么？最佳实践是什么？",
    }
  ];

  const modes = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "context", label: sceneName !== "无场景" ? sceneName : "场景", icon: Layers },
  ] as const;
  
  // 使用核心组件
  return (
    // AI聊天面板 - 固定占据右侧宽度
    <div className="relative w-[25%] h-full border-l bg-background flex flex-col overflow-hidden">
      <AiChatCore>
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
            {/* 左上角模式切换 - 极简分段控制器 */}
            <aside className="absolute top-2 left-2 z-20 select-none group/mode-switch">
              <div className="flex items-center p-0.5 bg-transparent group-hover/mode-switch:bg-muted/40 transition-colors rounded-lg">
                {modes.map((mode) => {
                  const isActive = panelMode === mode.id;
                  const Icon = mode.icon;
                  
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setPanelMode(mode.id as AiPanelMode)}
                      className={cn(
                        "relative flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md transition-all duration-300 z-10 outline-none cursor-pointer",
                        isActive ? "text-foreground" : "text-muted-foreground/60 hover:text-muted-foreground"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-mode-bg"
                          className="absolute inset-0 bg-background/80 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] rounded-md border border-border/40 backdrop-blur-[2px]"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon className={cn("w-3 h-3", isActive ? "text-foreground" : "text-muted-foreground/70")} />
                        <span className="truncate max-w-[70px]">{mode.label}</span>
                      </span>
                    </button>
                  );
                })}
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