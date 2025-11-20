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
    // 1. 更新菜单状态（高亮）
    setActiveMenu(menuId);

    // 2. 特殊路由处理
    if (menuId === "factory") {
      // 工坊是独立路由，直接跳转
      if (!pathname.startsWith("/home/factory")) {
        router.push("/home/factory");
      }
      return;
    }

    // 3. 常规主页模块处理 (home, ai-creation, chat 等)
    // 这些模块实际上是在 /home 路由下通过条件渲染显示的
    if (pathname !== "/home") {
      // 关闭可能残留的文档打开状态，避免状态与UI不一致
      closeDocument();
      // 返回主页以触发内容区域的逻辑渲染
      router.push("/home");
    }
  }, [pathname, router, setActiveMenu, closeDocument]);

  return {
    navigateToMenu,
    currentPath: pathname,
    isInHomePage: pathname === "/home",
  };
};
