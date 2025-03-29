import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义AI面板状态类型
interface AiPanelState {
  // 是否显示AI面板
  showAiPanel: boolean;
  // 切换AI面板显示状态
  toggleAiPanel: () => void;
  // 设置AI面板显示状态
  setAiPanelVisibility: (isVisible: boolean) => void;
}

// 创建带有本地存储持久化的状态管理
export const useAiPanelStore = create<AiPanelState>()(
  persist(
    (set) => ({
      // 默认显示AI面板
      showAiPanel: true,
      // 切换显示状态
      toggleAiPanel: () => set((state) => ({ showAiPanel: !state.showAiPanel })),
      // 直接设置显示状态
      setAiPanelVisibility: (isVisible: boolean) => set({ showAiPanel: isVisible }),
    }),
    {
      // 持久化配置
      name: "ai-panel-storage",
      // 只持久化showAiPanel字段
      partialize: (state) => ({ showAiPanel: state.showAiPanel }),
    }
  )
); 