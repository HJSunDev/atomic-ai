import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义菜单项类型
export type MenuItemId = 
  | "ai-studio" 
  | "chat"
  | "settings" 
  | "profile" 
  | "documents" 
  | "knowledge-base" 
  | "history" 
  | "favorites" 
  | "feedback" 
  | "resource-library";

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
}

// 创建带有本地存储持久化的状态管理
export const useSidebarMenuStore = create<SidebarMenuState>()(
  persist(
    (set) => ({
      // 默认不折叠
      collapsed: false,
      // 默认选中AI创作中心
      activeMenuId: "ai-studio",
      
      // 设置折叠状态
      setCollapsed: (isCollapsed: boolean) => set({ collapsed: isCollapsed }),
      // 切换折叠状态
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      // 设置当前活动菜单项
      setActiveMenu: (menuId: MenuItemId) => set({ activeMenuId: menuId }),
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