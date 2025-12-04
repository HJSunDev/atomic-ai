import { useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useChatStore } from "@/store/home/useChatStore";
import type { IntentHandler } from "@/services/intent/types";

/**
 * Chat 模块意图处理器 Hook
 * 
 * 职责：
 * 1. 处理路由到 Chat 模块的逻辑
 * 2. 初始化 Chat 状态（模型、API Key等）
 * 3. 创建新会话并发送第一条消息
 */
export const useChatIntentHandler = () => {
  const { navigateToMenu } = useAppNavigation();
  
  const { 
    startNewConversation, 
    selectConversation,
    setSelectedModel, 
    setUserApiKey, 
    setWebSearchEnabled 
  } = useChatStore();

  const startNewChatRound = useMutation(api.chat.mutations.startNewChatRound);
  const streamAssistantResponse = useAction(api.chat.action.streamAssistantResponse);

  const handleChatIntent: IntentHandler = useCallback(async (intent, input) => {
    console.log("[ChatIntentHandler] 路由到 chat 模块，开始创建对话...");
    
    try {
      // 1. 切换到 chat 菜单（通过菜单状态管理，不是 URL 路由）
      navigateToMenu("chat");
      
      // 2. 设置 chat store 状态
      startNewConversation(); // 重置为新建对话状态
      setSelectedModel(input.modelId);
      setUserApiKey(input.userApiKey || null);
      setWebSearchEnabled(input.webSearchEnabled);
      
      // 3. 创建对话并发送第一条消息
      const result = await startNewChatRound({
        userMessage: input.userPrompt,
        conversationId: undefined, // 新对话，不传 conversationId
      });
      
      if (result) {
        const { conversationId, assistantMessageId } = result;
        
        // 4. 更新 chat store，选中新创建的对话
        selectConversation(conversationId);
        
        // 5. 异步开始流式响应（不等待完成，让它在后台运行）
        streamAssistantResponse({
          conversationId,
          assistantMessageId,
          modelId: input.modelId,
          userApiKey: input.userApiKey,
          agentFlags: {
            webSearch: input.webSearchEnabled,
          },
        }).catch((error) => {
          console.error("[ChatIntentHandler] Chat 流式传输失败:", error);
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("[ChatIntentHandler] 处理失败:", error);
      return false;
    }
  }, [
    navigateToMenu, 
    startNewConversation, 
    selectConversation, 
    setSelectedModel, 
    setUserApiKey, 
    setWebSearchEnabled, 
    startNewChatRound, 
    streamAssistantResponse
  ]);

  return { handleChatIntent };
};

