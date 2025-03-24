"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef } from "react";
import { toast } from 'sonner'

// 定义不需要认证的路径前缀
const PUBLIC_PATHS = [
  // 营销页面和认证页面不需要登录
  "/",  // 主页（营销页面）
];

interface AuthGuardProviderProps {
  children: ReactNode;
}

export const AuthGuardProvider = ({ children }: AuthGuardProviderProps) => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [prevSignedInState, setPrevSignedInState] = useState<boolean | null>(null);
  // 使用ref来防止重复显示通知
  const hasShownToast = useRef(false);
  // 记录上一次路径
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // 只有当Clerk加载完成后才进行检查
    if (!isLoaded) return;

    // 重置toast标志，当路径变化时
    if (prevPathRef.current !== pathname) {
      hasShownToast.current = false;
      prevPathRef.current = pathname;
    }

    // 检查当前路径是否是公开路径
    const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

    // 如果用户未登录且当前路径不是公开路径，则重定向到主页
    if (!isSignedIn && !isPublicPath && !hasShownToast.current) {
      console.log("用户未登录或登录已过期，重定向到主页");
      
      // 显示友好的提示，仅显示一次
      toast("登录已过期", {
        description: "您的登录状态已过期，请重新登录",
        position: "top-center",
        id: "auth-expired", // 添加ID防止重复
      });
      
      // 标记已显示通知
      hasShownToast.current = true;
      
      router.push("/");  // 重定向到主页
      return; // 提前退出避免检测状态变化部分再次触发
    }

    // 检测登录状态变化
    if (prevSignedInState !== null && prevSignedInState !== isSignedIn) {
      if (!isSignedIn && !hasShownToast.current) {
        // 用户从登录状态变为未登录状态
        console.log("登录状态已变更为未登录");
        
        // 显示友好的提示，仅显示一次
        toast("登录已过期", {
          description: "您的登录状态已过期，请重新登录",
          position: "top-center",
          id: "auth-expired", // 添加ID防止重复
        });
        
        // 标记已显示通知
        hasShownToast.current = true;
        
        // 如果当前不在公开路径，则重定向到主页
        if (!isPublicPath) {
          router.push("/");  // 重定向到主页
        }
      } else if (isSignedIn) {
        // 如果用户登录了，重置标志
        hasShownToast.current = false;
      }
    }

    // 更新上一次的登录状态
    setPrevSignedInState(isSignedIn);
  }, [isSignedIn, isLoaded, pathname, router, prevSignedInState]);

  return <>{children}</>;
}; 