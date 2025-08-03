import React, { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollView } from "@/components/custom";
import { AiModelList } from "./AiModelList";
import { RecentChatList } from "./RecentChatList";

// 聊天侧边栏组件
export const ChatSidebar = ({ onToggle }: { onToggle: () => void }) => {
  // 搜索状态管理
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <ScrollView
      as="main"
      className="w-[13.5rem] h-full border-r bg-white dark:bg-[#202020] flex flex-col"
      scrollbarConfig={{
        thumbWidth: 5,
        thumbColor: "rgba(156, 163, 175, 0.6)",
        trackColor: "transparent",
        autoHide: true,
      }}
    >
      {/* 顶部搜索和折叠区域 */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#202020] pt-3 pb-3 pl-3 pr-1 flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="搜索聊天记录" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[2rem] pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-[#27272A] text-sm placeholder:text-xs border-0 focus-visible:ring-1 focus-visible:ring-[#947CF1] focus-visible:border-[#947CF1]"
          />
        </div>
        <button 
          onClick={onToggle}
          className="ml-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#27272A] cursor-pointer"
          title="收起聊天侧边栏"
        >
          <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" width="20" height="20" fill="none" viewBox="0 0 20 20">
            <g>
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M2.167 6.667A2.833 2.833 0 0 1 5 3.833h2.708v12.334H5a2.833 2.833 0 0 1-2.833-2.834V6.667ZM9.042 17.5H5a4.167 4.167 0 0 1-4.167-4.167V6.667A4.167 4.167 0 0 1 5 2.5h10a4.167 4.167 0 0 1 4.167 4.167v6.666A4.167 4.167 0 0 1 15 17.5H9.042Zm0-13.667H15a2.833 2.833 0 0 1 2.833 2.834v6.666A2.833 2.833 0 0 1 15 16.167H9.042V3.833ZM3.583 6.5c0-.368.336-.667.75-.667H5.75c.414 0 .75.299.75.667 0 .368-.336.667-.75.667H4.333c-.414 0-.75-.299-.75-.667Zm.75 1.833c-.414 0-.75.299-.75.667 0 .368.336.667.75.667H5.75c.414 0 .75-.299.75-.667 0-.368-.336-.667-.75-.667H4.333Z" 
                fill="currentColor"
              />
            </g>
          </svg>
        </button>
      </header>
      
      {/* AI模型列表 */}
      <AiModelList />
      
      {/* 聊天记录列表 */}
      <RecentChatList searchQuery={searchQuery} />

    </ScrollView>
  );
}; 