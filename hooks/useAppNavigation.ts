"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebarMenuStore } from "@/store/home";
import { useDocumentStore } from "@/store/home/documentStore";
import type { MenuItemId } from "@/store/home/use-sidebar-menu-store";

// 导航服务Hook：统一处理菜单选择时的状态更新与必要的路由跳转
export const useAppNavigation = () => {
  // 路由与路径
  const router = useRouter();
  const pathname = usePathname();

  // 侧边栏菜单：仅需要设置当前活动菜单
  const setActiveMenu = useSidebarMenuStore((state) => state.setActiveMenu);

  // 文档状态：用于在从独立路由返回主页前确保状态清理
  const closeDocument = useDocumentStore((state) => state.close);

  // 统一菜单导航：处理不同类型的菜单跳转
  const navigateToMenu = useCallback((menuId: MenuItemId) => {
    // 1. 独立路由处理 (Standalone Routes)
    // 工坊等模块拥有独立的路由路径 /home/factory
    if (menuId === "factory") {
      // 立即更新状态，因为接下来的路由跳转是明确的
      setActiveMenu(menuId);
      if (!pathname.startsWith("/home/factory")) {
        router.push("/home/factory");
      }
      return;
    }

    // 2. SPA 模块处理 (渲染在 /home 路由下的组件)
    if (pathname === "/home") {
      // 2.1 如果已经在主页，这是单纯的模块切换（SPA 模式）
      // 直接修改状态，不需要触碰路由，保持 URL 纯净
      setActiveMenu(menuId);
    } else {
      // 2.2 如果是从独立路由 (如 /home/factory) 返回主页
      // 需要一种机制告诉 /home 页面我们想去哪个模块
      // 使用 "一次性指令" (Query Param) 来传递这个意图
      // 目标页面收到指令后会同步状态并立即清除参数
      
      closeDocument();
      router.push(`/home?module=${menuId}`);
    }
  }, [pathname, router, setActiveMenu, closeDocument]);

  return {
    navigateToMenu,
    currentPath: pathname,
    isInHomePage: pathname === "/home",
  };
};
