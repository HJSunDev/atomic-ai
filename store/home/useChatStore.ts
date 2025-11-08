import { create } from "zustand";
import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_MODEL_ID } from "@/convex/_lib/models";
import { persist, createJSONStorage } from "zustand/middleware";
import { createEncryptionStorage } from "../storage/encryptionStorage";

/**
 * 聊天模块的状态管理
 *
 * 用于处理跨组件的UI状态，例如当前选中的会话、使用的AI模型等。
 * 这个Store是客户端状态，与Convex中的持久化数据分离，但会驱动Convex的查询。
 */

// 定义Store的状态和操作的接口
interface ChatStoreState {
  // 当前选中的会话ID。如果为null，表示正在开始一个新会话。
  currentConversationId: Id<"conversations"> | null;
  // 当前选择用于发送消息的AI模型。
  selectedModel: string;
  // 用户自定义的API密钥（用于付费模型）。如果为null，表示未设置。
  userApiKey: string | null;

  // --- 操作 ---
  /**
   * 切换到指定的会话。
   * @param id - conversations表的文档ID
   */
  selectConversation: (id: Id<"conversations">) => void;
  /**
   * 开始一个新的会话。
   * 这会将当前会话ID重置为null，UI组件可以根据这个状态来展示新聊天的界面。
   */
  startNewConversation: () => void;
  /**
   * 设置要使用的AI模型。
   * @param model -模型的标识符字符串
   */
  setSelectedModel: (model: string) => void;
  /**
   * 设置用户自定义的API密钥。
   * @param key - API密钥字符串，如果传入null则清除已保存的密钥
   */
  setUserApiKey: (key: string | null) => void;
}

// 创建Zustand Store（仅对 userApiKey 做本地持久化）
export const useChatStore = create<ChatStoreState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentConversationId: null,
      // 默认使用在models.ts中定义的默认模型
      selectedModel: DEFAULT_MODEL_ID,
      // 用户API密钥初始为null
      userApiKey: null,

      // 实现操作
      selectConversation: (id) => set({ currentConversationId: id }),

      startNewConversation: () => set({ currentConversationId: null }),

      setSelectedModel: (model) => set({ selectedModel: model }),

      setUserApiKey: (key) => set({ userApiKey: key }),
    }),
    {
      name: "aa.userApiKey",
      // 使用通用的加密存储工厂函数，并指定只加密`userApiKey`字段
      storage: createJSONStorage(() =>
        createEncryptionStorage({
          keysToEncrypt: ["userApiKey"],
        })
      ),
      // 仅持久化 userApiKey 字段，避免污染其他UI状态
      partialize: (state) =>
        ({ userApiKey: state.userApiKey } as Partial<ChatStoreState>),
      version: 1,
    }
  )
); 