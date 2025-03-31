"use client";

import { 
  PanelLeftClose, 
  PanelLeftOpen,
  Home,
  HelpCircle,
  MoreHorizontal,
  Settings,
  UserCircle,
  FileText,
  BookOpen,
  History,
  Star,
  MessageSquare,
  LibraryBig,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CustomUserAvatar } from "@/components/ui/CustomUserAvatar";
import { createPortal } from "react-dom";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  
  // 更多菜单相关状态
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 引用
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  
  // 菜单显示隐藏定时器引用
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 客户端挂载后才能使用portal
  useEffect(() => {
    setMounted(true);
    return () => {
      clearAllTimeouts();
      setShowMoreMenu(false);
    };
  }, []);
  
  // 清除所有定时器
  const clearAllTimeouts = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };
  
  // 处理点击外部关闭菜单
  useOnClickOutside<HTMLDivElement>(moreMenuRef, (e) => {
    if (moreButtonRef.current && !moreButtonRef.current.contains(e.target as Node)) {
      handleMenuHide();
    }
  });
  
  // 显示菜单时的处理函数
  const handleMenuShow = () => {
    // 清除所有定时器
    clearAllTimeouts();
    
    // 设置显示定时器，添加延迟以防止意外触发
    showTimeoutRef.current = setTimeout(() => {
      setShowMoreMenu(true);
    }, 50);
  };
  
  // 隐藏菜单时的处理函数
  const handleMenuHide = () => {
    // 清除所有定时器
    clearAllTimeouts();
    
    // 设置隐藏定时器，添加延迟使交互更平滑
    hideTimeoutRef.current = setTimeout(() => {
      setShowMoreMenu(false);
    }, 120);
  };
  
  // 鼠标进入菜单时保持显示
  const handleMenuEnter = () => {
    clearAllTimeouts();
  };

  return (
    <aside 
      className={cn(
        "flex flex-col h-full bg-[#FAFAFA] dark:bg-[#121212] overflow-hidden dark:border-gray-800 shrink-0 relative z-10",
        collapsed ? "w-[4rem]" : "w-[12rem]"
      )}
    >
      <header className={cn(
        "flex items-center",
        collapsed ? "h-auto pt-4 flex-col" : "h-14 justify-between pl-4 pr-2"
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

      {/* 主内容区域 - 菜单项列表 */}
      <div className={cn("flex-1")}>
        {/* 主功能导航项 */}
        <nav className="px-2 space-y-1">
          {/* 主页 */}
          {collapsed ? (
            <Link
              href="/"
              className="flex flex-col items-center py-2 group"
            >
              <div className="h-9 w-9 flex items-center justify-center rounded-full transition-colors group-hover:bg-gray-100 dark:group-hover:bg-gray-800">
                <Home className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-[11px] mt-1">主页</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Home className="h-4 w-4 mr-3 text-gray-600 dark:text-gray-400" />
              <span>主页</span>
            </Link>
          )}
          
          {/* 分割线 */}
          <div className="py-1">
            <div className={cn(
              "border-t border-gray-200 dark:border-gray-700 transition-all",
              collapsed ? "w-8 mx-auto" : "w-full"
            )}></div>
          </div>
          
          {/* 更多 - 悬停显示菜单 */}
          {collapsed ? (
            <div
              ref={moreButtonRef}
              className="flex flex-col items-center py-2"
              onMouseEnter={handleMenuShow}
              onMouseLeave={handleMenuHide}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                showMoreMenu ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800" 
              )}>
                <MoreHorizontal className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-[11px] mt-1">更多</span>
            </div>
          ) : (
            <div
              ref={moreButtonRef}
              className="w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative"
              onMouseEnter={handleMenuShow}
              onMouseLeave={handleMenuHide}
            >
              <MoreHorizontal className="h-4 w-4 mr-3 text-gray-600 dark:text-gray-400" />
              <span>更多</span>
            </div>
          )}
        </nav>
      </div>
      
      {/* 底部图标导航栏 */}
      <footer className={cn(
        "border-t border-gray-200 dark:border-gray-800 py-2 overflow-hidden mt-auto",
        collapsed 
          ? "flex flex-col items-center space-y-3 px-0 py-3" 
          : "flex justify-around items-center px-1"
      )}>
        <Link href="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Home className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <HelpCircle className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
        </div>
        <ThemeToggle />
      </footer>

      {/* 使用Portal将菜单渲染到body层级，避免被父容器的overflow:hidden截断 */}
      {mounted && showMoreMenu && createPortal(
        <div 
          className="fixed inset-0 z-50 pointer-events-none"
          aria-hidden="true"
        >
          <div
            ref={moreMenuRef}
            className="absolute pointer-events-auto"
            style={{
              left: `${moreButtonRef.current?.getBoundingClientRect().right ?? 0}px`,
              top: `${moreButtonRef.current?.getBoundingClientRect().top ?? 0}px`,
              marginLeft: '8px',
            }}
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuHide}
          >
            {/* 隐形桥接区域 - 连接菜单按钮和菜单内容，防止鼠标移动时丢失悬停状态 */}
            <div 
              className="absolute w-8 h-full -left-8 top-0"
              aria-hidden="true"
            />
            
            {/* 菜单内容 */}
            <div className="py-3 px-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 w-60">
              {/* 以下为菜单项 */}
              <Link href="/settings" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <Settings className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">设置</span>
                </div>
              </Link>
              
              <Link href="/profile" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <UserCircle className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">个人资料</span>
                </div>
              </Link>
              
              <Link href="/documents" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <FileText className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">文档中心</span>
                </div>
              </Link>
              
              <Link href="/knowledge-base" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <BookOpen className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">知识库</span>
                </div>
              </Link>
              
              <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
              
              <Link href="/history" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <History className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">历史记录</span>
                </div>
              </Link>
              
              <Link href="/favorites" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <Star className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">收藏夹</span>
                </div>
              </Link>
              
              <Link href="/feedback" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <MessageSquare className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">反馈</span>
                </div>
              </Link>
              
              <Link href="/resource-library" className="block">
                <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center gap-3 group transition-colors">
                  <LibraryBig className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="text-sm">资源库</span>
                </div>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
} 