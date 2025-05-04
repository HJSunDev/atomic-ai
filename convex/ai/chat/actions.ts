"use node";

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "../../config/models";
import { 
  createChatModel, 
  getApiKey, 
  checkEnvironmentConfig 
} from "../utils/aiClient";
import { 
  ApiKeyError, 
  ModelConfigError, 
  createErrorResponse,
  handleAIServiceError
} from "../utils/errorHandler";
import { 
  chatPromptTemplate, 
  structuredOutputPromptTemplate 
} from "../utils/promptTemplates";
import { 
  AIResponse, 
  ChatMessage, 
  ChatCompletionParams,
  ChatHistory 
} from "../utils/types";

/**
 * 聊天完成
 * 提供基本的多轮对话能力
 */
export const chatCompletion = action({
  args: {
    userMessage: v.string(),
    chatHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.optional(v.string()),
    }))),
    modelId: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AIResponse<string>> => {
    try {
      // 检查环境配置
      const envCheck = checkEnvironmentConfig();
      if (!envCheck.isValid) {
        throw new Error(envCheck.error);
      }

      // 获取模型配置
      const modelId = args.modelId || DEFAULT_MODEL_ID;
      const modelConfig = AVAILABLE_MODELS[modelId];
      
      if (!modelConfig) {
        throw new ModelConfigError(`未找到ID为 ${modelId} 的模型配置`);
      }

      // 获取API密钥
      const apiKey = getApiKey(modelConfig, args.apiKey);
      if (!apiKey) {
        throw new ApiKeyError(
          modelConfig.isFree 
            ? "系统配置错误：未找到环境变量中的API密钥" 
            : "使用付费模型需要提供API密钥"
        );
      }

      // 准备聊天历史
      const chatHistory = formatChatHistory(args.chatHistory || []);
      
      // 创建AI模型实例
      const model = createChatModel({ apiKey, modelConfig });
      
      // 格式化聊天历史为字符串
      const chatHistoryText = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n\n");
      
      // 准备系统提示
      const systemPrompt = args.systemPrompt || 
        "你是一个智能AI助手，专注于提供有帮助、有礼貌和准确的回答。";
      
      // 格式化提示
      const prompt = await chatPromptTemplate.format({
        chat_history: chatHistoryText,
        user_message: args.userMessage,
        system_prompt: systemPrompt
      });

      // 调用AI模型生成响应
      const response = await model.invoke(prompt);

      // 创建字符串输出解析器
      const stringOutputParser = new StringOutputParser();
      // 获取响应文本
      const responseText = await stringOutputParser.invoke(response);
      
      // 返回成功结果
      return {
        content: responseText,
        modelUsed: {
          id: modelId,
          name: modelConfig.modelName,
          provider: modelConfig.provider
        },
        timestamp: new Date().toISOString(),
        status: "success",
        isStructured: false
      };
    } catch (error) {
      // 处理错误
      const processedError = handleAIServiceError(error);
      const errorResponse = createErrorResponse(processedError);
      
      // 返回错误响应
      return {
        content: `抱歉，处理您的请求时遇到了问题：${processedError.message}`,
        error: errorResponse.error,
        status: errorResponse.status,
        timestamp: errorResponse.timestamp,
        isStructured: errorResponse.isStructured
      };
    }
  }
});

/**
 * 结构化输出
 * 提供基于schema的结构化输出能力
 */
export const structuredOutput = action({
  args: {
    userMessage: v.string(),
    schema: v.string(),
    chatHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.optional(v.string()),
    }))),
    modelId: v.optional(v.string()),
    apiKey: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AIResponse<any>> => {
    try {
      // 检查环境配置
      const envCheck = checkEnvironmentConfig();
      if (!envCheck.isValid) {
        throw new Error(envCheck.error);
      }

      // 获取模型配置
      const modelId = args.modelId || DEFAULT_MODEL_ID;
      const modelConfig = AVAILABLE_MODELS[modelId];
      
      if (!modelConfig) {
        throw new ModelConfigError(`未找到ID为 ${modelId} 的模型配置`);
      }

      // 获取API密钥
      const apiKey = getApiKey(modelConfig, args.apiKey);
      if (!apiKey) {
        throw new ApiKeyError(
          modelConfig.isFree 
            ? "系统配置错误：未找到环境变量中的API密钥" 
            : "使用付费模型需要提供API密钥"
        );
      }

      // 解析schema字符串为Zod模式
      const schemaObj = JSON.parse(args.schema);
      const zodSchema = parseZodSchema(schemaObj);
      
      // 创建结构化输出解析器
      const parser = StructuredOutputParser.fromZodSchema(zodSchema);
      // 获取格式化指令
      const formatInstructions = parser.getFormatInstructions();

      // 准备聊天历史
      const chatHistory = formatChatHistory(args.chatHistory || []);
      
      // 创建AI模型实例
      const model = createChatModel({ apiKey, modelConfig });
      
      // 格式化聊天历史为字符串
      const chatHistoryText = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n\n");
      
      // 准备系统提示
      const systemPrompt = args.systemPrompt || 
        "你是一个智能AI助手，专注于提供结构化的回答。";
      
      // 格式化提示
      const prompt = await structuredOutputPromptTemplate.format({
        chat_history: chatHistoryText,
        user_message: args.userMessage,
        system_prompt: systemPrompt,
        format_instructions: formatInstructions
      });

      // 调用AI模型生成响应
      const response = await model.invoke(prompt);

      // 创建字符串输出解析器
      const stringOutputParser = new StringOutputParser();
      // 获取响应文本
      const responseText = await stringOutputParser.invoke(response);
      
      // 尝试解析结构化输出
      try {
        const structuredOutput = await parser.parse(responseText);

        // 返回成功结果
        return {
          content: structuredOutput,
          modelUsed: {
            id: modelId,
            name: modelConfig.modelName,
            provider: modelConfig.provider
          },
          timestamp: new Date().toISOString(),
          status: "success",
          isStructured: true
        };
      } catch (parseError) {
        console.error("解析结构化输出失败:", parseError);
        
        // 解析失败时的降级处理
        return {
          content: responseText,
          modelUsed: {
            id: modelId,
            name: modelConfig.modelName,
            provider: modelConfig.provider
          },
          timestamp: new Date().toISOString(),
          status: "success",
          isStructured: false
        };
      }
    } catch (error) {
      // 处理错误
      const processedError = handleAIServiceError(error);
      const errorResponse = createErrorResponse(processedError);
      
      // 返回错误响应
      return {
        content: `抱歉，处理您的请求时遇到了问题：${processedError.message}`,
        error: errorResponse.error,
        status: errorResponse.status,
        timestamp: errorResponse.timestamp,
        isStructured: errorResponse.isStructured
      };
    }
  }
});

/**
 * 格式化聊天历史
 * 确保聊天历史的格式正确
 */
function formatChatHistory(history: any[]): ChatHistory {
  return history.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    timestamp: msg.timestamp
  }));
}

/**
 * 解析Zod Schema
 * 将JSON对象转换为Zod模式
 */
function parseZodSchema(schemaObj: any): z.ZodType<any> {
  // 简化处理，实际应用中需要更完善的实现
  return z.object(
    Object.entries(schemaObj).reduce((acc, [key, value]) => {
      if (value === 'string') {
        acc[key] = z.string();
      } else if (value === 'number') {
        acc[key] = z.number();
      } else if (value === 'boolean') {
        acc[key] = z.boolean();
      } else if (Array.isArray(value)) {
        acc[key] = z.array(z.any());
      } else if (typeof value === 'object') {
        acc[key] = parseZodSchema(value);
      }
      return acc;
    }, {} as Record<string, z.ZodType<any>>)
  );
} 