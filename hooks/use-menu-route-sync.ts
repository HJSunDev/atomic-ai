"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebarMenuStore, MenuItemId } from "@/store";

/**
 * 路由菜单同步 Hook
 * 
 * 职责：
 * 1. 当进入独立路由（如 /home/factory）时，强制同步侧边栏菜单选中状态
 * 2. 当回到主路由（/home）但状态仍残留独立路由状态时，自动纠正回默认状态
 */
export function useMenuRouteSync() {
  const pathname = usePathname();
  // 使用 selector 分别获取状态和方法
  const activeMenuId = useSidebarMenuStore((state) => state.activeMenuId);
  const setActiveMenu = useSidebarMenuStore((state) => state.setActiveMenu);

  useEffect(() => {
    // 1. 处理独立路由模块 (Standalone Routes)
    // 规则：只要路径以 /home/factory 开头，菜单必须高亮 factory
    if (pathname.startsWith("/home/factory")) {
      if (activeMenuId !== "factory") {
        setActiveMenu("factory");
      }
      return;
    }

    // 2. 处理单页应用模块 (SPA Modules under /home)
    // 规则：如果路径是 /home，但菜单还停留在独立路由（如 factory），说明发生了意外回退（如浏览器后退）
    // 必须将菜单重置为 home，否则 DashboardPage 会因为 isStandaloneRoute=true 而渲染空白
    if (pathname === "/home") {
      const standaloneRoutes: MenuItemId[] = ["factory"];
      if (standaloneRoutes.includes(activeMenuId)) {
        setActiveMenu("home");
      }
    }
    // 注意：setActiveMenu 是 zustand action，引用稳定，不需要作为依赖项
    // 但 activeMenuId 需要作为依赖项，以确保 effect 能读取到最新值
  }, [pathname, activeMenuId, setActiveMenu]);
}

