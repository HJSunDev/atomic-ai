import React, { useState } from "react";
import { ChatSidebar } from "./_components/ChatSidebar";
import { ChatContent } from "./_components/ChatContent";

// 聊天模块主组件
export const ChatModule = () => {
  // 添加状态控制侧边栏显示
  const [showSidebar, setShowSidebar] = useState(true);
  
  // 切换侧边栏
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  return (
    <div className="h-full flex bg-white dark:bg-[#202020]">
      {/* 聊天侧边栏 - 根据状态显示或隐藏 */}
      {showSidebar && <ChatSidebar onToggle={toggleSidebar} />}
      
      {/* 聊天内容区域 - 直接占满剩余空间 */}
      <ChatContent showSidebar={showSidebar} onToggleSidebar={toggleSidebar} />
    </div>
  );
};
