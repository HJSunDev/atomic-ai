import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义菜单项类型
export type MenuItemId = 
  | "home"
  | "prompt-studio" 
  | "chat"
  | "discovery"
  | "settings" 
  | "profile" 
  | "documents" 
  | "knowledge-base" 
  | "feedback";

// 定义菜单项元数据接口
export interface MenuItemMetadata {
  id: MenuItemId;
  showAiPanel: boolean; // 是否显示AI面板
  // 未来可以添加更多元数据字段，比如icon, title, description等
}

// 菜单项元数据配置
export const MENU_ITEMS_CONFIG: Record<MenuItemId, MenuItemMetadata> = {
  "home": { id: "home", showAiPanel: true },
  "prompt-studio": { id: "prompt-studio", showAiPanel: true },
  "chat": { id: "chat", showAiPanel: false }, // 聊天模块不需要AI面板
  "discovery": { id: "discovery", showAiPanel: true }, // 发现模块
  "documents": { id: "documents", showAiPanel: true },
  "knowledge-base": { id: "knowledge-base", showAiPanel: true },
  "feedback": { id: "feedback", showAiPanel: true },
  "settings": { id: "settings", showAiPanel: true },
  "profile": { id: "profile", showAiPanel: true },
};

// 定义侧边栏菜单状态类型
interface SidebarMenuState {
  // 是否折叠侧边栏
  collapsed: boolean;
  // 当前选中的菜单项ID
  activeMenuId: MenuItemId;
  
  // 设置侧边栏折叠状态
  setCollapsed: (isCollapsed: boolean) => void;
  // 切换侧边栏折叠状态
  toggleCollapsed: () => void;
  // 设置当前活动菜单项
  setActiveMenu: (menuId: MenuItemId) => void;
  // 获取当前活动菜单项的元数据
  getActiveMenuMetadata: () => MenuItemMetadata;
}

// 创建带有本地存储持久化的状态管理
export const useSidebarMenuStore = create<SidebarMenuState>()(
  persist(
    (set, get) => ({
      // 默认折叠侧边栏
      collapsed: true,
      // 默认选中主页
      activeMenuId: "home",
      
      // 设置折叠状态
      setCollapsed: (isCollapsed: boolean) => set({ collapsed: isCollapsed }),
      // 切换折叠状态
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      // 设置当前活动菜单项
      setActiveMenu: (menuId: MenuItemId) => set({ activeMenuId: menuId }),
      // 获取当前活动菜单项的元数据
      getActiveMenuMetadata: () => MENU_ITEMS_CONFIG[get().activeMenuId]
    }),
    {
      // 持久化配置
      name: "sidebar-menu-storage",
      // 只持久化折叠状态和当前选中菜单
      partialize: (state) => ({ 
        collapsed: state.collapsed,
        activeMenuId: state.activeMenuId
      }),
    }
  )
); 