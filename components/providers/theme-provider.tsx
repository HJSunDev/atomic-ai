"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProviderWrapper({ children }: ThemeProviderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 判断当前路径是否应该应用主题
  // 排除营销页（根路径 /）
  const shouldEnableTheme = pathname !== "/" && !pathname.startsWith("/?");
  console.log('查看shouldEnableTheme', shouldEnableTheme)

  // 仅在客户端挂载后渲染内容
  useEffect(() => {
    setMounted(true);
  }, []);

  // 在营销页上强制使用亮色模式
  useEffect(() => {
    if (!shouldEnableTheme && mounted) {
      // 移除可能存在的暗色模式类
      document.documentElement.classList.remove('dark');
      // 如果有本地存储的主题设置，不要在营销页上应用它
      if (typeof window !== 'undefined') {
        // 我们不直接清除 localStorage，而是在切换回应用页面时恢复主题
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, [shouldEnableTheme, mounted]);

  // 如果未挂载，返回一个不带主题的版本，避免水合不匹配
  if (!mounted) {
    return <>{children}</>;
  }

  // 如果是营销页，不应用主题设置，但确保使用亮色模式
  if (!shouldEnableTheme) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
    </ThemeProvider>
  );
} 