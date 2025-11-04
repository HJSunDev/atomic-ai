import { ModelConfig } from "./models";
import { ActionCtx, QueryCtx } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

/**
 * 根据用户消息生成对话标题。
 * 如果消息长度超过30个字符，则截断并添加省略号。
 *
 * @param userMessage 用户输入的消息。
 * @returns 生成的对话标题。
 */
export const generateConversationTitle = (userMessage: string): string => {
  const title =
    userMessage.length > 30
      ? userMessage.substring(0, 30) + "..."
      : userMessage;
  return title;
};

/**
 * 获取API密钥
 * 根据模型类型和用户提供的API密钥确定最终使用的API密钥
 */
export function getApiKey(
  modelConfig: ModelConfig,
  userApiKey?: string
): string | null {
  // 对于免费模型，使用环境变量中的API密钥
  if (modelConfig.isFree) {
    return process.env.OPENAI_API_KEY || null;
  }

  // 对于付费模型，使用用户提供的API密钥
  if (!userApiKey) {
    return null;
  }

  // 清理API密钥，移除可能的前后空格
  return userApiKey.trim();
}

/**
 * 获取并格式化会话历史记录以适应LangChain模型。
 *
 * @param ctx - Convex的Action或Query上下文。
 * @param conversationId - 要获取历史记录的会话ID。
 * @param systemPrompt - （可选）要在消息列表开头插入的系统提示。
 * @returns 格式化为LangChain消息对象的数组。
 */
export const getLangChainMessageHistory = async (
  ctx: ActionCtx | QueryCtx,
  conversationId: Id<"conversations">,
  systemPrompt?: string
) => {
  // 1. 获取主线对话消息
  const messages = await ctx.runQuery(api.chat.queries.getConversationMessages, {
    conversationId,
  });

  // 2. 构建langchain消息格式
  const langchainMessages = [];

  // 添加系统提示（如果有）
  if (systemPrompt) {
    langchainMessages.push(new SystemMessage(systemPrompt));
  }

  // 添加数据库中的对话历史
  for (const msg of messages) {
    if (msg.role === "user") {
      langchainMessages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      // getConversationMessages 查询已保证这是被选中的AI回复
      langchainMessages.push(new AIMessage(msg.content));
    } else if (msg.role === "system") {
      // 虽然通常systemPrompt参数会处理这个，但为了完整性也包含历史中的系统消息
      langchainMessages.push(new SystemMessage(msg.content));
    }
  }

  return langchainMessages;
};

// AI客户端选项接口
interface AIClientOptions {
  apiKey: string;
  modelConfig: ModelConfig;
  streaming?: boolean;
}

/**
 * 创建ChatOpenAI实例
 * 封装ChatOpenAI的创建逻辑，提供统一的接口
 */
export function createChatModel(options: AIClientOptions) {
  const { apiKey, modelConfig, streaming = false } = options;

  // 创建并返回ChatOpenAI实例
  return new ChatOpenAI({
    // 使用配置的基础URL: openRouter的服务
    configuration: modelConfig.baseURL
      ? { baseURL: modelConfig.baseURL }
      : undefined,
    openAIApiKey: apiKey,
    modelName: modelConfig.modelName,
    temperature: modelConfig.temperature,
    maxTokens: modelConfig.maxTokens,
    streaming: streaming,
    // 为了与 OpenAI SDK 对齐，timeout 为毫秒单位，这里设置为 10 秒
    timeout: 10000,
    // 关闭 LangChain 层的自动重试，确保限流/错误能尽快反馈
    maxRetries: 0,
  });
}

/**
 * 处理AI模型的响应流，并将其逐步持久化到数据库。
 *
 * @param ctx - Convex的Action上下文。
 * @param chatModel - ChatOpenAI模型实例。
 * @param langchainMessages - 发送给模型的历史消息。
 * @param assistantMessageId - 需要更新内容的AI助手消息的ID。
 * @returns 包含完整响应和token数量的对象。
 */
export const handleStreamAndPersist = async (
  ctx: ActionCtx,
  chatModel: ChatOpenAI,
  langchainMessages: BaseMessage[],
  assistantMessageId: Id<"messages">
) => {
  let fullResponse = "";
  let tokenCount = 0;
  let lastUpdateTime = Date.now();
  const UPDATE_INTERVAL_MS = 200; // 每200ms更新一次数据库

  const stream = await chatModel.stream(langchainMessages);

  for await (const chunk of stream) {
    const content = chunk.content;
    if (typeof content === "string") {
      fullResponse += content;
      tokenCount++;

      // 按时间间隔更新数据库，避免过于频繁的更新
      const now = Date.now();
      if (now - lastUpdateTime >= UPDATE_INTERVAL_MS) {
        await ctx.runMutation(api.chat.mutations.updateMessageContent, {
          messageId: assistantMessageId,
          content: fullResponse,
          skipAuth: true, // 内部调用，跳过权限验证
        });
        lastUpdateTime = now;
      }
    }
  }

  // 循环内的更新是按时间间隔进行的。这最后一次调用是"保险"操作，
  // 确保在流结束后，所有剩余内容（特别是那些在最后一个时间间隔内到达的）都被完整地写入数据库，
  // 从而保证数据的最终完整性。
  await ctx.runMutation(api.chat.mutations.updateMessageContent, {
    messageId: assistantMessageId,
    content: fullResponse,
    skipAuth: true, // 内部调用，跳过权限验证
  });

  return { fullResponse, tokenCount };
};

/**
 * 处理AI模型的响应流，并将其逐步持久化到指定块的 `content` 字段。
 *
 * @param ctx - Convex的Action上下文。
 * @param chatModel - ChatOpenAI模型实例。
 * @param langchainMessages - 发送给模型的历史消息。
 * @param blockId - 需要更新内容的块ID（通常是文档的内容块）。
 * @returns 包含完整响应和token数量的对象。
 */
export const handlePromptStreamAndPersist = async (
  ctx: ActionCtx,
  chatModel: ChatOpenAI,
  langchainMessages: BaseMessage[],
  blockId: Id<"blocks">
) => {
  let fullResponse = "";
  let tokenCount = 0;
  let lastUpdateTime = Date.now();
  const UPDATE_INTERVAL_MS = 200; // 每200ms更新一次数据库

  const stream = await chatModel.stream(langchainMessages);

  for await (const chunk of stream) {
    const content = chunk.content;
    if (typeof content === "string") {
      fullResponse += content;
      tokenCount++;

      // 按时间间隔更新数据库，避免过于频繁的更新
      const now = Date.now();
      if (now - lastUpdateTime >= UPDATE_INTERVAL_MS) {
        await ctx.runMutation(internal.prompt.mutations.updateBlockContent, {
          blockId: blockId,
          content: fullResponse,
        });
        lastUpdateTime = now;
      }
    }
  }

  // 循环内的更新是按时间间隔进行的。这最后一次调用是"保险"操作，
  // 确保在流结束后，所有剩余内容（特别是那些在最后一个时间间隔内到达的）都被完整地写入数据库，
  // 从而保证数据的最终完整性。
  await ctx.runMutation(internal.prompt.mutations.updateBlockContent, {
    blockId: blockId,
    content: fullResponse,
  });

  return { fullResponse, tokenCount };
};

/**
 * 定义消息元数据的结构。
 */
interface MessageMetadata {
  aiModel: string;
  tokensUsed: number;
  durationMs: number;
}

/**
 * 更新消息的最终元数据。
 *
 * @param ctx - Convex的Action上下文。
 * @param messageId - 要更新元数据的消息ID。
 * @param metadata - 包含模型、token和耗时信息的元数据对象。
 */
export const updateMessageMetadata = async (
  ctx: ActionCtx,
  messageId: Id<"messages">,
  metadata: MessageMetadata
) => {
  await ctx.runMutation(internal.chat.mutations.updateMessageMetadata, {
    messageId,
    metadata,
  });
}; 