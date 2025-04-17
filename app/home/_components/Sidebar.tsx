"use client";

import { 
  ArrowLeftToLine,
  ArrowRightFromLine,
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
import { useSidebarMenuStore } from "@/store/home";

// 自定义AI机器人图标
const AIRobotIcon = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* 机器人头部 */}
      <rect x="4" y="8" width="16" height="12" rx="2" ry="2" />
      
      {/* 机器人天线 */}
      <path d="M12 4v4" />
      <circle cx="12" cy="3" r="1" />
      
      {/* 机器人眼睛 */}
      <circle cx="9" cy="13" r="1.5" />
      <circle cx="15" cy="13" r="1.5" />
      
      {/* 机器人嘴巴 */}
      <path d="M9 17h6" />
      
      {/* 机器人腿部 */}
      <path d="M8 20v1" />
      <path d="M16 20v1" />
    </svg>
  );
};

export function Sidebar() {
  // 更多菜单相关状态
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 获取当前菜单状态
  const { activeMenuId, setActiveMenu, collapsed, toggleCollapsed } = useSidebarMenuStore();
  
  // 引用
  const moreButtonRef = useRef<HTMLDivElement>(null);
  
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
        "flex flex-col h-full bg-[#FAFAFA] dark:bg-[#1B1B1D] overflow-hidden dark:border-gray-800 shrink-0 relative z-10",
        collapsed ? "w-[4rem]" : "w-[10.5rem]"
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
              onClick={toggleCollapsed}
              className="flex items-center justify-center ml-1 w-5 h-5 cursor-pointer rounded-full bg-[#E6E6E8] dark:bg-[#2C2C2E]"
            >
              <ArrowLeftToLine className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            </button>
          </>
        )}

        {/* 收起状态下，先显示展开按钮，再显示头像 */}
        {collapsed && (
          <>
            {/* 展开收起按钮 */}
            <button
              onClick={toggleCollapsed}
              className="flex items-center justify-center w-6 h-6 mb-3 cursor-pointer rounded-full bg-[#E6E6E8] dark:bg-[#2C2C2E]"
            >
              <ArrowRightFromLine className="h-3 w-3 text-gray-600 dark:text-gray-400 translate-x-0.5" />
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
          {/* 智创 */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "prompt-studio" && "rounded-lg"
              )}
              onClick={() => setActiveMenu("prompt-studio")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "prompt-studio" 
                  ? "bg-[#ECEDEE] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <AIRobotIcon className={cn(
                  "h-[18px] w-[18px]",
                  activeMenuId === "prompt-studio"
                    ? "text-primary dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[11px] mt-1",
                activeMenuId === "prompt-studio" && "text-primary dark:text-gray-200 font-medium"
              )}>智创</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "prompt-studio"
                  ? "bg-[#ECEDEE] text-primary dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-gray-700 dark:text-gray-300"
              )}
              onClick={() => setActiveMenu("prompt-studio")}
            >
              <AIRobotIcon className={cn(
                "h-4 w-4 mr-3",
                activeMenuId === "prompt-studio"
                  ? "text-primary dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>智创</span>
            </div>
          )}
          
          {/* 聊天 */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "chat" && "rounded-lg"
              )}
              onClick={() => setActiveMenu("chat")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "chat" 
                  ? "bg-[#ECEDEE] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <MessageSquare className={cn(
                  "h-[18px] w-[18px]",
                  activeMenuId === "chat"
                    ? "text-primary dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[11px] mt-1",
                activeMenuId === "chat" && "text-primary dark:text-gray-200 font-medium"
              )}>聊天</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "chat"
                  ? "bg-[#ECEDEE] text-primary dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-gray-700 dark:text-gray-300"
              )}
              onClick={() => setActiveMenu("chat")}
            >
              <MessageSquare className={cn(
                "h-4 w-4 mr-3",
                activeMenuId === "chat"
                  ? "text-primary dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>聊天</span>
            </div>
          )}
          
          {/* 收藏夹 */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "favorites" && "rounded-lg"
              )}
              onClick={() => setActiveMenu("favorites")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "favorites" 
                  ? "bg-[#ECEDEE] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <Star className={cn(
                  "h-[18px] w-[18px]",
                  activeMenuId === "favorites"
                    ? "text-primary dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[11px] mt-1",
                activeMenuId === "favorites" && "text-primary dark:text-gray-200 font-medium"
              )}>收藏</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "favorites"
                  ? "bg-[#ECEDEE] text-primary dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-gray-700 dark:text-gray-300"
              )}
              onClick={() => setActiveMenu("favorites")}
            >
              <Star className={cn(
                "h-4 w-4 mr-3",
                activeMenuId === "favorites"
                  ? "text-primary dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>收藏</span>
            </div>
          )}
          
          {/* 资源库 */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "resource-library" && "rounded-lg"
              )}
              onClick={() => setActiveMenu("resource-library")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "resource-library" 
                  ? "bg-[#ECEDEE] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <LibraryBig className={cn(
                  "h-[18px] w-[18px]",
                  activeMenuId === "resource-library"
                    ? "text-primary dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[11px] mt-1",
                activeMenuId === "resource-library" && "text-primary dark:text-gray-200 font-medium"
              )}>资源</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "resource-library"
                  ? "bg-[#ECEDEE] text-primary dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-gray-700 dark:text-gray-300"
              )}
              onClick={() => setActiveMenu("resource-library")}
            >
              <LibraryBig className={cn(
                "h-4 w-4 mr-3",
                activeMenuId === "resource-library"
                  ? "text-primary dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>资源</span>
            </div>
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
                showMoreMenu ? "bg-[#ECEDEE] dark:bg-[#27272A]" : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70" 
              )}>
                <MoreHorizontal className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-[11px] mt-1">更多</span>
            </div>
          ) : (
            <div
              ref={moreButtonRef}
              className="w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 transition-colors cursor-pointer relative"
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
        <Link href="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272A] transition-colors">
          <Home className="h-[18px] w-[18px] text-gray-600 dark:text-gray-400" />
        </Link>
        <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272A] transition-colors">
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
            <div className="py-3 px-2 bg-white rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 w-60 dark:bg-[#202020]">
              {/* 以下为菜单项 */}
              
              <div className="block" onClick={() => setActiveMenu("documents")}>
                <div className={cn(
                  "w-full px-3 py-2 text-left rounded-lg flex items-center gap-3 group transition-colors cursor-pointer",
                  activeMenuId === "documents"
                    ? "bg-primary/10 dark:bg-[#27272A]"
                    : "hover:bg-gray-50 dark:hover:bg-[#27272A]/70"
                )}>
                  <FileText className={cn(
                    "h-4 w-4",
                    activeMenuId === "documents"
                      ? "text-primary dark:text-gray-200"
                      : "text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                  )} />
                  <span className={cn(
                    "text-sm",
                    activeMenuId === "documents" && "text-primary dark:text-gray-200 font-medium"
                  )}>文档中心</span>
                </div>
              </div>
              
              <div className="block" onClick={() => setActiveMenu("knowledge-base")}>
                <div className={cn(
                  "w-full px-3 py-2 text-left rounded-lg flex items-center gap-3 group transition-colors cursor-pointer",
                  activeMenuId === "knowledge-base"
                    ? "bg-primary/10 dark:bg-[#27272A]"
                    : "hover:bg-gray-50 dark:hover:bg-[#27272A]/70"
                )}>
                  <BookOpen className={cn(
                    "h-4 w-4",
                    activeMenuId === "knowledge-base"
                      ? "text-primary dark:text-gray-200"
                      : "text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                  )} />
                  <span className={cn(
                    "text-sm",
                    activeMenuId === "knowledge-base" && "text-primary dark:text-gray-200 font-medium"
                  )}>知识库</span>
                </div>
              </div>
              
              <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
              
              
              <div className="block" onClick={() => setActiveMenu("feedback")}>
                <div className={cn(
                  "w-full px-3 py-2 text-left rounded-lg flex items-center gap-3 group transition-colors cursor-pointer",
                  activeMenuId === "feedback"
                    ? "bg-primary/10 dark:bg-[#27272A]"
                    : "hover:bg-gray-50 dark:hover:bg-[#27272A]/70"
                )}>
                  <MessageSquare className={cn(
                    "h-4 w-4",
                    activeMenuId === "feedback"
                      ? "text-primary dark:text-gray-200"
                      : "text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                  )} />
                  <span className={cn(
                    "text-sm",
                    activeMenuId === "feedback" && "text-primary dark:text-gray-200 font-medium"
                  )}>反馈</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
} 