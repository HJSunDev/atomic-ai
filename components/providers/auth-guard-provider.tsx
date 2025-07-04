"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

/**
 * 定义不需要进行认证检查的公开路径。
 * 目前只有营销主页 ("/") 被视为公开。
 */
const PUBLIC_PATHS = [
  // 营销页面和认证页面不需要登录
  "/", // 主页（营销页面）
];

interface AuthGuardProviderProps {
  children: ReactNode;
}

/**
 * AuthGuardProvider 是一个客户端组件，用于保护应用的路由。
 * 它会检查用户的认证状态，并在必要时执行重定向。
 * 1. 在Clerk加载认证状态时，显示一个全局加载指示器。
 * 2. 如果用户未登录并试图访问受保护的页面，则将其重定向到主页。
 * 3. 在重定向期间，不渲染任何子组件，以防止状态不一致导致的错误。
 * 4. 只有在所有认证检查通过后，才渲染子组件。
 */
export const AuthGuardProvider = ({ children }: AuthGuardProviderProps) => {
  // 从Clerk获取用户认证状态和加载状态
  const { isSignedIn, isLoaded } = useUser();
  // 获取Next.js的路由和当前路径
  const router = useRouter();
  const pathname = usePathname();

  // 在组件渲染作用域内计算一次isPublicPath，避免重复计算
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
  );

  useEffect(() => {
    // 确保只在Clerk加载完成后才执行逻辑
    if (!isLoaded) return;

    // 如果用户未登录且当前路径不是公开路径，则重定向到主页
    if (!isSignedIn && !isPublicPath) {
      router.push("/"); // 执行重定向
    }
  }, [isSignedIn, isLoaded, isPublicPath, router]); // 将isPublicPath加入依赖项

  // 在Clerk JS脚本加载和认证状态确定之前，显示一个加载界面。
  // 这可以防止在认证状态未知时渲染页面内容，避免页面闪烁或渲染不一致。
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* 这里可以放置一个更美观的加载动画 */}
        <div>Loading...</div>
      </div>
    );
  }
  
  // 如果用户未登录并且正在访问受保护的路由，
  // 在useEffect中的重定向生效之前，返回null以阻止渲染子组件。
  // 这是防止在重定向前短暂渲染受保护内容的关键步骤。
  if (!isSignedIn && !isPublicPath) {
    return null; // 或者返回一个加载指示器
  }

  // 如果所有检查都通过（用户已登录，或正在访问公开路径），则渲染子组件
  return <>{children}</>;
}; 