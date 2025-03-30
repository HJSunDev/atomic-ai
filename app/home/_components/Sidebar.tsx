"use client";

import { 
  PanelLeftClose, 
  PanelLeftOpen,
  Home,
  HelpCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CustomUserAvatar } from "./CustomUserAvatar";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "flex flex-col h-full bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden dark:border-gray-800 shrink-0",
        collapsed ? "w-[4rem]" : "w-[12rem]"
      )}
    >
      <header className={cn(
        "flex items-center",
        collapsed ? "h-auto py-4 flex-col" : "h-14 justify-between pl-4 pr-2"
      )}>
        {/* 应用名 */}
        {!collapsed && (
          <div className="font-semibold text-xl text-primary dark:text-white flex items-center">
            Atomic
          </div>
        )}

        {/* 展开状态下的头像和按钮 */}
        {!collapsed && (
          <>
            {/* 用户头像 */}
            <div className="flex items-center justify-center ml-1">
              <CustomUserAvatar size="sm" menuPosition="left" />
            </div>

            {/* 展开收起按钮 */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center ml-1 w-6 h-6 cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </>
        )}

        {/* 收起状态下，先显示展开按钮，再显示头像 */}
        {collapsed && (
          <>
            {/* 展开收起按钮 */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-6 h-6 mb-3 cursor-pointer"
            >
              <PanelLeftOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* 用户头像 */}
            <div className="flex items-center justify-center">
              <CustomUserAvatar size="sm" menuPosition="right" />
            </div>
          </>
        )}
      </header>

      {/* 主内容区域 - 可以根据需要添加 */}
      <div className="flex-1"></div>
      
      {/* 底部图标导航栏 */}
      <footer className={cn(
        "border-gray-200 dark:border-gray-800 py-2 overflow-hidden",
        collapsed 
          ? "flex flex-col items-center space-y-3 px-0 py-3" 
          : "border-t flex justify-around items-center px-1"
      )}>
        <Link href="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Home className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <ThemeToggle />
        {/** 只在展开状态下显示 */}
        {/* {!collapsed && (
        )} */}
      </footer>

    </aside>
  );
} 