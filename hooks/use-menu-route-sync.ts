"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useSidebarMenuStore, MenuItemId } from "@/store";

/**
 * 路由菜单同步 Hook
 * 
 * 职责：
 * 1. 确保 URL (路由/参数) 与 侧边栏菜单状态 (Store) 保持一致。
 * 2. 处理跨路由跳转时的状态传递（通过临时的 URL 参数）。
 */
export function useMenuRouteSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 使用 selector 分别获取状态和方法
  const activeMenuId = useSidebarMenuStore((state) => state.activeMenuId);
  const setActiveMenu = useSidebarMenuStore((state) => state.setActiveMenu);

  useEffect(() => {
    // 1. 处理独立路由模块 (Standalone Routes)
    // 规则：路径前缀匹配的菜单必须高亮对应项
    const standaloneRules: Array<{ prefix: string; menuId: MenuItemId }> = [
      { prefix: "/home/factory", menuId: "factory" },
      { prefix: "/home/discovery", menuId: "discovery" },
    ];

    for (const rule of standaloneRules) {
      if (pathname.startsWith(rule.prefix)) {
        if (activeMenuId !== rule.menuId) {
          setActiveMenu(rule.menuId);
        }
        return;
      }
    }

    // 2. 处理主页下的 SPA 模块 (/home)
    // 场景：从独立路由(如工坊)跳回主页时，通过 URL 参数(?module=xxx)传递目标模块意图
    if (pathname === "/home") {
      const moduleParam = searchParams.get("module");
      
      // 如果存在 module 参数，说明这是一个带意图的跳转（"指令"）
      if (moduleParam) {
        const targetMenuId = moduleParam as MenuItemId;
        
        // 2.1 执行指令：同步状态
        if (activeMenuId !== targetMenuId) {
          setActiveMenu(targetMenuId);
        }

        // 2.2 [阅后即焚]：指令执行完毕后，立即清理 URL
        // 恢复纯净的 /home 路由，消除由于参数带来的"非标准路由"观感
        // 使用 replace 替换当前历史记录，用户无感知
        router.replace("/home");
      }
    }
    // 注意：添加 router 作为依赖
  }, [pathname, searchParams, activeMenuId, setActiveMenu, router]);
}
