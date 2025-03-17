"use client";

import { 
  PanelLeftClose, 
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "flex flex-col h-full bg-[#FAFAFA] overflow-hidden",
        collapsed ? "w-[4rem]" : "w-[12rem]"
      )}
    >
      <header className={cn(
        "flex items-center",
        collapsed ? "h-auto py-4 flex-col" : "h-14 justify-between pl-3 pr-2"
      )}>
        {/* 应用名 */}
        {!collapsed && (
          <Link 
            href="/" 
            className="font-semibold text-xl text-primary flex items-center"
          >
            OmniAid
          </Link>
        )}

        {/* 展开状态下的头像和按钮 */}
        {!collapsed && (
          <>
            {/* 用户头像 */}
            <div className="flex items-center justify-center ml-1">
              <UserButton />
            </div>

            {/* 展开收起按钮 */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center ml-1 w-6 h-6 cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4 text-gray-600" />
            </button>
          </>
        )}

        {/* 收起状态下，先显示展开按钮，再显示头像 */}
        {collapsed && (
          <>
            {/* 展开收起按钮 */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className=" flex items-center justify-center w-6 h-6 mb-3 cursor-pointer"
            >
              <PanelLeftOpen className="h-5 w-5 text-gray-600" />
            </button>

            {/* 用户头像 */}
            <div className="flex items-center justify-center">
              <UserButton />
            </div>
          </>
        )}
      </header>

    </aside>
  );
} 