"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Layers, 
  Puzzle, 
  Bot, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// 导航项类型定义
interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // 导航菜单项
  const navItems: NavItem[] = [
    {
      title: "仪表盘",
      href: "/dashboard",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      title: "提示词模块",
      href: "/dashboard/modules",
      icon: <Puzzle className="h-5 w-5" />,
    },
    {
      title: "组合流程",
      href: "/dashboard/flows",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      title: "AI智能体",
      href: "/dashboard/agents",
      icon: <Bot className="h-5 w-5" />,
    },
    {
      title: "设置",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <aside 
      className={cn(
        "bg-background border-r flex flex-col h-full transition-all duration-300",
        collapsed ? "w-[4.5rem]" : "w-[16rem]"
      )}
    >
      {/* Logo区域 */}
      <div className="h-16 border-b flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-[2rem] h-[2rem] rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            O
          </div>
          {!collapsed && <span className="font-bold text-xl">OmniAid</span>}
        </div>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* 折叠按钮 */}
      <div className="h-12 border-t flex items-center justify-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
} 