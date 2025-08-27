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
}));
