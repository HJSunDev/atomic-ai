import { create } from 'zustand';

/**
 * 文档查看器全局状态管理
 * 
 * 负责管理文档查看器的显示状态、模式切换和当前文档ID。
 * 支持三种显示模式：侧边抽屉(drawer)、居中模态(modal)、全屏页面(fullscreen)
 * 
 * 核心功能：
 * - drawer/modal 模式：通过 Store 管理 isOpen 和 documentId
 * - fullscreen 模式：通过 URL 动态路由管理（/home/prompt-document/[id]）
 * - 本地存储显示模式偏好
 * - 使用文档ID在各自组件中获取真实数据，避免在全局Store中保存草稿内容
 * 
 * 重要：全屏模式的状态由 URL 管理，Store 的 isOpen 和 documentId 仅用于 drawer/modal
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
  
  // UI 状态（仅用于 drawer/modal 模式）
  isOpen: boolean;
  displayMode: DocumentDisplayMode;

  // 当前正在查看的文档ID（仅用于 drawer/modal 模式）
  documentId: string | null;

  // ===========================================
  // 公共 API 方法（供外部组件调用）
  // ===========================================
  
  // 打开文档（仅用于 drawer/modal 模式）
  openDocument: (config: DocumentOpenConfig) => void;
  
  // 统一的模式切换入口，处理不同模式之间的切换逻辑和路由跳转
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: (documentId: string) => void;
    documentIdToOpen?: string; // 从全屏切出时传入的文档ID
  }) => void;
  
  // 关闭文档查看器（仅用于 drawer/modal）
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

  // 初始状态
  // ===========================================
  isOpen: false,
  displayMode: getInitialDisplayMode(),
  documentId: null,

  // 公共 API 方法（供外部组件调用）
  // ===========================================

  // 打开文档（仅用于 drawer/modal 模式，全屏模式应直接路由跳转）
  openDocument: (config) => {
    const { _open } = get();
    _open(config);
  },

  // 统一的模式切换入口，处理不同模式之间的切换逻辑和路由跳转
  switchDisplayMode: (targetMode: DocumentDisplayMode, callbacks?: {
    onNavigateToHome?: () => void;
    onNavigateToFullscreen?: (documentId: string) => void;
    documentIdToOpen?: string;
  }) => {
    const { displayMode, _setDisplayMode, _open, close, documentId } = get();
    const { onNavigateToHome, onNavigateToFullscreen, documentIdToOpen } = callbacks || {};

    if (targetMode === displayMode) {
      // 已经是目标模式，无需切换
      return;
    }

    if (targetMode === 'fullscreen') {
      // 切换到全屏模式：先关闭 Dialog/Sheet，等待关闭动画完成后再路由跳转
      const currentDocumentId = documentId;
      
      // 先更新显示模式并关闭 Dialog/Sheet
      _setDisplayMode('fullscreen');
      close();
      
      // 延迟路由跳转，确保 Dialog/Sheet 移除
      if (onNavigateToFullscreen && currentDocumentId) {
        setTimeout(() => {
          onNavigateToFullscreen(currentDocumentId);
        }, 200);
      }
    } else if (displayMode === 'fullscreen') {
      // 从全屏模式切换到其他模式：需要路由跳转 + 使用传入的 documentIdToOpen 打开
      _setDisplayMode(targetMode);
      if (onNavigateToHome && documentIdToOpen) {
        onNavigateToHome();
        // 延迟打开以确保页面已加载
        setTimeout(() => _open({ documentId: documentIdToOpen }), 100);
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
