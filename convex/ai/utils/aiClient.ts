import { ChatOpenAI } from "@langchain/openai";
import { ModelConfig } from "../../config/models";

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
  });
}

/**
 * 获取API密钥
 * 根据模型类型和用户提供的API密钥确定最终使用的API密钥
 */
export function getApiKey(modelConfig: ModelConfig, userApiKey?: string): string | null {
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
 * 计算预估的token数量
 * 粗略估计输入文本的token数量
 */
export function estimateTokenCount(text: string): number {
  // 英文文本平均每4个字符约为1个token
  // 中文文本每个字符约1.5个token
  // 这里使用简化的计算方法，实际应用中可能需要更精确的算法
  
  // 计算中文字符数
  const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 计算非中文字符数
  const nonChineseCharCount = text.length - chineseCharCount;
  
  // 估算token数量
  return Math.ceil((chineseCharCount * 1.5 + nonChineseCharCount / 4));
}

/**
 * 检查环境变量配置
 * 确保必要的环境变量已正确配置
 */
export function checkEnvironmentConfig(): { isValid: boolean; error?: string } {
  if (!process.env.OPENAI_API_KEY) {
    return { 
      isValid: false, 
      error: "缺少OPENAI_API_KEY环境变量，请在Convex配置中设置" 
    };
  }
  
  return { isValid: true };
} 