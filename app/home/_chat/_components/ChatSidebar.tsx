import React from "react";
import { Search, ChevronDown, Star, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollView } from "@/components/custom";

// 聊天侧边栏组件
export const ChatSidebar = ({ onToggle }: { onToggle: () => void }) => {
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
      <section>
        {/* Monica */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-500"></div>
          </div>
          <span className="text-sm font-medium">Monica</span>
        </div>
        
        {/* Claude 3.7 Sonnet */}
        <div className="flex items-center p-3 bg-gray-50 dark:bg-[#27272A] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">Claude 3.7 Sonnet</span>
          <Star className="w-4 h-4 ml-auto text-blue-500 fill-blue-500 dark:text-gray-300 dark:fill-gray-300" />
        </div>
        
        {/* DeepSeek R1 */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">DeepSeek R1</span>
          <Star className="w-4 h-4 ml-auto text-blue-500 fill-blue-500 dark:text-gray-300 dark:fill-gray-300" />
        </div>
        
        {/* DeepSeek V3 */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
          <span className="text-sm font-medium">DeepSeek V3</span>
          <Star className="w-4 h-4 ml-auto text-blue-500 fill-blue-500 dark:text-gray-300 dark:fill-gray-300" />
        </div>
        
        {/* GPT-4o */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-gray-800 dark:bg-gray-700 flex items-center justify-center mr-2"></div>
          <span className="text-sm font-medium">GPT-4o</span>
        </div>
        
        {/* 更多 */}
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm text-gray-500 pl-1">更多</span>
          <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
        </div>
      </section>
      
      {/* 收藏区域 */}
      <section className="mt-5">
        <div className="px-3 py-2 text-sm font-medium">收藏</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">购房财务报告</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm text-gray-500 pl-1">更多</span>
          <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
        </div>
      </section>
      
      {/* 最近聊天区域 */}
      <section className="mt-5 mb-3">
        <div className="px-3 py-2 text-sm font-medium flex items-center justify-between">
          <span>最近</span>
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </div>
        
        {/* 7天内 */}
        <div className="px-3 py-1 text-xs text-gray-500">7天内</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">帮助commit信息</span>
          <MoreVertical className="w-4 h-4 ml-auto text-gray-400 opacity-0 group-hover:opacity-100" />
        </div>
        
        {/* 30天内 */}
        <div className="px-3 py-1 text-xs text-gray-500">30天内</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">专业人事顾问服务</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">dnd-kit 拖拽库使用介绍</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">Zustand 在 Next.js 应用中的...</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">@dnd-kit/core 模块介绍</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">前端开发工作产品构思</span>
        </div>
        
        {/* 更远 */}
        <div className="px-3 py-1 text-xs text-gray-500">更远</div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">使用Tailwind CSS实现响应式...</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">心理需求与情绪分析</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">soulpilot应用git</span>
        </div>
        <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[#2B2B2D] cursor-pointer">
          <span className="text-sm">和室友沟通</span>
        </div>
      </section>
    </ScrollView>
  );
}; 