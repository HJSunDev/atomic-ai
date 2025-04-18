"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 判断当前路径是否应该显示主题切换按钮
  // 排除营销页（根路径 /）
  const shouldShowToggle = pathname !== "/" && !pathname.startsWith("/?");

  // 在组件挂载后再渲染，避免水合不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // 如果是营销页或组件未挂载，返回空元素
  if (!mounted || !shouldShowToggle) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272A] cursor-pointer"
      aria-label="切换主题"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      ) : (
        <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
} 