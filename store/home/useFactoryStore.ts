import { create } from 'zustand';

interface FactoryStore {
  // 待处理的初始提示词（从意图识别跳转过来时使用）
  pendingPrompt: string | null;
  // 设置待处理提示词
  setPendingPrompt: (prompt: string | null) => void;
}

/**
 * Factory 模块全局状态 Store
 * 用于处理跨页面状态传递（如从统一入口跳转到工坊详情页时的提示词传递）
 */
export const useFactoryStore = create<FactoryStore>((set) => ({
  pendingPrompt: null,
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
}));

