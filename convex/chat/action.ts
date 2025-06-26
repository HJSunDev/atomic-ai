import { action } from "../_generated/server";
import { v } from "convex/values";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "../_lib/models";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

import {
  getApiKey,
  generateConversationTitle,
  getLangChainMessageHistory,
  createChatModel,
  handleStreamAndPersist,
  updateMessageMetadata,
} from "../_lib/chatUtils";

// 定义返回类型接口
interface StreamChatResult {
  success: boolean;
  conversationId?: Id<"conversations">;
  userMessageId?: Id<"messages">;
  assistantMessageId?: Id<"messages">;
  response?: string;
  metadata?: {
    modelUsed: string;
    tokensUsed: number;
    durationMs: number;
  };
  error?: string;
}


/**
 * 流式AI聊天action
 * 使用langchain + openrouter实现流式对话
 */
export const streamChat = action({
  args: {
    // 用户消息内容
    userMessage: v.string(),
    // 可选：会话ID，如果不提供则创建新会话
    conversationId: v.optional(v.id("conversations")),
    // 可选：使用的AI模型ID
    modelId: v.optional(v.string()),
    // 可选：用户提供的API密钥（用于付费模型）
    userApiKey: v.optional(v.string()),
    // 可选：系统提示词
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<StreamChatResult> => {
    
    // 记录处理开始时间，用于计算整个聊天处理的耗时
    const startTime = Date.now();
    
    try {
      // 0. 验证用户身份
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

      // 3. 创建或获取会话
      let conversationId = args.conversationId;
      // 如果前端没有提供会话ID，说明是新会话，创建新的会话
      if (!conversationId) {
        // 创建新会话
        const title = generateConversationTitle(args.userMessage);
        // 获取新创建会话的ID
        conversationId = await ctx.runMutation(
          api.chat.mutations.createConversation,
          {
            title,
          }
        );
      }

      // 4. 创建用户消息记录
      // 注意：用户消息永远是对话树的根节点，parentMessageId 总是 undefined
      // 系统消息和用户消息的isChosenReply字段默认都是true，以简化查询
      const userMessageId: Id<"messages"> = await ctx.runMutation(api.chat.mutations.createMessage, {
        conversationId,
        parentMessageId: undefined,
        role: "user",
        content: args.userMessage,
        isChosenReply: true,
      });

      // 5. 获取并构建格式化的对话历史
      const langchainMessages = await getLangChainMessageHistory(
        ctx,
        conversationId,
        args.systemPrompt
      );

      // 6. 创建AI消息记录（初始为空内容）这是单条ai消息回复模式 - 多消息回复未来再扩展
      const assistantMessageId: Id<"messages"> = await ctx.runMutation(api.chat.mutations.createMessage, {
        conversationId,
        parentMessageId: userMessageId,
        role: "assistant",
        content: "",
        isChosenReply: true,
        metadata: {
          aiModel: modelConfig.modelName,
        },
      });

      // 7. 创建流式聊天模型
      const chatModel = createChatModel({
        apiKey,
        modelConfig,
        streaming: true,
      });

      // 8. 处理流式生成与持久化
      const { fullResponse, tokenCount } = await handleStreamAndPersist(
        ctx,
        chatModel,
        langchainMessages,
        assistantMessageId
      );

      // 9. 更新最终的元数据
      const endTime = Date.now();
      // 计算整个聊天处理的耗时
      const durationMs = endTime - startTime;

      await updateMessageMetadata(ctx, assistantMessageId, {
        aiModel: modelConfig.modelName,
        tokensUsed: tokenCount,
        durationMs,
      });

      return {
        success: true,
        conversationId,
        userMessageId,
        assistantMessageId,
        response: fullResponse,
        metadata: {
          modelUsed: modelConfig.modelName,
          tokensUsed: tokenCount,
          durationMs,
        },
      };

    } catch (error) {
      console.error("流式聊天失败:", error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        conversationId: args.conversationId,
      };
    }
  },
});


