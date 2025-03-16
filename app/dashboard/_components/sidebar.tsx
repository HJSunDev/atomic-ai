"use client";

import { usePathname } from "next/navigation";
import { 
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

  return (
    <aside 
      className={cn(
        "bg-background border-r flex flex-col h-full transition-all duration-300",
        collapsed ? "w-[4rem]" : "w-[16rem]"
      )}
    >

      
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