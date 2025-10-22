import { create } from 'zustand';

/**
 * 文档查看器全局状态管理
 * 
 * 负责管理文档查看器的显示状态、模式切换和当前文档ID。
 * 支持三种显示模式：侧边抽屉(drawer)、居中模态(modal)、全屏页面(fullscreen)
 * 
 * 核心功能：
 * - 统一的文档打开和模式切换API
 * - 自动处理不同模式间的路由跳转
 * - 本地存储显示模式偏好
 * - 使用文档ID在各自组件中获取真实数据，避免在全局Store中保存草稿内容
 */

// 显示模式：右侧抽屉 / 居中模态 / 全屏
export type DocumentDisplayMode = 'drawer' | 'modal' | 'fullscreen';

// 打开配置：通过文档ID标识要查看的文档
export interface DocumentOpenConfig {
  documentId: string;
}

interface DocumentState {
  // ===========================================
  // 状态数据
  // ===========================================
  
  // UI 状态
  isOpen: boolean;
  displayMode: DocumentDisplayMode;

  // 当前正在查看的文档ID
  documentId: string | null;

  // ===========================================
  // 公共 API 方法（供外部组件调用）
  // ===========================================
  
  // 统一的文档打开入口，根据当前显示模式智能选择打开方式
  openDocument: (config: DocumentOpenConfig & { 
    onNavigateToFullscreen?: () => void;
  }) => void;
  
  // 统一的模式切换入口，处理不同模式之间的切换逻辑和路由跳转
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: () => void;
  }) => void;
  
  // 关闭文档查看器
  close: () => void;

  // ===========================================
  // 内部工具方法（主要供内部其他方法调用）
  // ===========================================
  
  // 基础打开方法：设置打开状态与当前文档ID（仅供内部方法调用）
  _open: (config: DocumentOpenConfig) => void;
  
  // 内部状态更新方法，更新显示模式并持久化（仅供内部方法调用）
  _setDisplayMode: (mode: DocumentDisplayMode) => void;
}

// 读取初始显示模式：从 localStorage 恢复，否则使用默认 modal
const getInitialDisplayMode = (): DocumentDisplayMode => {

  if (typeof window === 'undefined') return 'modal';

  const saved = window.localStorage.getItem('documentDisplayMode');

  if (saved === 'drawer' || saved === 'modal' || saved === 'fullscreen') {
    return saved;
  }

  return 'modal';
};

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // ===========================================
  // 初始状态
  // ===========================================
  isOpen: false,
  displayMode: getInitialDisplayMode(),
  documentId: null,

  // ===========================================
  // 公共 API 方法（供外部组件调用）
  // ===========================================

  // 统一的文档打开入口，根据当前显示模式智能选择打开方式
  openDocument: (config) => {
    const { displayMode, _open } = get();
    const { onNavigateToFullscreen, ...openConfig } = config;

    // 先设置打开状态与当前文档ID，确保全屏页面也能读取到状态与初始数据
    _open(openConfig as DocumentOpenConfig);

    if (displayMode === 'fullscreen') {
      // 全屏模式：通过回调进行路由跳转
      if (onNavigateToFullscreen) {
        onNavigateToFullscreen();
      }
    }
  },

  // 统一的模式切换入口，处理不同模式之间的切换逻辑和路由跳转
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: () => void;
  }) => {
    const { displayMode, _setDisplayMode, _open, isOpen, documentId } = get();
    const { onNavigateToHome, onNavigateToFullscreen } = callbacks || {};

    if (targetMode === displayMode) {
      // 已经是目标模式，无需切换
      return;
    }

    if (targetMode === 'fullscreen') {
      // 切换到全屏模式：先持久化模式并确保已打开，再进行路由跳转
      _setDisplayMode('fullscreen');
      if (!isOpen && documentId) {
        _open({ documentId });
      }
      if (onNavigateToFullscreen) {
        onNavigateToFullscreen();
      }
    } else if (displayMode === 'fullscreen') {
      // 从全屏模式切换到其他模式：需要路由跳转 + 重新打开
      _setDisplayMode(targetMode);
      if (onNavigateToHome && documentId) {
        onNavigateToHome();
        // 延迟打开以确保页面已加载
        setTimeout(() => _open({ documentId }), 100);
      }
    } else {
      // 在抽屉和模态之间切换：直接更新显示模式
      _setDisplayMode(targetMode);
    }
  },

  // 关闭文档查看器，重置状态
  close: () => {
    set({
      isOpen: false,
      documentId: null,
    });
  },

  // ===========================================
  // 内部工具方法（主要供内部其他方法调用）
  // ===========================================

  // 基础打开方法：设置打开状态与当前文档ID（仅供内部方法调用）
  _open: (config) => {
    set({
      isOpen: true,
      documentId: config.documentId,
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
