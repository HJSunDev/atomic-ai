import packageJson from "../package.json";

/**
 * 获取应用版本号
 * 从 package.json 读取版本信息，自动同步
 */
export function getAppVersion(): string {
  return packageJson.version;
}

/**
 * 格式化版本号显示
 * 将 "2.0.0" 格式化为 "2.0"
 */
export function formatVersion(version?: string): string {
  const v = version || getAppVersion();
  const parts = v.split(".");
  return `${parts[0]}.${parts[1]}`;
}

