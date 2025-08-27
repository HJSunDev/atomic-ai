import { create } from 'zustand';

// 文档内容草稿类型
export interface PromptDocumentDraft {
  title: string;
  description: string;
  content: string;
}

// 显示模式：右侧抽屉 / 居中模态 / 全屏
export type DocumentDisplayMode = 'drawer' | 'modal' | 'fullscreen';

// 打开配置
export interface DocumentOpenConfig {
  initialData?: Partial<PromptDocumentDraft>;
}

interface DocumentState {
  // UI 状态
  isOpen: boolean;
  displayMode: DocumentDisplayMode;

  // 文档数据（仅用于显示，不提供内容操作方法）
  draft: PromptDocumentDraft;

  // 操作方法（仅与显示相关）
  open: (config?: DocumentOpenConfig) => void;
  close: () => void;
  setDisplayMode: (mode: DocumentDisplayMode) => void;
  toggleDisplayMode: () => void;
  setDraft: (patch: Partial<PromptDocumentDraft>) => void;
  
  // 统一的文档打开方法，处理不同显示模式下的打开逻辑
  openDocument: (config?: DocumentOpenConfig & { 
    onNavigateToFullscreen?: () => void;
  }) => void;
  
  // 统一的模式切换方法，处理不同模式之间的切换逻辑
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: () => void;
  }) => void;
}

// 默认草稿
const defaultDraft: PromptDocumentDraft = {
  title: '',
  description: '',
  content: '',
};

// 读取初始显示模式：从 localStorage 恢复，否则使用默认 drawer
const getInitialDisplayMode = (): DocumentDisplayMode => {
  if (typeof window === 'undefined') return 'drawer';
  const saved = window.localStorage.getItem('documentDisplayMode');
  if (saved === 'drawer' || saved === 'modal' || saved === 'fullscreen') {
    return saved;
  }
  return 'drawer';
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // 初始状态
  isOpen: false,
  displayMode: getInitialDisplayMode(),
  draft: { ...defaultDraft },

  // 打开查看器（仅设置显示模式与初始数据）
  open: (config) => {
    const initialData = config?.initialData || {};
    const newDraft = { ...defaultDraft, ...initialData };

    set({
      isOpen: true,
      draft: newDraft,
    });
  },

  // 关闭查看器
  close: () => {
    set({
      isOpen: false,
      draft: { ...defaultDraft },
    });
  },

  // 设置显示模式
  setDisplayMode: (mode) => {
    set({ displayMode: mode });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('documentDisplayMode', mode);
    }
  },

  // 切换显示模式
  toggleDisplayMode: () => {
    const { displayMode } = get();
    const order: DocumentDisplayMode[] = ['drawer', 'modal', 'fullscreen'];
    const idx = order.indexOf(displayMode);
    const next = order[(idx + 1) % order.length];
    set({ displayMode: next });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('documentDisplayMode', next);
    }
  },

  // 更新本地草稿，仅用于本地编辑，不涉及保存
  setDraft: (patch) => {
    const { draft } = get();
    const newDraft = { ...draft, ...patch };
    set({ draft: newDraft });
  },

  // 统一的文档打开方法，根据当前显示模式智能选择打开方式
  openDocument: (config) => {
    const { displayMode, open } = get();
    const { onNavigateToFullscreen, ...openConfig } = config || {};
    
    if (displayMode === 'fullscreen') {
      // 全屏模式：通过回调进行路由跳转
      if (onNavigateToFullscreen) {
        onNavigateToFullscreen();
      }
    } else {
      // 抽屉/模态模式：直接打开
      open(openConfig);
    }
  },

  // 统一的模式切换方法，处理不同模式之间的切换逻辑
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: () => void;
  }) => {
    const { displayMode, setDisplayMode, open } = get();
    const { onNavigateToHome, onNavigateToFullscreen } = callbacks || {};

    if (targetMode === displayMode) {
      // 已经是目标模式，无需切换
      return;
    }

    if (targetMode === 'fullscreen') {
      // 切换到全屏模式
      if (onNavigateToFullscreen) {
        onNavigateToFullscreen();
      }
    } else if (displayMode === 'fullscreen') {
      // 从全屏模式切换到其他模式
      setDisplayMode(targetMode);
      if (onNavigateToHome) {
        onNavigateToHome();
        // 延迟打开以确保页面已加载
        setTimeout(() => open(), 100);
      }
    } else {
      // 在抽屉和模态之间切换
      setDisplayMode(targetMode);
    }
  },
}));
