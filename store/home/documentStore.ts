import { create } from 'zustand';

// 提示词文档草稿类型
export interface PromptDocumentDraft {
  title: string;
  description: string;
  content: string;
}

// 文档支持的实体类型
export type DocumentEntityType = 'module' | 'artifact' | null;

// 文档模式：新建/编辑/预览
export type DocumentMode = 'create' | 'edit' | 'preview' | null;

// 显示模式：右侧抽屉 / 居中模态 / 全屏
export type DocumentDisplayMode = 'drawer' | 'modal' | 'fullscreen';

// 文档开启配置
export interface DocumentOpenConfig {
  type: DocumentEntityType;
  mode: DocumentMode;
  initialData?: Partial<PromptDocumentDraft>;
  onSave?: (data: PromptDocumentDraft) => void;
  onCancel?: () => void;
  displayMode?: DocumentDisplayMode;
}

interface DocumentState {
  // UI 状态
  isOpen: boolean;
  type: DocumentEntityType;
  mode: DocumentMode;
  displayMode: DocumentDisplayMode;
  
  // 草稿数据
  draft: PromptDocumentDraft;
  initialDraft: PromptDocumentDraft;
  dirty: boolean;
  
  // 回调函数
  onSave?: (data: PromptDocumentDraft) => void;
  onCancel?: () => void;
  
  // 计算属性
  isReadonly: boolean;
  
  // 操作方法
  open: (config: DocumentOpenConfig) => void;
  close: () => void;
  setDisplayMode: (mode: DocumentDisplayMode) => void;
  toggleDisplayMode: () => void;
  setDraft: (patch: Partial<PromptDocumentDraft>) => void;
  resetDraft: (initial?: Partial<PromptDocumentDraft>) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

// 默认草稿
const defaultDraft: PromptDocumentDraft = {
  title: '',
  description: '',
  content: '',
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // 初始状态
  isOpen: false,
  type: null,
  mode: null,
  displayMode: 'drawer',
  draft: { ...defaultDraft },
  initialDraft: { ...defaultDraft },
  dirty: false,
  onSave: undefined,
  onCancel: undefined,
  
  // 计算属性
  get isReadonly() {
    return get().mode === 'preview';
  },
  
  // 打开编辑器
  open: (config) => {
    const initialData = config.initialData || {};
    const newDraft = { ...defaultDraft, ...initialData };
    
    set({
      isOpen: true,
      type: config.type,
      mode: config.mode,
      displayMode: config.displayMode || 'drawer',
      draft: newDraft,
      initialDraft: { ...newDraft },
      dirty: false,
      onSave: config.onSave,
      onCancel: config.onCancel,
    });
  },
  
  // 关闭编辑器
  close: () => {
    set({
      isOpen: false,
      type: null,
      mode: null,
      displayMode: 'drawer',
      draft: { ...defaultDraft },
      initialDraft: { ...defaultDraft },
      dirty: false,
      onSave: undefined,
      onCancel: undefined,
    });
  },
  
  // 设置显示模式
  setDisplayMode: (mode) => {
    set({ displayMode: mode });
  },
  
  // 切换显示模式
  toggleDisplayMode: () => {
    const { displayMode } = get();
    const order: DocumentDisplayMode[] = ['drawer', 'modal', 'fullscreen'];
    const idx = order.indexOf(displayMode);
    const next = order[(idx + 1) % order.length];
    set({ displayMode: next });
  },
  
  // 更新草稿
  setDraft: (patch) => {
    const { draft, initialDraft } = get();
    const newDraft = { ...draft, ...patch };
    
    // 计算是否有变更
    const isDirty = JSON.stringify(newDraft) !== JSON.stringify(initialDraft);
    
    set({
      draft: newDraft,
      dirty: isDirty,
    });
  },
  
  // 重置草稿
  resetDraft: (initial) => {
    const newDraft = { ...defaultDraft, ...initial };
    set({
      draft: newDraft,
      initialDraft: { ...newDraft },
      dirty: false,
    });
  },
  
  // 处理保存
  handleSave: () => {
    const { draft, onSave, isReadonly } = get();
    if (isReadonly || !onSave) return;
    
    onSave(draft);
    get().close();
  },
  
  // 处理取消
  handleCancel: () => {
    const { onCancel, dirty } = get();
    
    // 如果有未保存的更改，可以在这里添加确认逻辑
    if (dirty) {
      const shouldDiscard = window.confirm('有未保存的更改，确定要关闭吗？');
      if (!shouldDiscard) return;
    }
    
    if (onCancel) onCancel();
    get().close();
  },
}));
