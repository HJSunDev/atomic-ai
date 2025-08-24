import { create } from 'zustand';

// 面板支持的实体类型（后续可扩展）
export type PanelEntityType = 'module' | 'artifact' | null;

// 面板模式：新建/编辑/预览
export type PanelMode = 'create' | 'edit' | 'preview' | null;

// 显示模式：右侧抽屉 / 居中模态 / 全屏
export type PanelDisplayMode = 'drawer' | 'modal' | 'fullscreen';

export interface PanelOpenConfig<T = unknown> {
  type: PanelEntityType;
  mode: PanelMode;
  initialData?: T;
  onSave?: (data: T) => void;
  onCancel?: () => void;
  displayMode?: PanelDisplayMode;
}

interface PanelState<T = unknown> {
  isOpen: boolean;
  type: PanelEntityType;
  mode: PanelMode;
  initialData?: T;
  onSave?: (data: T) => void;
  onCancel?: () => void;
  open: (config: PanelOpenConfig<T>) => void;
  close: () => void;
  displayMode: PanelDisplayMode;
  setDisplayMode: (mode: PanelDisplayMode) => void;
  toggleDisplayMode: () => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  isOpen: false,
  type: null,
  mode: null,
  initialData: undefined,
  onSave: undefined,
  onCancel: undefined,
  displayMode: 'drawer',
  open: (config) => set({
    isOpen: true,
    type: config.type,
    mode: config.mode,
    initialData: config.initialData,
    onSave: config.onSave,
    onCancel: config.onCancel,
    displayMode: config.displayMode ?? 'drawer',
  }),
  close: () => set({
    isOpen: false,
    type: null,
    mode: null,
    initialData: undefined,
    onSave: undefined,
    onCancel: undefined,
    displayMode: 'drawer',
  }),
  setDisplayMode: (mode) => set({ displayMode: mode }),
  toggleDisplayMode: () => set((state) => {
    const order: PanelDisplayMode[] = ['drawer', 'modal', 'fullscreen'];
    const idx = order.indexOf(state.displayMode);
    const next = order[(idx + 1) % order.length];
    return { displayMode: next } as Partial<PanelState>;
  }),
}));


