import { create } from 'zustand';

/**
 * 文档查看器全局状态管理
 * 
 * 负责管理文档查看器的显示状态、模式切换和内容草稿。
 * 支持三种显示模式：侧边抽屉(drawer)、居中模态(modal)、全屏页面(fullscreen)
 * 
 * 核心功能：
 * - 统一的文档打开和模式切换API
 * - 自动处理不同模式间的路由跳转
 * - 本地存储显示模式偏好
 * - 草稿内容的临时编辑（不涉及持久化）
 */

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
  // ===========================================
  // 状态数据
  // ===========================================
  
  // UI 状态
  isOpen: boolean;
  displayMode: DocumentDisplayMode;

  // 文档数据（仅用于显示，不提供内容操作方法）
  draft: PromptDocumentDraft;

  // ===========================================
  // 公共 API 方法（供外部组件调用）
  // ===========================================
  
  // 统一的文档打开入口，根据当前显示模式智能选择打开方式
  openDocument: (config?: DocumentOpenConfig & { 
    onNavigateToFullscreen?: () => void;
  }) => void;
  
  // 统一的模式切换入口，处理不同模式之间的切换逻辑和路由跳转
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: () => void;
  }) => void;
  
  // 关闭文档查看器
  close: () => void;
  
  // 更新文档草稿内容
  setDraft: (patch: Partial<PromptDocumentDraft>) => void;

  // ===========================================
  // 内部工具方法（主要供内部其他方法调用）
  // ===========================================
  
  // 基础打开方法，设置状态和初始数据（仅供内部方法调用）
  _open: (config?: DocumentOpenConfig) => void;
  
  // 内部状态更新方法，更新显示模式并持久化（仅供内部方法调用）
  _setDisplayMode: (mode: DocumentDisplayMode) => void;
}

// 默认草稿（文档内容）
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
  // ===========================================
  // 初始状态
  // ===========================================
  isOpen: false,
  displayMode: getInitialDisplayMode(),
  draft: { ...defaultDraft },

  // ===========================================
  // 公共 API 方法（供外部组件调用）
  // ===========================================

  // 统一的文档打开入口，根据当前显示模式智能选择打开方式
  openDocument: (config) => {
    const { displayMode, _open } = get();
    const { onNavigateToFullscreen, ...openConfig } = config || {};
    
    if (displayMode === 'fullscreen') {
      // 全屏模式：通过回调进行路由跳转
      if (onNavigateToFullscreen) {
        onNavigateToFullscreen();
      }
    } else {
      // 抽屉/模态模式：直接打开
      _open(openConfig);
    }
  },

  // 统一的模式切换入口，处理不同模式之间的切换逻辑和路由跳转
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: () => void;
  }) => {
    const { displayMode, _setDisplayMode, _open } = get();
    const { onNavigateToHome, onNavigateToFullscreen } = callbacks || {};

    if (targetMode === displayMode) {
      // 已经是目标模式，无需切换
      return;
    }

    if (targetMode === 'fullscreen') {
      // 切换到全屏模式：通过回调进行路由跳转
      if (onNavigateToFullscreen) {
        onNavigateToFullscreen();
      }
    } else if (displayMode === 'fullscreen') {
      // 从全屏模式切换到其他模式：需要路由跳转 + 重新打开
      _setDisplayMode(targetMode);
      if (onNavigateToHome) {
        onNavigateToHome();
        // 延迟打开以确保页面已加载
        setTimeout(() => _open(), 100);
      }
    } else {
      // 在抽屉和模态之间切换：直接更新显示模式
      _setDisplayMode(targetMode);
    }
  },

  // 关闭文档查看器，重置状态和草稿内容
  close: () => {
    set({
      isOpen: false,
      draft: { ...defaultDraft },
    });
  },



  // 更新文档草稿内容，仅用于本地编辑，不涉及持久化保存
  setDraft: (patch) => {
    const { draft } = get();
    const newDraft = { ...draft, ...patch };
    set({ draft: newDraft });
  },

  // ===========================================
  // 内部工具方法（主要供内部其他方法调用）
  // ===========================================

  // 基础打开方法：设置打开状态和初始数据（仅供内部方法调用）
  _open: (config) => {
    // 获取初始数据（如未传递则为空对象）
    const initialData = config?.initialData || {};
    // 合并默认草稿和初始数据，生成新的草稿内容
    const newDraft = { ...defaultDraft, ...initialData };

    // 设置查看器为打开状态，并更新草稿内容
    set({
      isOpen: true,
      draft: newDraft,
    });
  },

  // 内部状态更新方法：更新显示模式并持久化（仅供内部方法调用）
  _setDisplayMode: (mode: DocumentDisplayMode) => {
    set({ displayMode: mode });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('documentDisplayMode', mode);
    }
  },
}));
