/**
 * 对话消息类型
 * 表示对话中的单个消息
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

/**
 * 对话历史记录类型
 * 表示完整的对话历史
 */
export type ChatHistory = ChatMessage[];

/**
 * AI模型使用信息
 * 记录使用的AI模型的相关信息
 */
export interface ModelUsageInfo {
  id: string;           // 模型ID
  name: string;         // 模型名称
  provider: string;     // 提供商
  timestamp?: string;   // 使用时间戳
}

/**
 * 标准AI响应结构
 * 所有AI服务的响应都应遵循这一结构
 */
export interface AIResponse<T = any> {
  content: T;                     // 响应内容
  modelUsed?: ModelUsageInfo;     // 使用的模型信息
  timestamp: string;              // 时间戳
  status: 'success' | 'error';    // 状态
  error?: string;                 // 错误信息（如果有）
  isStructured: boolean;          // 是否为结构化输出
}

/**
 * 多轮对话参数
 * 用于多轮对话的参数定义
 */
export interface ChatCompletionParams {
  userMessage: string;           // 用户消息
  chatHistory?: ChatMessage[];   // 对话历史
  modelId?: string;              // 模型ID
  apiKey?: string;               // API密钥
  systemPrompt?: string;         // 系统提示
}

/**
 * 结构化输出参数
 * 用于结构化输出的参数定义
 */
export interface StructuredOutputParams<T> {
  userMessage: string;             // 用户消息
  outputParser: any;               // 输出解析器
  chatHistory?: ChatMessage[];     // 对话历史
  modelId?: string;                // 模型ID
  apiKey?: string;                 // API密钥
  systemPrompt?: string;           // 系统提示
}

/**
 * Token使用情况
 * 记录Token的使用情况
 */
export interface TokenUsage {
  promptTokens: number;        // 提示占用的token数
  completionTokens: number;    // 回复占用的token数
  totalTokens: number;         // 总token数
} 