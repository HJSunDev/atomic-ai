"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { 
  User,
  Settings,
  LogOut,
  ArrowLeftRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  // 用户头像引用，用于计算菜单位置
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 存储计算后的菜单位置
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  // 处理点击外部关闭菜单
  useOnClickOutside<HTMLDivElement>(menuRef, () => setIsMenuOpen(false));

  // 尺寸映射
  const sizeMap = {
    sm: {
      avatar: "w-6 h-6",
      menu: "w-48"
    },
    md: {
      avatar: "w-8 h-8",
      menu: "w-56"
    },
    lg: {
      avatar: "w-10 h-10",
      menu: "w-64"
    }
  };

  // 菜单位置类名映射 - 基础类名
  const positionClassMap = {
    left: "fixed", // 使用fixed定位，不受父容器overflow:hidden影响
    right: "fixed", // 使用fixed定位，不受父容器overflow:hidden影响
    bottom: "fixed"  // 使用fixed定位，不受父容器overflow:hidden影响
  };

  // 当菜单打开时，计算菜单位置
  useLayoutEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // 获取菜单宽度
      const menuWidth = menuRef.current ? 
        parseInt(sizeMap[size].menu.replace('w-', '')) * 4 : 192; // 默认值为w-48的实际像素
      
      // 获取菜单高度（估计值，实际应该通过ref获取）
      const menuHeight = 180; // 估计值
      
      let style: React.CSSProperties = {};
      
      switch (menuPosition) {
        case 'left':
          // 如果左侧空间不足，则显示在右侧
          if (buttonRect.left < menuWidth) {
            style = {
              top: buttonRect.top,
              left: buttonRect.right + 5
            };
          } else {
            style = {
              top: buttonRect.top,
              left: buttonRect.left - menuWidth - 5
            };
          }
          break;
        case 'right':
          // 如果右侧空间不足，则显示在左侧
          if (viewportWidth - buttonRect.right < menuWidth) {
            style = {
              top: buttonRect.top,
              left: buttonRect.left - menuWidth - 5
            };
          } else {
            style = {
              top: buttonRect.top,
              left: buttonRect.right + 5
            };
          }
          break;
        case 'bottom':
        default:
          // 计算水平居中位置
          let left = buttonRect.left + (buttonRect.width / 2) - (menuWidth / 2);
          
          // 如果菜单左边缘超出视窗，则调整位置
          if (left < 10) left = 10;
          
          // 如果菜单右边缘超出视窗，则调整位置
          if (left + menuWidth > viewportWidth - 10) {
            left = viewportWidth - menuWidth - 10;
          }
          
          // 如果底部空间不足，则显示在顶部
          if (viewportHeight - buttonRect.bottom < menuHeight) {
            style = {
              top: buttonRect.top - menuHeight - 5,
              left: left
            };
          } else {
            style = {
              top: buttonRect.bottom + 5,
              left: left
            };
          }
          break;
      }
      
      setMenuStyle(style);
    }
  }, [isMenuOpen, size, menuPosition]);

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

      {/* 用户菜单 - Portal到body，避免被父容器的overflow:hidden截断 */}
      {showMenu && isMenuOpen && (
        <div 
          ref={menuRef}
          className={cn(
            "z-50 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700",
            sizeMap[size].menu,
            positionClassMap[menuPosition]
          )}
          style={menuStyle}
        >
          {/* 用户信息 */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="font-medium">{user?.fullName || '未登录用户'}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.primaryEmailAddress?.emailAddress || ''}
            </div>
          </div>
          
          {/* 菜单选项 */}
          <div className="mt-2">
            <button 
              onClick={handleOpenProfile}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>账户设置</span>
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              <span>切换账户</span>
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 