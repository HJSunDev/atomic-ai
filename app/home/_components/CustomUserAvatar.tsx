"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { 
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";

interface CustomUserAvatarProps {
  size?: "sm" | "md" | "lg";
  showMenu?: boolean;
  menuPosition?: "left" | "right" | "bottom";
}

export function CustomUserAvatar({ 
  size = "md", 
  showMenu = true,
  menuPosition = "bottom"
}: CustomUserAvatarProps) {
  // 获取用户信息
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();
  
  // 控制菜单显示状态
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 菜单引用，用于点击外部关闭
  const menuRef = useRef<HTMLDivElement>(null);
  // 用户头像引用
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 用于portal的状态
  const [mounted, setMounted] = useState(false);
  // 存储菜单位置
  const [menuPosition2, setMenuPosition2] = useState({ top: 0, left: 0 });
  // 控制菜单是否准备好显示（位置计算完成）
  const [menuReady, setMenuReady] = useState(false);

  // 客户端挂载后才能使用portal
  useEffect(() => {
    setMounted(true);
    
    // 确保组件卸载时关闭菜单
    return () => {
      setIsMenuOpen(false);
      setMenuReady(false);
    };
  }, []);

  // 当菜单打开时，计算位置
  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      // 先将menuReady设为false，防止闪烁
      setMenuReady(false);
      
      // 获取位置并更新
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition2({
        top: rect.bottom + window.scrollY + 4, // 头像下方4px
        left: rect.left + window.scrollX // 左对齐
      });
      
      // 在下一帧设置menuReady为true，允许显示菜单
      requestAnimationFrame(() => {
        setMenuReady(true);
      });
    } else {
      // 菜单关闭时，重置menuReady状态
      setMenuReady(false);
    }
  }, [isMenuOpen]);

  // 处理点击外部关闭菜单
  useOnClickOutside<HTMLDivElement>(menuRef, () => setIsMenuOpen(false));

  // 尺寸映射
  const sizeMap = {
    sm: {
      avatar: "w-6 h-6",
      menu: "w-64"
    },
    md: {
      avatar: "w-8 h-8",
      menu: "w-64"
    },
    lg: {
      avatar: "w-10 h-10",
      menu: "w-64"
    }
  };

  // 处理菜单切换
  const toggleMenu = () => {
    if (showMenu) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  // 处理登出 - 使用Clerk的signOut方法
  const handleSignOut = async () => {
    await signOut(() => router.push('/'));
  };

  // 处理打开用户配置
  const handleOpenProfile = () => {
    openUserProfile();
    setIsMenuOpen(false);
  };

  // 菜单内容
  const menuContent = (
    <div 
      ref={menuRef}
      className={cn(
        "fixed z-[9999] py-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 opacity-0 transition-opacity duration-150",
        menuReady && "opacity-100", // 只有当menuReady为true时才显示菜单
        sizeMap[size].menu
      )}
      style={{
        top: `${menuPosition2.top}px`,
        left: `${menuPosition2.left}px`,
        pointerEvents: menuReady ? 'auto' : 'none' // 防止在未准备好时被点击
      }}
    >
      {/* 用户信息头部区域 */}
      <div className="p-4 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-700">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {user?.imageUrl ? (
              <Image 
                src={user.imageUrl} 
                alt={user?.fullName || "用户头像"} 
                width={40} 
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{user?.fullName || "华江"}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {user?.primaryEmailAddress?.emailAddress || 'sunhuajiang7@gmail.com'}
          </div>
        </div>
      </div>
      
      {/* 功能区域 */}
      <div className="py-2">
        {/* 功能按钮 */}
        <div className="space-y-1 px-1">
          <button 
            onClick={handleOpenProfile}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center">
              <Settings className="mr-3 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
              <span>我的账户</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </button>
          
          <Link href="/help" className="block">
            <div className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg flex items-center justify-between group transition-colors">
              <div className="flex items-center">
                <HelpCircle className="mr-3 h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                <span>帮助中心</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </div>
          </Link>
        </div>
        
        <div className="mt-2 pt-2 px-1 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-red-600 dark:text-red-400 flex items-center transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* 用户头像 */}
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        className={cn(
          "rounded-full overflow-hidden border border-gray-200 dark:border-gray-700",
          sizeMap[size].avatar
        )}
      >
        {isLoaded && isSignedIn && user?.imageUrl ? (
          <Image 
            src={user.imageUrl} 
            alt={user.fullName || "用户头像"} 
            width={40} 
            height={40} 
            priority
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </button>

      {/* 使用Portal将菜单渲染到body层级，避免被父容器的overflow:hidden截断 */}
      {mounted && isMenuOpen && showMenu && createPortal(menuContent, document.body)}
    </div>
  );
} 