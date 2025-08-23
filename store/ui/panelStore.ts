import { create } from 'zustand';

// 面板支持的实体类型（后续可扩展）
export type PanelEntityType = 'module' | 'artifact' | null;

// 面板模式：新建/编辑/预览
export type PanelMode = 'create' | 'edit' | 'preview' | null;

export interface PanelOpenConfig<T = unknown> {
  type: PanelEntityType;
  mode: PanelMode;
  initialData?: T;
  onSave?: (data: T) => void;
  onCancel?: () => void;
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
}

export const usePanelStore = create<PanelState>((set) => ({
  isOpen: false,
  type: null,
  mode: null,
  initialData: undefined,
  onSave: undefined,
  onCancel: undefined,
  open: (config) => set({
    isOpen: true,
    type: config.type,
    mode: config.mode,
    initialData: config.initialData,
    onSave: config.onSave,
    onCancel: config.onCancel,
  }),
  close: () => set({
    isOpen: false,
    type: null,
    mode: null,
    initialData: undefined,
    onSave: undefined,
    onCancel: undefined,
  }),
}));


