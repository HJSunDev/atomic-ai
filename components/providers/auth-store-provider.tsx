"use client";

import { useUser } from "@clerk/nextjs";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/auth/useAuthStore";

/**
 * AuthStoreProvider是一个客户端组件，用于将Clerk的认证状态同步到useAuthStore中。
 *
 * 它扮演一个“桥梁”的角色：
 * 1. 使用Clerk的`useUser` Hook来监听用户认证状态（`user`对象和`isLoaded`标志）。
 * 2. 通过`useEffect`，在Clerk状态加载完成或发生变化时，调用`useAuthStore.setAuth`方法，
 *    将`userId`和`isLoaded`更新到Zustand store中。
 * 3. 当组件卸载时，调用`clearAuth`来重置状态，防止内存泄漏和状态污染。
 *
 * 这使得应用的其他部分（包括非React环境，如Zustand的中间件）能够同步获取最新的认证信息。
 */
export const AuthStoreProvider = ({ children }: { children: ReactNode }) => {
  // 从Clerk获取用户和加载状态
  const { user, isLoaded } = useUser();
  // 从Zustand store获取操作
  const { setAuth, clearAuth } = useAuthStore.getState();

  useEffect(() => {
    // 仅当Clerk状态加载完成后才同步
    if (isLoaded) {
      setAuth({
        userId: user?.id ?? null,
        isLoaded: true,
      });
    }

    // 在组件卸载时清理store，以防止在重新挂载时使用陈旧的数据
    return () => {
      clearAuth();
    };
  }, [user, isLoaded, setAuth, clearAuth]);

  return <>{children}</>;
};
