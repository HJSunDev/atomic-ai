import { create } from "zustand";

// 定义AI上下文的接口
export interface AiContext {
  /**
   * 每个上下文实例的唯一标识
   * 
   * @example
   * // 对于页面级单例组件，使用固定的、可读的字符串ID。
   * 'home-module'
   * 
   * @example
   * // 对于可被多次实例化的组件 (如文档、对话框)，需在每次实例化时生成唯一ID。
   * // 最好与关联数据绑定
   * // 若无关联数据，使用生成的随机ID
   */
  id: string; 
  
  /**
   * 上下文的类型，用于区分不同的业务场景。
   * 这是未来AI助手根据不同场景提供不同功能的基础。
   * @example 'home', 'document', 'prompt-studio'
   */
  type: string; 
  
  /**
   * 决定在此上下文中，AI助手唤醒器（Catalyst）是否可用。
   * 注意：此字段仅控制唤醒器的显示，不影响AI面板的显示。
   * AI面板的显示完全由 useAiPanelStore 控制。
   */
  showCatalyst: boolean; 
  
  /**
   * 定义AI助手唤醒器的渲染位置。
   * - 'global': 在全局固定位置 (通常由 GlobalCatalyst 组件渲染)。
   * - 'local': 在当前上下文关联的组件内部渲染。
   * - 'none': 不显示任何唤醒器。
   */
  catalystPlacement: 'global' | 'local' | 'none';
  
  /**
   * [可选] 定义局部唤醒器被点击时的自定义行为。
   * 如果提供了此函数，`LocalCatalyst` 将执行它，而不是默认的打开AI面板行为。
   * 这允许每个模块根据自身需求，为唤醒器注入特定的交互逻辑，例如页面跳转、模式切换等。
   */
  onCatalystClick?: () => void;

  /**
   * [未来扩展] 针对此上下文的AI助手特定配置。
   * 可用于存储场景化的初始提示、可用工具集等。
   */
  metadata?: Record<string, any>; 
}

// 定义AI上下文Store的状态类型
interface AiContextState {
  // 上下文栈
  contextStack: AiContext[];
  
  // --- Actions ---
  /**
   * 压入一个新的上下文到栈顶。
   * 此操作会确保ID的唯一性：如果栈中已存在相同ID的上下文，会先移除旧的，再推入新的。
   * 这能有效防止因组件重渲染等原因导致的重复上下文。
   * @param context 要压入的上下文对象
   */
  pushContext: (context: AiContext) => void;
  
  /**
   * 根据唯一的上下文ID，从栈中精确地弹出一个指定的上下文。
   * @param id 要弹出的上下文ID
   */
  popContext: (id: string) => void;
  
  // --- Selectors (Getters) ---
  /**
   * 获取当前激活的上下文，即栈顶的元素。
   * @returns 如果栈非空，返回栈顶的AiContext对象；否则返回null。
   */
  getActiveContext: () => AiContext | null;
}

// 创建AI上下文的Zustand Store
export const useAiContextStore = create<AiContextState>()((set, get) => ({
  // 初始化上下文栈为空数组
  contextStack: [],

  // 压入一个新的上下文到栈顶
  pushContext: (context) =>
    set((state) => ({
      // 为了确保id的唯一性，如果已存在相同id的上下文，先将其移除
      contextStack: [...state.contextStack.filter(c => c.id !== context.id), context],
    })),

  // 根据id从栈中弹出上下文
  popContext: (id) =>
    set((state) => ({
      contextStack: state.contextStack.filter((context) => context.id !== id),
    })),

  // 获取当前激活的上下文（栈顶元素）
  getActiveContext: () => {
    const stack = get().contextStack;
    if (stack.length === 0) return null;

    // 为了让局部模块（如对话框/抽屉等）在与路由/全局模块并存时具备更高优先级，
    // 这里优先选择“最近入栈”的局部唤醒器上下文（catalystPlacement === 'local'）。
    // 这样可以规避不同组件的 useEffect 执行时序差异所带来的栈顺序不确定性，
    // 确保本地 UI（如 Document 的局部唤醒器）在可见时始终拥有优先控制权。
    for (let i = stack.length - 1; i >= 0; i--) {
      const candidate = stack[i];
      if (candidate.catalystPlacement === 'local' && candidate.showCatalyst) {
        return candidate;
      }
    }

    // 若不存在局部唤醒器上下文，则回退到栈顶元素
    return stack[stack.length - 1];
  },
}));
