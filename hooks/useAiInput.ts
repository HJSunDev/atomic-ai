import { useAiContextStore } from "@/store/home/use-ai-context-store";

/**
 * 场景侧使用的 Hook：用于控制 AI 聊天输入框
 * 允许场景组件向聊天输入框发送内容
 */
export function useAiInput() {
  const controls = useAiContextStore(s => s.inputControls);
  
  return {
    /**
     * 将文本追加到聊天输入框末尾，并自动聚焦
     * @param text 要插入的文本
     */
    insertToChat: (text: string) => {
      if (controls) {
        controls.focus();
        controls.append(text);
      } else {
        // 面板未打开时的处理策略：目前仅打印警告
        // 未来可以集成“自动打开面板”的逻辑
        console.warn("AI Chat Panel is not active. Cannot insert text.");
      }
    },

    /**
     * 替换聊天输入框的内容
     * @param text 新的文本内容
     */
    replaceChatInput: (text: string) => {
      if (controls) {
        controls.focus();
        controls.replace(text);
      }
    },

    /**
     * 聚焦聊天输入框
     */
    focusChatInput: () => {
      controls?.focus();
    },

    /**
     * 输入框是否可用
     */
    isReady: !!controls
  };
}
