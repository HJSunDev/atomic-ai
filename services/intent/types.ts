/**
 * 意图识别模块类型定义
 */

/**
 * 支持的意图类型
 */
export type IntentType = "chat" | "document" | "app";

/**
 * 意图识别结果（AI 返回的结构化数据）
 */
export interface IntentResult {
  // 识别出的意图类型
  intent: IntentType;
  // 置信度 (0-1)
  confidence: number;
  // 判断理由
  reason: string;
  // 用户需求概括
  summary: string;
}

/**
 * 意图路由的输入参数
 */
export interface IntentRouteInput {
  // 用户输入的原始文本
  userPrompt: string;
  // 使用的模型 ID
  modelId: string;
  // 是否启用联网搜索
  webSearchEnabled: boolean;
  // 用户自定义 API Key
  userApiKey?: string;
}

/**
 * 意图处理回调函数类型
 * 如果提供了处理函数，Router 将执行该函数而不是默认的路由逻辑
 * 返回 boolean 表示处理是否成功
 */
export type IntentHandler = (intent: IntentResult, input: IntentRouteInput) => Promise<boolean>;

/**
 * 意图处理器映射
 */
export interface IntentHandlers {
  chat?: IntentHandler;
  document?: IntentHandler;
  app?: IntentHandler;
}
