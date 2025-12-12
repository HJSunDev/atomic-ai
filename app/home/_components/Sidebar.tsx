"use client";

import { 
  ArrowLeftToLine,
  ArrowRightFromLine,
  Home,
  HelpCircle,
  MoreHorizontal,
  Settings,
  UserCircle,
  BookOpen,
  History,
  MessageSquare,
  Compass,
  AppWindow,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CustomUserAvatar } from "@/components/ui/CustomUserAvatar";
import { createPortal } from "react-dom";
import { useSidebarMenuStore } from "@/store/home";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import type { MenuItemId } from "@/store/home/use-sidebar-menu-store";
import { HomeNavIcon, AIRobotIcon } from "@/components/icons";
import { ComingSoon } from "@/components/custom";


export function Sidebar() {
  // 更多菜单相关状态
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // 获取当前菜单状态
  const { activeMenuId, setActiveMenu, collapsed, toggleCollapsed } = useSidebarMenuStore();
  
  // 统一导航服务：集中处理菜单选择与必要的路由跳转
  const { navigateToMenu } = useAppNavigation();
  
  // 封装统一点击处理，替代直接 setActiveMenu
  const handleMenuClick = (menuId: MenuItemId) => {
    navigateToMenu(menuId);
  };
  
  // 引用
  const moreButtonRef = useRef<HTMLDivElement>(null);
  
  // 菜单显示/隐藏的定时器引用 - 用于实现优雅的悬停交互
  // 这些定时器确保菜单不会过于敏感地显示或隐藏，提升用户体验
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 客户端挂载后才能使用portal - 避免服务端渲染问题
  useEffect(() => {
    setMounted(true);
    return () => {
      // 组件卸载时清理所有定时器，防止内存泄漏
      clearAllTimeouts();
      setShowMoreMenu(false);
    };
  }, []);
  
  // 清理所有定时器 - 确保状态同步
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

  
  // 显示菜单时的处理函数 - 添加延迟防止误触
  // 当用户鼠标悬停在"更多"按钮上时，延迟50ms显示菜单
  // 这样可以避免用户快速移动鼠标时的意外触发
  const handleMenuShow = () => {
    // 先清理所有定时器，确保状态一致
    clearAllTimeouts();
    
    // 设置显示定时器，给用户一个"确认"的时间窗口
    showTimeoutRef.current = setTimeout(() => {
      setShowMoreMenu(true);
    }, 50);
  };
  
  // 隐藏菜单时的处理函数 - 添加延迟让交互更平滑
  // 当用户鼠标离开"更多"按钮或菜单区域时，延迟120ms隐藏菜单
  // 这个时间足够用户从按钮移动到菜单内容上
  const handleMenuHide = () => {
    // 先清理所有定时器，避免冲突
    clearAllTimeouts();
    
    // 设置隐藏定时器，给用户移动鼠标的时间
    hideTimeoutRef.current = setTimeout(() => {
      setShowMoreMenu(false);
    }, 120);
  };
  
  // 鼠标进入菜单时保持显示 - 取消任何待执行的隐藏操作
  const handleMenuEnter = () => {
    clearAllTimeouts();
  };

  return (
    <aside 
      className={cn(
        "flex flex-col h-full bg-[#F9F8F7] text-[rgb(95,94,91)] dark:text-gray-300 dark:bg-[#1B1B1D] overflow-hidden dark:border-gray-800 shrink-0 relative z-10",
        collapsed ? "w-[3.7rem]" : "w-[10.5rem]"
      )}
    >
      <header className={cn(
        "flex items-center",
        collapsed ? "h-auto pt-4 flex-col" : "h-14 justify-between pl-4 pr-2"
      )}>
        {/* 应用名 */}
        {!collapsed && (
          <div className="font-semibold text-xl text-[rgb(95,94,91)] dark:text-white flex items-center">
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
              className="flex items-center justify-center ml-1 w-5 h-5 cursor-pointer rounded-full bg-[#ECEDEE]/50 dark:bg-[#27272A]/70 hover:bg-[#ECEDEE] dark:hover:bg-[#27272A] transition-colors"
            >
              <ArrowLeftToLine className="h-3 w-3 text-[rgb(95,94,91)] dark:text-gray-400" />
            </button>
          </>
        )}

        {/* 收起状态下，先显示展开按钮，再显示头像 */}
        {collapsed && (
          <>
            {/* 展开收起按钮 */}
            <button
              onClick={toggleCollapsed}
              className="flex items-center justify-center w-6 h-6 mb-3 cursor-pointer rounded-full bg-[#ECEDEE]/50 dark:bg-[#27272A]/70 hover:bg-[#ECEDEE] dark:hover:bg-[#27272A] transition-colors"
            >
              <ArrowRightFromLine className="h-3 w-3 text-[rgb(95,94,91)] dark:text-gray-400 translate-x-0.5" />
            </button>

            {/* 用户头像 */}
            <div className="flex items-center justify-center">
              <CustomUserAvatar size="sm" menuPosition="right" />
            </div>
          </>
        )}
      </header>

      {/* 主内容区域 - 菜单项列表 */}
      <section className={cn("flex-1")}>
        {/* 主功能导航项 */}
        <nav className="px-2 space-y-1">
          {/* 主页 */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "home" && "rounded-lg"
              )}
              onClick={() => handleMenuClick("home")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "home" 
                  ? "bg-[#F1F0EF] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <HomeNavIcon
                  size={18}
                  color="currentColor"
                  className={cn(
                    "h-[1.125rem] w-[1.125rem]",
                    activeMenuId === "home"
                      ? "text-[rgb(95,94,91)] dark:text-gray-200"
                      : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                  )}
                />
              </div>
              <span className={cn(
                "text-[0.6875rem] mt-1",
                activeMenuId === "home" && "text-[rgb(95,94,91)] dark:text-gray-200 font-medium"
              )}>主页</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "home"
                  ? "bg-[#F1F0EF] text-[rgb(95,94,91)] dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-[rgb(95,94,91)] dark:text-gray-300"
              )}
              onClick={() => handleMenuClick("home")}
            >
              <HomeNavIcon
                size={16}
                color="currentColor"
                className={cn(
                  "h-[1rem] w-[1rem] mr-3",
                  activeMenuId === "home"
                    ? "text-[rgb(95,94,91)] dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400"
                )}
              />
              <span>主页</span>
            </div>
          )}
          
          {/* 智创 */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "ai-creation" && "rounded-lg"
              )}
              onClick={() => handleMenuClick("ai-creation")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "ai-creation" 
                  ? "bg-[#F1F0EF] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <AIRobotIcon className={cn(
                  "h-[1.125rem] w-[1.125rem]",
                  activeMenuId === "ai-creation"
                    ? "text-[rgb(95,94,91)] dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[0.6875rem] mt-1",
                activeMenuId === "ai-creation" && "text-[rgb(95,94,91)] dark:text-gray-200 font-medium"
              )}>智创</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "ai-creation"
                  ? "bg-[#F1F0EF] text-[rgb(95,94,91)] dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-[rgb(95,94,91)] dark:text-gray-300"
              )}
              onClick={() => handleMenuClick("ai-creation")}
            >
              <AIRobotIcon className={cn(
                "h-[1rem] w-[1rem] mr-3",
                activeMenuId === "ai-creation"
                  ? "text-[rgb(95,94,91)] dark:text-gray-200"
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
              onClick={() => handleMenuClick("chat")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "chat" 
                  ? "bg-[#F1F0EF] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <MessageSquare className={cn(
                  "h-[1.125rem] w-[1.125rem]",
                  activeMenuId === "chat"
                    ? "text-[rgb(95,94,91)] dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[0.6875rem] mt-1",
                activeMenuId === "chat" && "text-[rgb(95,94,91)] dark:text-gray-200 font-medium"
              )}>聊天</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "chat"
                  ? "bg-[#F1F0EF] text-[rgb(95,94,91)] dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-[rgb(95,94,91)] dark:text-gray-300"
              )}
              onClick={() => handleMenuClick("chat")}
            >
              <MessageSquare className={cn(
                "h-[1rem] w-[1rem] mr-3",
                activeMenuId === "chat"
                  ? "text-[rgb(95,94,91)] dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>聊天</span>
            </div>
          )}

          {/* 工坊 (App Factory) */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "factory" && "rounded-lg"
              )}
              onClick={() => handleMenuClick("factory")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "factory" 
                  ? "bg-[#F1F0EF] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <AppWindow className={cn(
                  "h-[1.125rem] w-[1.125rem]",
                  activeMenuId === "factory"
                    ? "text-[rgb(95,94,91)] dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[0.6875rem] mt-1",
                activeMenuId === "factory" && "text-[rgb(95,94,91)] dark:text-gray-200 font-medium"
              )}>工坊</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "factory"
                  ? "bg-[#F1F0EF] text-[rgb(95,94,91)] dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-[rgb(95,94,91)] dark:text-gray-300"
              )}
              onClick={() => handleMenuClick("factory")}
            >
              <AppWindow className={cn(
                "h-[1rem] w-[1rem] mr-3",
                activeMenuId === "factory"
                  ? "text-[rgb(95,94,91)] dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>工坊</span>
            </div>
          )}

          
          {/* 发现 */}
          {collapsed ? (
            <div
              className={cn(
                "flex flex-col items-center py-2 group cursor-pointer",
                activeMenuId === "discovery" && "rounded-lg"
              )}
              onClick={() => handleMenuClick("discovery")}
            >
              <div className={cn(
                "h-9 w-9 flex items-center justify-center rounded-full transition-colors",
                activeMenuId === "discovery" 
                  ? "bg-[#F1F0EF] dark:bg-[#27272A]" 
                  : "group-hover:bg-[#ECEDEE]/50 dark:group-hover:bg-[#27272A]/70"
              )}>
                <Compass className={cn(
                  "h-[1.125rem] w-[1.125rem]",
                  activeMenuId === "discovery"
                    ? "text-[rgb(95,94,91)] dark:text-gray-200"
                    : "text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300"
                )} />
              </div>
              <span className={cn(
                "text-[0.6875rem] mt-1",
                activeMenuId === "discovery" && "text-[rgb(95,94,91)] dark:text-gray-200 font-medium"
              )}>发现</span>
            </div>
          ) : (
            <div
              className={cn(
                "w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer",
                activeMenuId === "discovery"
                  ? "bg-[#F1F0EF] text-[rgb(95,94,91)] dark:bg-[#27272A] dark:text-gray-200"
                  : "hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 text-[rgb(95,94,91)] dark:text-gray-300"
              )}
              onClick={() => handleMenuClick("discovery")}
            >
              <Compass className={cn(
                "h-[1rem] w-[1rem] mr-3",
                activeMenuId === "discovery"
                  ? "text-[rgb(95,94,91)] dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )} />
              <span>发现</span>
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
                <MoreHorizontal className="h-[1.125rem] w-[1.125rem] text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-[0.6875rem] mt-1">更多</span>
            </div>
          ) : (
            <div
              ref={moreButtonRef}
              className="w-full flex items-center rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-[#ECEDEE]/50 dark:hover:bg-[#27272A]/70 transition-colors cursor-pointer relative"
              onMouseEnter={handleMenuShow}
              onMouseLeave={handleMenuHide}
            >
              <MoreHorizontal className="h-[1rem] w-[1rem] mr-3 text-gray-600 dark:text-gray-400" />
              <span>更多</span>
            </div>
          )}
        </nav>
      </section>
      
      {/* 底部图标导航栏 */}
      <footer className={cn(
        "border-t border-gray-200 dark:border-gray-800 py-2 overflow-hidden mt-auto",
        collapsed 
          ? "flex flex-col items-center space-y-3 px-0 py-3" 
          : "flex justify-around items-center px-1"
      )}>
        <Link href="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272A] cursor-pointer">
          <Home className="h-[1.125rem] w-[1.125rem] text-gray-600 dark:text-gray-400" />
        </Link>
        <ComingSoon>
          <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272A] cursor-pointer">
            <HelpCircle className="h-[1.125rem] w-[1.125rem] text-gray-600 dark:text-gray-400" />
          </div>
        </ComingSoon>
        <ComingSoon>
          <ThemeToggle />
        </ComingSoon>
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
              
              <ComingSoon className="w-full">
                <div className="block" onClick={() => handleMenuClick("knowledge-base") }>
                  <div className={cn(
                    "w-full px-3 py-2 text-left rounded-lg flex items-center gap-3 group transition-colors cursor-pointer",
                    activeMenuId === "knowledge-base"
                      ? "bg-primary/10 dark:bg-[#27272A]"
                      : "hover:bg-gray-50 dark:hover:bg-[#27272A]/70"
                  )}>
                    <BookOpen className={cn(
                      "h-[1rem] w-[1rem]",
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
              </ComingSoon>
              
              <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
              
              
              <ComingSoon className="w-full">
                <div className="block" onClick={() => handleMenuClick("feedback") }>
                  <div className={cn(
                    "w-full px-3 py-2 text-left rounded-lg flex items-center gap-3 group transition-colors cursor-pointer",
                    activeMenuId === "feedback"
                      ? "bg-primary/10 dark:bg-[#27272A]"
                      : "hover:bg-gray-50 dark:hover:bg-[#27272A]/70"
                  )}>
                    <MessageSquare className={cn(
                      "h-[1rem] w-[1rem]",
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
              </ComingSoon>
              
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
} 