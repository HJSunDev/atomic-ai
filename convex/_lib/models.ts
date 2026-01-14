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

// ===================================================================
// 推荐的最大输出 tokens（按业务场景设定）
// ===================================================================

const GENERAL_PAID_MODEL_MAX_DOC_OUTPUT = 16384; // 付费模型：16k tokens
const FREE_MODEL_BASELINE_MAX_OUTPUT = 10000; // 免费模型：10k tokens

// 按服务商分类的模型列表
export const MODELS_BY_PROVIDER: Record<ProviderType, {
  paid: Record<string, ModelConfig>,
  free: Record<string, ModelConfig>
}> = {
  // OpenRouter服务商的模型
  openrouter: {
    // 付费模型
    paid: {
      "gpt-5.2-chat": {
        modelName: "openai/gpt-5.2-chat",
        provider: "openai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "OpenAI 5.2 系列的快速轻量级成员 (Instant)，针对低延迟对话优化，具备自适应推理能力，在保持强大通用智能的同时更加温暖和人性化",
        isRecommended: true,
        isFree: false,
        shortName: "GPT-5.2",
        modelSeries: "gpt"
      },
      "gemini-3-pro-preview": {
        modelName: "google/gemini-3-pro-preview",
        provider: "google",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "Google 旗舰前沿模型，具备高精度多模态推理能力，拥有 1M token 上下文，在代理编码和复杂任务规划方面表现卓越",
        isRecommended: true,
        isFree: false,
        shortName: "Gemini 3 Pro",
        modelSeries: "gemini"
      },
      "glm-4.7": {
        modelName: "z-ai/glm-4.7",
        provider: "z-ai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "Z.AI 最新旗舰模型，针对编程与复杂任务规划优化，多步推理更稳定。在保持自然对话的同时，大幅提升了 Agent 智能体的执行能力与前端交互美学",
        isRecommended: false,
        isFree: false,
        shortName: "GLM 4.7",
        modelSeries: "glm"
      },
      "glm-4.6": {
        modelName: "z-ai/glm-4.6",
        provider: "z-ai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "GLM 新一代模型，上下文扩展至 200K，在编码性能、逻辑推理和 Agent 智能体能力上有显著提升",
        isRecommended: false,
        isFree: false,
        shortName: "GLM 4.6",
        modelSeries: "glm"
      },
      "gemini-2.5-pro": {
        modelName: "google/gemini-2.5-pro",
        provider: "google",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "Google 的 Gemini 2.5 Pro，针对高级推理、编码、数学与科学任务优化，具备精细的上下文理解与思维模式，适合高要求生产级场景",
        isRecommended: false,
        isFree: false,
        shortName: "Gemini 2.5 Pro",
        modelSeries: "gemini"
      },
      "claude-sonnet-4.5": {
        modelName: "anthropic/claude-sonnet-4.5",
        provider: "anthropic",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "Anthropic 的 Claude Sonnet 4.5，面向真实生产工作流与编码任务优化，强调工具编排、长上下文与稳健推理，适合工程、研究与企业级场景",
        isRecommended: false,
        isFree: false,
        shortName: "Claude Sonnet 4.5",
        modelSeries: "claude"
      },
      "kimi-k2-thinking": {
        modelName: "moonshotai/kimi-k2-thinking",
        provider: "moonshotai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "Moonshot AI 的 Kimi K2 Thinking，面向 agentic、长程推理与工具使用的生产级模型，支持超长上下文与稳定的分步推理能力",
        isRecommended: false,
        isFree: false,
        shortName: "Kimi K2 Thinking",
        modelSeries: "kimi"
      },
      "minimax-m2.1": {
        modelName: "minimax/minimax-m2.1",
        provider: "minimax",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "MiniMax 专为编码与 Agent 工作流优化的轻量级 SOTA 模型。以 10B 激活参数实现性能飞跃，兼顾低延迟与高扩展性，在多语言编程任务中表现卓越",
        isRecommended: false,
        isFree: false,
        shortName: "MiniMax M2.1",
        modelSeries: "minimax"
      },
      "deepseek-v3.2": {
        modelName: "deepseek/deepseek-v3.2",
        provider: "deepseek",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: GENERAL_PAID_MODEL_MAX_DOC_OUTPUT,
        description: "DeepSeek 新一代高效能推理模型，融合 DSA 稀疏注意力机制。具备 GPT-5 级性能与金牌级数学/编程能力，针对 Agent 工具调用深度优化",
        isRecommended: false,
        isFree: false,
        shortName: "DeepSeek V3.2",
        modelSeries: "deepseek"
      },
    },
    // 免费模型
    free: {
      "glm-4.5-air-free": {
        modelName: "z-ai/glm-4.5-air:free",
        provider: "z-ai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT,
        description: "GLM-4.5 Air 的轻量免费版本，采用MoE与混合推理模式，支持思维链推理开关，适合实时交互与工具使用",
        isRecommended: false,
        isFree: true,
        shortName: "GLM 4.5 Air",
        modelSeries: "glm"
      },
      "qwen3-235b-a22b-free": {
        modelName: "qwen/qwen3-235b-a22b:free",
        provider: "qwen",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT,
        description: "Qwen3-235B A22B 免费版，MoE 架构；支持思维/非思维模式切换，原生 32K 上下文，YaRN 可扩展至更长窗口；在复杂推理、数学与代码任务上表现稳健，并具备多语种与工具调用能力",
        isRecommended: false,
        isFree: true,
        shortName: "Qwen3 235B A22B",
        modelSeries: "qwen"
      },
      "deepseek-r1t2-chimera-free": {
        modelName: "tngtech/deepseek-r1t2-chimera:free",
        provider: "tngtech",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT,
        description: "TNG DeepSeek R1T2 Chimera 免费模型，基于 R1-0528、R1 与 V3-0324 的 Assembly-of-Experts 融合；在保证性价比的同时提供稳定的长上下文与稳健推理能力，适合长文本对话与通用生成",
        isRecommended: false,
        isFree: true,
        shortName: "R1T2 Chimera",
        modelSeries: "deepseek"
      },
      "gpt-oss-20b-free": {
        modelName: "openai/gpt-oss-20b:free",
        provider: "openai",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.5,
        maxTokens: FREE_MODEL_BASELINE_MAX_OUTPUT,
        description: "OpenAI 开源 21B 参数 MoE 模型（Harmony 响应格式），优化面向低延迟与易部署，支持函数调用、工具使用与结构化输出，适合通用对话与轻量推理",
        isRecommended: true,
        isFree: true,
        shortName: "GPT-OSS 20B",
        modelSeries: "gpt"
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
export const DEFAULT_MODEL_ID = "gpt-oss-20b-free";

// 导出ModelConfig接口以便其他模块使用
export type { ModelConfig }; 