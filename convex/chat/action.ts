import { action } from "../_generated/server";
import { v } from "convex/values";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "../_lib/models";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

import {
  getApiKey,
  getLangChainMessageHistory,
  createChatModel,
  handleStreamAndPersist,
  updateMessageMetadata,
  handlePromptStreamAndPersist,
} from "../_lib/chatUtils";

// 任务相关
import { buildFinalPrompt, TaskIdentifier, taskIdentifierValidator } from "../_lib/taskUtils";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";


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
    // 可选的 Agent 开关（v1 仅支持 webSearch，占位用于后续扩展）
    agentFlags: v.optional(
      v.object({
        // 是否允许本轮启用联网搜索
        webSearch: v.optional(v.boolean()),
      })
    ),
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
      // 输出结构化上下文日志，便于快速定位模型/配置与耗时问题
      try {
        const durationMs = Date.now() - startTime;
        const modelId = args.modelId || DEFAULT_MODEL_ID;
        const modelConfig = AVAILABLE_MODELS[modelId];
        console.error("[ChatStreamError]", {
          conversationId: args.conversationId,
          assistantMessageId: args.assistantMessageId,
          modelId,
          modelName: modelConfig?.modelName,
          provider: modelConfig?.provider,
          baseURL: modelConfig?.baseURL,
          durationMs,
          error,
        });
      } catch {}
      
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


/**
 * 执行一次性的、无状态的AI任务
 * 这是一个通用的action，用于处理所有不需要对话上下文的AI请求。
 * 它不依赖数据库中的任何聊天记录。
 */
export const executeTask = action({
  // 定义action的参数，使用统一的验证器
  args: {
    taskIdentifier: taskIdentifierValidator, // 任务的唯一标识
    inputText: v.string(), // 用户输入的原始文本
    modelId: v.optional(v.string()), // 可选的模型ID
    userApiKey: v.optional(v.string()), // 可选的用户自己的API密钥
  },
  handler: async (ctx, args) => {
    // 记录开始时间以计算总耗时
    const startTime = Date.now();

    try {
      // 1. 身份验证
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("未授权的访问，用户未登录。");
      }

      // 2. 获取模型配置和API密钥
      const modelId = args.modelId || DEFAULT_MODEL_ID;
      const modelConfig = AVAILABLE_MODELS[modelId];
      if (!modelConfig) {
        throw new Error(`不支持的模型ID: ${modelId}`);
      }

      const apiKey = getApiKey(modelConfig, args.userApiKey);
      if (!apiKey) {
        throw new Error("缺少有效的API密钥。");
      }

      // 3. 使用模板构建最终的提示
      const finalPrompt = buildFinalPrompt(
        args.taskIdentifier as TaskIdentifier,
        args.inputText
      );
      const messages = [new HumanMessage(finalPrompt)];

      // 4. 创建一个非流式的聊天模型实例
      const chatModel = createChatModel({
        apiKey,
        modelConfig,
        streaming: false, // 关键：设置为非流式
      });

      // 5. 调用模型并获取结果
      const response = await chatModel.invoke(messages);
      const fullResponse =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);

      // 从 invoke 的响应中获取 token 使用情况
      const tokenUsage = response.usage_metadata?.total_tokens ?? 0;
      
      // 6. 准备成功的返回结果
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      return {
        success: true,
        data: fullResponse,
        metadata: {
          modelUsed: modelConfig.modelName,
          tokensUsed: tokenUsage,
          durationMs,
        },
      };
    } catch (error) {
      console.error("执行AI任务失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : "发生未知错误。";
      
      // 返回一个包含错误信息的失败结果
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

/**
 * 流式生成提示词内容的通用 action
 * 无状态的流式AI生成，直接更新指定文档的内容块
 * 不依赖会话历史，不存储用户消息
 */
export const streamGeneratePromptContent = action({
  args: {
    documentId: v.id("documents"),
    userPrompt: v.string(),
    systemPrompt: v.optional(v.string()),
    modelId: v.optional(v.string()),
    userApiKey: v.optional(v.string()),
    agentFlags: v.optional(
      v.object({
        webSearch: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();
    let contentBlockId: Id<"blocks"> | undefined;
    let originalContent: string | undefined;

    try {
      // 1. 身份验证
      const userId = (await ctx.auth.getUserIdentity())?.subject;
      if (!userId) throw new Error("未授权访问");

      // 2. 授权: 检查用户是否拥有该文档
      const document = await ctx.runQuery(internal.prompt.queries.getDocumentById, {
        id: args.documentId,
      });
      if (!document) throw new Error("文档不存在");
      if (document.userId !== userId) throw new Error("无权修改此文档");
      if (document.isArchived) throw new Error("文档已归档");

      // 3. 获取文档的内容块
      const contentBlock = await ctx.runQuery(internal.prompt.queries.getDocumentContentBlock, {
        documentId: args.documentId,
      });
      if (!contentBlock) throw new Error("文档内容块不存在");
      
      contentBlockId = contentBlock._id;
      originalContent = contentBlock.content;

      // 4. 获取模型配置和API密钥
      const modelId = args.modelId || DEFAULT_MODEL_ID;
      const modelConfig = AVAILABLE_MODELS[modelId];
      if (!modelConfig) throw new Error(`不支持的模型ID: ${modelId}`);
      
      const apiKey = getApiKey(modelConfig, args.userApiKey);
      if (!apiKey) throw new Error("缺少API密钥，请提供有效的API密钥");

      // 5. 构建 LangChain 消息（无历史记录，纯粹的单次生成）
      const langchainMessages = [];
      if (args.systemPrompt) {
        langchainMessages.push(new SystemMessage(args.systemPrompt));
      }
      langchainMessages.push(new HumanMessage(args.userPrompt));

      // 6. 创建流式聊天模型
      const chatModel = createChatModel({
        apiKey,
        modelConfig,
        streaming: true,
      });

      // 7. 处理流式生成并持久化到内容块
      const { fullResponse, tokenCount } = await handlePromptStreamAndPersist(
        ctx,
        chatModel,
        langchainMessages,
        contentBlockId
      );

      // 8. 成功返回
      const endTime = Date.now();
      const durationMs = endTime - startTime;

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
      console.error("流式生成提示词内容失败:", error);
      // 结构化上下文日志：模型、文档与耗时，帮助诊断上游限流/超时/鉴权问题
      try {
        const durationMs = Date.now() - startTime;
        const modelId = args.modelId || DEFAULT_MODEL_ID;
        const modelConfig = AVAILABLE_MODELS[modelId];
        console.error("[PromptStreamError]", {
          documentId: args.documentId,
          contentBlockId,
          modelId,
          modelName: modelConfig?.modelName,
          provider: modelConfig?.provider,
          baseURL: modelConfig?.baseURL,
          durationMs,
          error,
        });
      } catch {}
      const errorMessage = error instanceof Error ? error.message : "未知错误";

      // 如果出错，并且已保存原始版本，则执行回滚操作
      if (contentBlockId && originalContent !== undefined) {
        await ctx.runMutation(internal.prompt.mutations.updateBlockContent, {
          blockId: contentBlockId,
          content: originalContent,
        });
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});

