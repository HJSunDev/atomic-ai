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
 * 等待 AuthStore 完成初始化（_hasHydrated 变为 true）。
 * 如果已经完成，立即 resolve；否则订阅状态变化并等待。
 */
async function waitForAuthHydration(): Promise<void> {
  if (useAuthStore.getState()._hasHydrated) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state._hasHydrated) {
        resolve();
        unsubscribe();
      }
    });
  });
}

/**
 * 创建一个通用的、可配置的Zustand加密存储中间件。
 *
 * 这个高阶函数返回一个符合Zustand `StateStorage`接口的对象（支持异步操作），
 * 它可以根据传入的`keysToEncrypt`选项来加密和解密指定的多个状态字段。
 * 在执行加解密操作前，会自动等待 AuthStore 准备就绪，确保密钥可用。
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
     * 从存储中获取并解密项（异步）。
     * 在解密前会等待 AuthStore 准备就绪，确保密钥可用。
     * 如果没有密钥（未登录），则跳过解密，保持密文原样。
     */
    getItem: async (name: string): Promise<string | null> => {
      await waitForAuthHydration();

      const secretKey = useAuthStore.getState().userId;
      const storedValue = localStorage.getItem(name);

      if (!storedValue) {
        return null;
      }

      if (!secretKey) {
        return storedValue;
      }

      try {
        const state = JSON.parse(storedValue);

        for (const key of keysToEncrypt) {
          const value = state.state?.[key];
          if (value && typeof value === "string") {
            state.state[key] = decrypt(value, secretKey);
          }
        }
        return JSON.stringify(state);
      } catch (error) {
        console.error("从localStorage获取或解密状态失败:", error);
        return storedValue;
      }
    },

    /**
     * 加密并向存储中设置项（异步）。
     * 如果没有密钥（未登录），则不写入敏感字段，避免覆盖已存在的密文。
     */
    setItem: async (name: string, value: string): Promise<void> => {
      const secretKey = useAuthStore.getState().userId;

      if (!secretKey) {
        return;
      }

      try {
        const state = JSON.parse(value);

        for (const key of keysToEncrypt) {
          const dataToProcess = state.state?.[key];
          if (dataToProcess && typeof dataToProcess === "string") {
            state.state[key] = encrypt(dataToProcess, secretKey);
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
     * 从存储中移除项（异步）。
     */
    removeItem: async (name: string): Promise<void> => {
      localStorage.removeItem(name);
    },
  };
}
