import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * AI面板的工作模式
 * 
 * - 'chat': 多轮对话模式
 *   用户可以进行连续的对话，可选择性地使用外部提示词作为起点。
 *   适合通用的AI助手交互场景。
 * 
 * - 'context': 场景化交互模式  
 *   基于当前激活的上下文（来自 useAiContextStore）提供场景化的AI能力。
 *   面板会根据上下文类型动态调整交互方式和可用功能。
 *   适合与特定业务场景深度集成的AI交互。
 */
export type AiPanelMode = 'chat' | 'context';

interface AiPanelState {
  showAiPanel: boolean;
  panelMode: AiPanelMode;
  
  toggleAiPanel: () => void;
  setAiPanelVisibility: (isVisible: boolean) => void;
  
  /**
   * 切换面板的工作模式
   * @param mode - 要切换到的模式
   */
  setPanelMode: (mode: AiPanelMode) => void;
  
  /**
   * 同时设置面板的显示状态和工作模式
   * 在某些场景下需要一次性完成两个操作，避免中间状态
   * @param isVisible - 是否显示面板
   * @param mode - 工作模式
   */
  openPanelWithMode: (isVisible: boolean, mode: AiPanelMode) => void;
}

// 创建带有本地存储持久化的状态管理
export const useAiPanelStore = create<AiPanelState>()(
  persist(
    (set) => ({
      // 默认显示AI面板
      showAiPanel: true,
      panelMode: 'chat',
      
      toggleAiPanel: () => set((state) => ({ showAiPanel: !state.showAiPanel })),
      
      setAiPanelVisibility: (isVisible: boolean) => set({ showAiPanel: isVisible }),
      
      setPanelMode: (mode: AiPanelMode) => set({ panelMode: mode }),
      
      openPanelWithMode: (isVisible: boolean, mode: AiPanelMode) => 
        set({ showAiPanel: isVisible, panelMode: mode }),
    }),
    // 持久化配置
    {
      name: "ai-panel-storage",
      partialize: (state) => ({ 
        showAiPanel: state.showAiPanel,
        panelMode: state.panelMode 
      }),
    }
  )
); 