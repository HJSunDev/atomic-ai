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
import { AgentExecutor } from "langchain/agents";

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
 * 处理AI模型的响应流，并将其逐步持久化到指定块的 `streamingMarkdown` 字段。
 * 
 * 设计特性：
 * - AI生成的内容以 Markdown 格式写入 streamingMarkdown 临时字段
 * - 设置 isStreaming=true 标记正在生成中
 * - 流式完成后，前端负责将 MD 转换为 JSON 并保存到 content 字段
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

  // 在流式开始前，初始化流式状态
  await ctx.runMutation(internal.prompt.mutations.updateBlockStreamingMarkdown, {
    blockId: blockId,
    streamingMarkdown: "",
    isStreaming: true,
  });

  const stream = await chatModel.stream(langchainMessages);

  for await (const chunk of stream) {
    const content = chunk.content;
    if (typeof content === "string") {
      fullResponse += content;
      tokenCount++;

      // 按时间间隔更新数据库，避免过于频繁的更新
      const now = Date.now();
      if (now - lastUpdateTime >= UPDATE_INTERVAL_MS) {
        await ctx.runMutation(internal.prompt.mutations.updateBlockStreamingMarkdown, {
          blockId: blockId,
          streamingMarkdown: fullResponse,
          isStreaming: true,
        });
        lastUpdateTime = now;
      }
    }
  }
  // 循环内的更新是按时间间隔进行的。这最后一次调用是"保险"操作，
  // 确保在流结束后，所有剩余内容（特别是那些在最后一个时间间隔内到达的）都被完整地写入数据库，
  // 流式完成：写入最终的完整 Markdown 内容，并设置 isStreaming=false
  // 前端检测到 isStreaming 变为 false 后，会触发 MD→JSON 转换并保存到 content 字段
  await ctx.runMutation(internal.prompt.mutations.updateBlockStreamingMarkdown, {
    blockId: blockId,
    streamingMarkdown: fullResponse,
    isStreaming: false,
  });

  return { fullResponse, tokenCount };
};

/**
 * 处理 Agent 的响应流，并将其逐步持久化到数据库。
 * 这个函数专门处理带有工具调用的 Agent 场景。
 * 
 * @param ctx - Convex的Action上下文。
 * @param agentExecutor - LangChain Agent 执行器实例。
 * @param userInput - 用户最新的输入文本。
 * @param chatHistory - 之前的对话历史，不包含最新的用户输入。
 * @param assistantMessageId - 需要更新内容的AI助手消息的ID。
 * @returns 包含完整响应和token数量的对象。
 */
export const handleAgentStreamAndPersist = async (
  ctx: ActionCtx,
  agentExecutor: AgentExecutor,
  userInput: string,
  chatHistory: BaseMessage[],
  assistantMessageId: Id<"messages">
) => {
  console.log('进入handleAgentStreamAndPersist');
  let fullResponse = "";
  let tokenCount = 0;
  let lastContentUpdateTime = Date.now();
  const UPDATE_INTERVAL_MS = 200; // 更新数据库的时间间隔

  // 使用 v2 版本的 streamEvents API，以获取结构化的事件流
  const stream = agentExecutor.streamEvents(
    {
      input: userInput,
      chat_history: chatHistory,
    },
    { version: "v2" }
  );

  // 获取当前消息的 steps，以便在此基础上追加
  const initialMessage = await ctx.runQuery(internal.chat.queries.getMessage, { messageId: assistantMessageId });
  const currentSteps = initialMessage?.steps ?? [];

  for await (const event of stream) {
    const eventName = event.event;

    // 1. 捕获工具调用开始事件
    if (eventName === "on_tool_start") {
      currentSteps.push({
        type: event.name, // 例如 "web_search"
        status: "started",
        input: event.data.input,
      });
      await ctx.runMutation(internal.chat.mutations.updateMessageAgentSteps, {
        messageId: assistantMessageId,
        steps: currentSteps,
      });
    }

    // 2. 捕获工具调用结束事件
    if (eventName === "on_tool_end") {
      const lastStep = currentSteps[currentSteps.length - 1];
      if (lastStep) {
        lastStep.status = "completed";
        // Tavily 工具的输出可能是字符串化的 JSON，或直接是对象/数组
        try {
          const rawOutput = typeof event.data.output === "string"
            ? JSON.parse(event.data.output as string)
            : event.data.output;

          // 兼容两种形态：数组 或 { results: [...] }
          const resultsArray = Array.isArray(rawOutput)
            ? rawOutput
            : Array.isArray((rawOutput as any)?.results)
              ? (rawOutput as any).results
              : [];

          // 仅保留 schema 允许的字段，移除 raw_content 等多余字段
          const cleaned = (resultsArray as any[]).map((r) => ({
            title: String(r.title ?? ""),
            url: String(r.url ?? ""),
            content: typeof r.content === "string" ? r.content : undefined,
            score: typeof r.score === "number" ? r.score : undefined,
            favicon: typeof r.favicon === "string" ? r.favicon : undefined,
          }));

          lastStep.output = cleaned;
        } catch (e) {
          lastStep.status = "failed";
          lastStep.error = "Failed to parse or normalize tool output.";
          console.error("Failed to parse/normalize tool output:", event.data.output);
        }
        await ctx.runMutation(internal.chat.mutations.updateMessageAgentSteps, {
          messageId: assistantMessageId,
          steps: currentSteps,
        });
      }
    }

    // 3. 捕获最终答案的流式输出
    if (eventName === "on_chat_model_stream") {
      const content = event.data.chunk.content;
      if (typeof content === "string" && content) {
        fullResponse += content;
        tokenCount++; // 粗略计算 token

        // 按时间间隔节流更新数据库
        const now = Date.now();
        if (now - lastContentUpdateTime >= UPDATE_INTERVAL_MS) {
          await ctx.runMutation(api.chat.mutations.updateMessageContent, {
            messageId: assistantMessageId,
            content: fullResponse,
            skipAuth: true,
          });
          lastContentUpdateTime = now;
        }
      }
    }
  }

  // 确保最终的完整内容被写入数据库
  await ctx.runMutation(api.chat.mutations.updateMessageContent, {
    messageId: assistantMessageId,
    content: fullResponse,
    skipAuth: true,
  });

  return { fullResponse, tokenCount };
};

/**
 * 定义消息元数据的结构。
 */
interface MessageMetadata {
  status?: "success" | "error" | "pending";
  aiModel?: string;
  tokensUsed?: number;
  durationMs?: number;
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