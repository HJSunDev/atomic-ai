/**
 * 环境变量工具方法集合
 * - 提供必需环境变量的统一读取与校验
 * - 单一职责：仅负责环境变量的获取与验证
 */

/**
 * 读取必需的环境变量，如果缺失则抛出明确错误。
 * @param name 环境变量名
 * @returns 环境变量的非空字符串值
 */
export function getRequiredEnvVar(name: string): string {
  // 读取环境变量值
  const rawValue = process.env[name];
  // 校验非空
  if (!rawValue || rawValue.trim().length === 0) {
    // 抛出明确错误，指导如何配置
    throw new Error(`缺少必需的环境变量: ${name}。请在本地 .env.local 或部署平台的环境变量面板中设置 ${name}`);
  }
  // 返回去除首尾空格后的值
  return rawValue.trim();
}

/**
 * 获取 Tavily API Key（从环境变量中读取）。
 * 统一使用变量名：TAVILY_API_KEY。
 * @returns Tavily API Key 字符串
 */
export function getTavilyApiKey(): string {
  // 使用公共的必需环境变量读取函数
  return getRequiredEnvVar("TAVILY_API_KEY");
}


