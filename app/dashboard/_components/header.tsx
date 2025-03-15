"use client";

import { Button } from "@/components/ui/button";
import { Search, Bell, User, Plus } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6">
      {/* 左侧搜索框 */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索提示词、模块、流程..."
          className="w-full h-9 pl-10 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      
      {/* 右侧操作区 */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* 新建按钮 */}
        <Button size="sm" className="hidden md:flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>新建</span>
        </Button>
        
        {/* 移动端新建按钮 */}
        <Button size="icon" className="md:hidden h-9 w-9">
          <Plus className="h-4 w-4" />
        </Button>
        
        {/* 通知按钮 */}
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </Button>
        
        {/* 用户头像 */}
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
} 