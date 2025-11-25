import { action } from "../_generated/server";
import { v } from "convex/values";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "../_lib/models";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import {
  getApiKey,
  createChatModel,
} from "../_lib/chatUtils";

import {
  HTML_GENERATION_SYSTEM_PROMPT,
  REACT_GENERATION_SYSTEM_PROMPT,
  extractCodeFromResponse,
  extractExplanationFromResponse,
  handleFactoryStreamAndPersist,
  createCodeVersion,
  updateAppLatestCode,
  getAppCurrentVersion,
  markMessageStreamingComplete,
  updateAppMessageContent,
} from "../_lib/factoryUtils";

/**
 * 工坊模块：流式生成微应用代码（统一接口）
 * 
 * 设计理念：
 * - 单一职责：无论是首次生成还是迭代修改，都使用这一个 action
 * - 智能判断：根据应用状态（是否有 latestCode 和历史消息）自动选择策略
 * - 存算分离：流式传输完整内容，持久化时分离存储（消息表存说明，版本表存代码）
 * 
 * 工作流程：
 * 1. 获取应用状态和历史消息
 * 2. 判断模式：
 *    - 创建模式：无 latestCode → 使用基础系统提示词
 *    - 修改模式：有 latestCode → 注入当前代码和历史上下文
 * 3. 流式生成并实时更新
 * 4. 完成后分离存储：
 *    - 消息表：存储纯说明文字（避免 Token 膨胀）
 *    - 版本表：存储纯代码
 * 
 * @param appId 应用 ID
 * @param userPrompt 用户的提示词
 * @param appType 应用类型（html 或 react）
 * @param modelId 可选的模型 ID
 * @param userApiKey 可选的用户 API 密钥
 * @returns 成功响应包含生成的代码和元数据
 */
export const streamGenerateApp = action({
  args: {
    appId: v.id("apps"),
    userPrompt: v.string(),
    appType: v.union(v.literal("html"), v.literal("react")),
    modelId: v.optional(v.string()),
    userApiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      // 1. 身份验证
      const userId = (await ctx.auth.getUserIdentity())?.subject;
      if (!userId) throw new Error("未授权访问");

      // 2. 授权检查：验证用户是否拥有该应用
      const app: any = await ctx.runQuery(internal.factory.queries.getAppById, {
        appId: args.appId,
      });
      if (!app) throw new Error("应用不存在");
      if (app.userId !== userId) throw new Error("无权操作此应用");
      if (app.isArchived) throw new Error("应用已归档，无法编辑");

      // 3. 获取历史消息（用于判断模式和构建上下文）
      const messages = await ctx.runQuery(
        internal.factory.queries.listAppMessages,
        {
          appId: args.appId,
        }
      );

      // 4. 创建用户消息
      const userMessageId = await ctx.runMutation(
        internal.factory.mutations.createMessage,
        {
          appId: args.appId,
          role: "user",
          content: args.userPrompt,
        }
      );

      // 5. 创建 AI 消息占位符
      const assistantMessageId = await ctx.runMutation(
        internal.factory.mutations.createMessage,
        {
          appId: args.appId,
          role: "assistant",
          content: "",
          isStreaming: true,
        }
      );

      // 6. 获取模型配置和 API 密钥
      const modelId = args.modelId || DEFAULT_MODEL_ID;
      const modelConfig = AVAILABLE_MODELS[modelId];
      if (!modelConfig) {
        throw new Error(`不支持的模型ID: ${modelId}`);
      }

      const apiKey = getApiKey(modelConfig, args.userApiKey);
      if (!apiKey) {
        throw new Error("缺少API密钥，请提供有效的API密钥");
      }

      // 7. 【核心判断】根据应用状态选择模式
      const hasCode: boolean = !!app.latestCode;
      const hasHistory: boolean = messages.length > 0;
      const isCreationMode: boolean = !hasCode; // 只要没有代码，就是创建模式

      // 8. 选择基础系统提示词
      const baseSystemPrompt =
        args.appType === "html"
          ? HTML_GENERATION_SYSTEM_PROMPT
          : REACT_GENERATION_SYSTEM_PROMPT;

      // 9. 构建 LangChain 消息
      const langchainMessages: (SystemMessage | HumanMessage)[] = [];

      if (isCreationMode) {
        // --- 创建模式：简单直接 ---
        langchainMessages.push(new SystemMessage(baseSystemPrompt));
        langchainMessages.push(new HumanMessage(args.userPrompt));
      } else {
        // --- 修改模式：注入当前代码和历史上下文 ---
        const enhancedSystemPrompt = `${baseSystemPrompt}

### Current Code Context
Here is the current version of the application code:
\`\`\`
${app.latestCode}
\`\`\`

The user will provide instructions to modify this code. Please generate the COMPLETE updated code, not just the changes.`;

        langchainMessages.push(new SystemMessage(enhancedSystemPrompt));

        // 包含最近的历史对话（避免上下文过长）
        if (hasHistory) {
          const MAX_HISTORY_MESSAGES = 6;
          const recentMessages = messages
            .slice(-MAX_HISTORY_MESSAGES)
            .map((msg: { role: string; content: string }) => {
              if (msg.role === "user") {
                return new HumanMessage(msg.content);
              } else if (msg.role === "assistant") {
                return new SystemMessage(`Assistant: ${msg.content}`);
              }
              return null;
            })
            .filter((msg): msg is HumanMessage | SystemMessage => msg !== null);

          langchainMessages.push(...recentMessages);
        }

        langchainMessages.push(new HumanMessage(args.userPrompt));
      }

      // 10. 创建流式聊天模型
      const chatModel = createChatModel({
        apiKey,
        modelConfig,
        streaming: true,
      });

      // 11. 执行流式生成并持久化（此时存储的是完整内容）
      const { fullResponse, tokenCount } = await handleFactoryStreamAndPersist(
        ctx,
        chatModel,
        langchainMessages,
        assistantMessageId
      );

      // 12. 提取纯净代码和说明文字
      const extractedCode = extractCodeFromResponse(fullResponse);
      const explanation = extractExplanationFromResponse(fullResponse);

      // 13. 【关键】更新消息内容为纯说明文字（去除代码，避免历史上下文中的 Token 膨胀）
      await updateAppMessageContent(ctx, assistantMessageId, explanation);

      // 14. 标记流式传输完成
      await markMessageStreamingComplete(ctx, assistantMessageId);

      // 15. 获取当前版本号并创建新版本
      const currentVersion = await getAppCurrentVersion(ctx, args.appId);
      const newVersion = currentVersion + 1;

      const versionId = await createCodeVersion(
        ctx,
        args.appId,
        assistantMessageId,
        extractedCode,
        newVersion
      );

      // 16. 关联消息与代码版本
      await ctx.runMutation(internal.factory.mutations.linkMessageToVersion, {
        messageId: assistantMessageId,
        versionId,
      });

      // 17. 更新应用的最新代码和版本号
      await updateAppLatestCode(ctx, args.appId, extractedCode, newVersion);

      // 18. 返回成功响应
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      return {
        success: true,
        code: extractedCode,
        versionId,
        metadata: {
          modelUsed: modelConfig.modelName,
          tokensUsed: tokenCount,
          durationMs,
          version: newVersion,
          mode: isCreationMode ? "creation" : "iteration",
        },
      };
    } catch (error) {
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      const errorMessage = error instanceof Error ? error.message : "未知错误";

      // 结构化错误日志
      try {
        const modelId = args.modelId || DEFAULT_MODEL_ID;
        const modelConfig = AVAILABLE_MODELS[modelId];
        console.error("[FactoryStreamError]", {
          appId: args.appId,
          appType: args.appType,
          modelId,
          modelName: modelConfig?.modelName,
          provider: modelConfig?.provider,
          baseURL: modelConfig?.baseURL,
          durationMs,
          error,
        });
      } catch {}

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});


