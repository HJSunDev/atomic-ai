// 定义模型配置接口
interface ModelConfig {
  modelName: string;       // 模型名称
  provider: string;        // 提供商
  baseURL?: string;        // API基础URL
  temperature: number;     // 温度参数
  maxTokens: number;       // 最大token数
  description: string;     // 模型描述
  isRecommended: boolean;  // 是否推荐
  isFree: boolean;         // 是否免费
  // 模型简称（用于有限空间展示，例如模型切换器）
  shortName: string;
  // 模型系列标识（如 "gpt", "claude", "deepseek" 等，用于分组和图标显示）
  modelSeries: string;
}

// 定义服务商类型
export type ProviderType = 'openrouter';

// 为不同厂商设定推荐的最大输出 tokens（非上下文窗口）。
// 说明：这些值用于减少长输出被截断的概率，最终仍受各模型/路由的硬性上限约束。
const OPENAI_DEFAULT_MAX_OUTPUT_TOKENS = 4096;
const ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS = 8192;
const DEEPSEEK_DEFAULT_MAX_OUTPUT_TOKENS = 8192;
const QWEN_DEFAULT_MAX_OUTPUT_TOKENS = 8192;
const Z_AI_GLM_DEFAULT_MAX_OUTPUT_TOKENS = 8192;
const FREE_MODEL_BASELINE_MAX_OUTPUT_TOKENS = 4096;

// 按服务商分类的模型列表
export const MODELS_BY_PROVIDER: Record<ProviderType, {
  paid: Record<string, ModelConfig>,
  free: Record<string, ModelConfig>
}> = {
  // OpenRouter服务商的模型
  openrouter: {
    // 付费模型
    paid: {
      "gpt-3.5-turbo": {
        modelName: "gpt-3.5-turbo",
        provider: "openai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.7,
        // GPT-3.5 的输出上限相对更紧，设为 2048 更稳妥，避免因超限报错
        maxTokens: 2048,
        description: "OpenAI的快速响应模型，平衡效率与性能，适合日常对话和一般分析任务",
        isRecommended: false,
        isFree: false,
        shortName: "GPT-3.5",
        modelSeries: "gpt"
      },
      "gpt-4o": {
        modelName: "gpt-4o",
        provider: "openai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: OPENAI_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "OpenAI的多模态旗舰模型，具备强大的推理能力和知识广度，适合复杂分析和创意任务",
        isRecommended: false,
        isFree: false,
        shortName: "GPT-4o",
        modelSeries: "gpt"
      },
      "gpt-5-chat": {
        modelName: "openai/gpt-5-chat",
        provider: "openai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: OPENAI_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "OpenAI新一代对话模型，面向企业级应用，具备更强的多模态、长上下文与稳健推理能力",
        isRecommended: true,
        isFree: false,
        shortName: "GPT-5",
        modelSeries: "gpt"
      },
      "claude-3-7-sonnet": {
        modelName: "anthropic/claude-3-7-sonnet",
        provider: "anthropic",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "Anthropic最新的中型模型，提供卓越的推理和理解能力，擅长精确、有条理的回应",
        isRecommended: false,
        isFree: false,
        shortName: "Claude 3.7",
        modelSeries: "claude"
      },
      "claude-3.5-sonnet": {
        modelName: "anthropic/claude-3.5-sonnet",
        provider: "anthropic",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "Anthropic的平衡型模型，擅长深度分析和情感理解，在准确性和创造性之间取得良好平衡",
        isRecommended: false,
        isFree: false,
        shortName: "Claude 3.5",
        modelSeries: "claude"
      },
      "deepseek-r1": {
        modelName: "deepseek/deepseek-r1",
        provider: "deepseek",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.4,
        maxTokens: DEEPSEEK_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "基于强化学习优化的推理模型，擅长逻辑分析和复杂推理，在数学和编程领域表现出色",
        isRecommended: false,
        isFree: false,
        shortName: "DeepSeek R1",
        modelSeries: "deepseek"
      },
      "deepseek-v3": {
        modelName: "deepseek/deepseek-chat",
        provider: "deepseek",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: DEEPSEEK_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "DeepSeek最新的通用对话模型，提供强大的语言理解和推理能力，适合多样化的复杂场景",
        isRecommended: false,
        isFree: false,
        shortName: "DeepSeek V3",
        modelSeries: "deepseek"
      },
      "claude-sonnet-4": {
        modelName: "anthropic/claude-sonnet-4",
        provider: "anthropic",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "Claude Sonnet 4：在编码与推理任务上较3.7代有明显提升，适合日常生产级使用，平衡性能与成本",
        isRecommended: true,
        isFree: false,
        shortName: "Claude Sonnet 4",
        modelSeries: "claude"
      },
      "claude-opus-4.1": {
        modelName: "anthropic/claude-opus-4.1",
        provider: "anthropic",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: ANTHROPIC_DEFAULT_MAX_OUTPUT_TOKENS,
        description: "Claude Opus 4.1：旗舰级推理与研究分析能力，适合复杂代码重构、数据分析与工具协同任务",
        isRecommended: true,
        isFree: false,
        shortName: "Claude Opus 4.1",
        modelSeries: "claude"
      }
    },
    // 免费模型
    free: {
      "deepseek-v3-free": {
        modelName: "deepseek/deepseek-chat:free",
        provider: "deepseek",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT_TOKENS,
        description: "DeepSeek提供的免费对话模型，具备良好的理解能力和基础推理能力，适合日常对话和简单分析",
        isRecommended: false,
        isFree: true,
        shortName: "DeepSeek V3",
        modelSeries: "deepseek"
      },
      "deepseek-v3-0324-free": {
        modelName: "deepseek/deepseek-chat-v3-0324:free",
        provider: "deepseek",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT_TOKENS,
        description: "DeepSeek最新发布的免费对话模型，基于685B参数的mixture-of-experts架构，具有出色的推理能力和知识广度",
        isRecommended: true,
        isFree: true,
        shortName: "DeepSeek V3-0324",
        modelSeries: "deepseek"
      },
      "glm-4.5-air-free": {
        modelName: "z-ai/glm-4.5-air:free",
        provider: "z-ai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT_TOKENS,
        description: "GLM-4.5 Air 的轻量免费版本，采用MoE与混合推理模式，支持思维链推理开关，适合实时交互与工具使用",
        isRecommended: true,
        isFree: true,
        shortName: "GLM 4.5 Air",
        modelSeries: "glm"
      },
      "deepseek-r1-0528-free": {
        modelName: "deepseek/deepseek-r1-0528:free",
        provider: "deepseek",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT_TOKENS,
        description: "DeepSeek R1 0528 版本的免费开源推理模型，支持开放的 reasoning tokens，性能接近同级闭源模型",
        isRecommended: false,
        isFree: true,
        shortName: "DeepSeek R1 0528",
        modelSeries: "deepseek"
      },
      "qwen3-coder-free": {
        modelName: "qwen/qwen3-coder:free",
        provider: "qwen",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT_TOKENS,
        description: "Qwen3 Coder 免费版，基于MoE的代码生成模型，优化于工具调用、函数调用与长上下文推理",
        isRecommended: false,
        isFree: true,
        shortName: "Qwen3 Coder",
        modelSeries: "qwen"
      }
    }
  }
};

// 获取所有可用模型的函数
function getAllModels(): Record<string, ModelConfig> {
  const allModels: Record<string, ModelConfig> = {};
  
  // 合并所有服务商的付费和免费模型
  Object.values(MODELS_BY_PROVIDER).forEach(providerCategories => {
    // 添加付费模型
    Object.entries(providerCategories.paid).forEach(([modelId, modelConfig]) => {
      allModels[modelId] = modelConfig;
    });
    
    // 添加免费模型
    Object.entries(providerCategories.free).forEach(([modelId, modelConfig]) => {
      allModels[modelId] = modelConfig;
    });
  });
  
  return allModels;
}

// 可用模型列表
export const AVAILABLE_MODELS = getAllModels();

// 默认模型ID
export const DEFAULT_MODEL_ID = "deepseek-v3-0324-free";

// 导出ModelConfig接口以便其他模块使用
export type { ModelConfig }; 