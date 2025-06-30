import { action } from "../_generated/server";
import { v } from "convex/values";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "../_lib/models";
import { api } from "../_generated/api";

import {
  getApiKey,
  getLangChainMessageHistory,
  createChatModel,
  handleStreamAndPersist,
  updateMessageMetadata,
} from "../_lib/chatUtils";


/**
 * 流式AI聊天action
 * 使用langchain + openrouter实现流式对话
 */
export const streamAssistantResponse = action({
  args: {
    assistantMessageId: v.id("messages"),
    conversationId: v.id("conversations"),
    modelId: v.optional(v.string()),
    userApiKey: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {

    // 记录处理开始时间，用于计算整个聊天处理的耗时
    const startTime = Date.now();

    try {
      // 0. 身份验证
      const userId = (await ctx.auth.getUserIdentity())?.subject;
      if (!userId) throw new Error("未授权访问");

      // 1. 验证和获取模型配置
      const modelId = args.modelId || DEFAULT_MODEL_ID;
      const modelConfig = AVAILABLE_MODELS[modelId];
      if (!modelConfig) {
        throw new Error(`不支持的模型ID: ${modelId}`);
      }

      // 2. 获取API密钥
      const apiKey = getApiKey(modelConfig, args.userApiKey);
      if (!apiKey) {
        throw new Error("缺少API密钥，请提供有效的API密钥");
      }

      // 3. 获取并构建格式化的对话历史
      const langchainMessages = await getLangChainMessageHistory(
        ctx,
        args.conversationId,
        args.systemPrompt
      );

      // 4. 创建流式聊天模型
      const chatModel = createChatModel({
        apiKey,
        modelConfig,
        streaming: true,
      });

      // 5. 处理流式生成与持久化
      const { fullResponse, tokenCount } = await handleStreamAndPersist(
        ctx,
        chatModel,
        langchainMessages,
        args.assistantMessageId
      );

      // 6. 更新最终的元数据
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      await updateMessageMetadata(ctx, args.assistantMessageId, {
        aiModel: modelConfig.modelName,
        tokensUsed: tokenCount,
        durationMs,
      });

      return {
        success: true,
        response: fullResponse,
        metadata: {
          modelUsed: modelConfig.modelName,
          tokensUsed: tokenCount,
          durationMs,
        },
      };
    } catch (error) {
      console.error("流式聊天继续失败:", error);
      
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      
      // 当发生错误时，更新助手消息的内容以向用户显示错误
      await ctx.runMutation(api.chat.mutations.updateMessageContent, {
          messageId: args.assistantMessageId,
          content: `抱歉，处理时遇到错误: ${errorMessage}`,
          skipAuth: true // 使用内部权限跳过用户检查
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});


