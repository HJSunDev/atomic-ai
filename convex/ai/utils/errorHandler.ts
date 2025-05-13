/**
 * AI服务错误类
 * 封装AI服务相关的错误信息
 */
export class AIServiceError extends Error {
  public code: string;
  
  constructor(message: string, code: string = 'AI_SERVICE_ERROR') {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;
  }
}

/**
 * API密钥错误
 * 处理API密钥相关的错误
 */
export class ApiKeyError extends AIServiceError {
  constructor(message: string) {
    super(message, 'API_KEY_ERROR');
    this.name = 'ApiKeyError';
  }
}

/**
 * 模型配置错误
 * 处理模型配置相关的错误
 */
export class ModelConfigError extends AIServiceError {
  constructor(message: string) {
    super(message, 'MODEL_CONFIG_ERROR');
    this.name = 'ModelConfigError';
  }
}

/**
 * 解析错误
 * 处理响应解析相关的错误
 */
export class ParseError extends AIServiceError {
  public rawResponse: string;
  
  constructor(message: string, rawResponse: string) {
    super(message, 'PARSE_ERROR');
    this.name = 'ParseError';
    this.rawResponse = rawResponse;
  }
}

/**
 * 创建通用错误响应
 * 用于在发生错误时返回标准格式的错误响应
 */
export function createErrorResponse(error: Error): {
  error: string;
  status: 'error';
  timestamp: string;
  isStructured: boolean;
} {
  return {
    error: error instanceof Error ? error.message : String(error),
    status: 'error',
    timestamp: new Date().toISOString(),
    isStructured: false
  };
}

/**
 * 处理AI服务错误
 * 统一的错误处理逻辑
 */
export function handleAIServiceError(error: unknown): Error {
  console.error('AI服务错误:', error);
  
  if (error instanceof Error) {
    // 是已知错误类型，直接返回
    return error;
  }
  
  // 未知错误类型，创建通用AI服务错误
  return new AIServiceError(
    typeof error === 'string' ? error : '发生未知错误'
  );
} 