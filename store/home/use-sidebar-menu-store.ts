import { create } from "zustand";
import { persist } from "zustand/middleware";

// 定义菜单项类型
export type MenuItemId = 
  | "home"
  | "ai-creation" 
  | "chat"
  | "factory"
  | "discovery"
  | "settings" 
  | "profile" 
  | "knowledge-base" 
  | "feedback";

// 定义菜单项元数据接口
export interface MenuItemMetadata {
  id: MenuItemId;
  // 未来可以添加更多元数据字段，比如icon, title, description等
}

// 菜单项元数据配置
export const MENU_ITEMS_CONFIG: Record<MenuItemId, MenuItemMetadata> = {
  "home": { id: "home" },
  "ai-creation": { id: "ai-creation" },
  "chat": { id: "chat" },
  "factory": { id: "factory" },
  "discovery": { id: "discovery" },
  "knowledge-base": { id: "knowledge-base" },
  "feedback": { id: "feedback" },
  "settings": { id: "settings" },
  "profile": { id: "profile" },
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