import { StateStorage } from "zustand/middleware";
import { useAuthStore } from "../auth/useAuthStore";
import { decrypt, encrypt } from "@/lib/encryption";

interface EncryptionStorageOptions {
  /**
   * 一个字符串数组，其中包含需要加密的状态字段的名称。
   */
  keysToEncrypt: string[];
}

/**
 * 创建一个通用的、可配置的Zustand加密存储中间件。
 *
 * 这个高阶函数返回一个符合Zustand `StateStorage`接口的对象，
 * 它可以根据传入的`keysToEncrypt`选项来加密和解密指定的多个状态字段。
 *
 * @param options - 配置对象，包含一个`keysToEncrypt`数组。
 * @returns 返回一个为Zustand `persist`中间件定制的`StateStorage`对象。
 */
export function createEncryptionStorage(
  options: EncryptionStorageOptions
): StateStorage {
  const { keysToEncrypt } = options;

  return {
    /**
     * 从存储中获取并解密项。
     */
    getItem: (name: string): string | null => {
      const secretKey = useAuthStore.getState().userId;
      const storedValue = localStorage.getItem(name);

      if (!storedValue) {
        return null;
      }

      try {
        const state = JSON.parse(storedValue);

        for (const key of keysToEncrypt) {
          const value = state.state?.[key];
          if (value && typeof value === "string") {
            // 如果没有密钥（用户未登录），则清除潜在的敏感信息，防止密文泄露。
            // 如果有密钥，则尝试解密。
            state.state[key] = secretKey ? decrypt(value, secretKey) : null;
          }
        }
        return JSON.stringify(state);
      } catch (error) {
        console.error("从localStorage获取或解密状态失败:", error);
        return storedValue; // 在出错时返回原始值，让Zustand处理
      }
    },

    /**
     * 加密并向存储中设置项。
     */
    setItem: (name: string, value: string): void => {
      const secretKey = useAuthStore.getState().userId;

      try {
        const state = JSON.parse(value);

        for (const key of keysToEncrypt) {
          const dataToProcess = state.state?.[key];
          if (dataToProcess && typeof dataToProcess === "string") {
            // 如果没有密钥（用户未登录），则不存储敏感信息。
            // 如果有密钥，则加密数据。
            state.state[key] = secretKey
              ? encrypt(dataToProcess, secretKey)
              : null;
          }
        }
        localStorage.setItem(name, JSON.stringify(state));
      } catch (error) {
        console.error("加密并设置状态到localStorage失败:", error);
        // 如果发生错误，则存储原始值以避免数据丢失
        localStorage.setItem(name, value);
      }
    },

    /**
     * 从存储中移除项。
     */
    removeItem: (name: string): void => {
      localStorage.removeItem(name);
    },
  };
}
