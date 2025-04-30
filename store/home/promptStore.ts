import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 提示词模块的数据接口
export interface PromptModule {
  id: string;
  title: string;
  content: string;
  color: string;
  children: PromptModule[];
}

// 定义 store 的状态和操作
interface PromptStore {
  // 当前选择的提示词模块
  selectedPrompt: PromptModule | null;
  // 设置当前选择的提示词模块
  setSelectedPrompt: (prompt: PromptModule | null) => void;
  // 清空当前选择的提示词模块
  clearSelectedPrompt: () => void;
}

// 创建 store 并添加持久化
export const usePromptStore = create<PromptStore>()(
  persist(
    (set) => ({
      // 初始状态
      selectedPrompt: null,
      
      // 设置当前选择的提示词模块
      setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),
      
      // 清空当前选择的提示词模块
      clearSelectedPrompt: () => set({ selectedPrompt: null }),
    }),
    {
      name: 'prompt-storage', // localStorage 的 key
      partialize: (state) => ({ selectedPrompt: state.selectedPrompt }), // 只持久化 selectedPrompt
    }
  )
); 