/**
 * 模型图标工具函数
 * 根据模型系列获取对应的图标路径
 */

// 定义模型系列到图标文件的映射关系
const MODEL_SERIES_ICON_MAP: Record<string, string> = {
  gpt: '/icons/gpt-icon.png',
  claude: '/icons/claude-icon.png', 
  deepseek: '/icons/deepseek-icon.jpg',
  glm: '/icons/glm-icon.png',
  qwen: '/icons/qwen-icon.jpeg',
  groq: '/icons/groq-icon.jpeg',
  gemini: '/icons/gemini-icon.png',
  kimi: '/icons/kimi-icon.jpeg',
};

/**
 * 根据模型系列获取对应的图标路径
 * @param modelSeries 模型系列标识符（如 "gpt", "claude", "deepseek" 等）
 * @returns 图标文件路径，如果找不到对应图标则返回默认图标
 */
export function getModelIcon(modelSeries: string): string {
  return MODEL_SERIES_ICON_MAP[modelSeries] || '/icons/default-model-icon.png';
}

