import React, { useState } from "react";
import { MoreVertical, ChevronDown, Edit, Star, Trash2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id, Doc } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// 最近聊天记录列表组件
export function RecentChatList() {
  // 1. 使用新的query获取按时间分组的会话
  const groupedConversations = useQuery(api.chat.queries.listGroupedByTime);
  
  // 2. 维护当前选中的会话ID (后续可接入全局状态管理)
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  
  // 3. 维护当前打开下拉菜单的会话ID
  const [openMenuConversationId, setOpenMenuConversationId] = useState<Id<"conversations"> | null>(null);

  // 处理编辑对话标题
  const handleEditTitle = (conversationId: Id<"conversations">) => {
    console.log("编辑对话标题:", conversationId);
    // TODO: 实现编辑标题功能
  };

  // 处理添加到收藏
  const handleAddToFavorites = (conversationId: Id<"conversations">) => {
    console.log("添加到收藏:", conversationId);
    // TODO: 实现收藏功能
  };

  // 处理删除对话
  const handleDeleteConversation = (conversationId: Id<"conversations">) => {
    console.log("删除对话:", conversationId);
    // TODO: 实现删除功能
  };
  
  // 渲染单个会话项的函数, 样式参考 AiModelList
  const renderConversationItem = (conversation: Doc<"conversations">) => {
    const isSelected = selectedConversationId === conversation._id;
    const isMenuOpen = openMenuConversationId === conversation._id;
    
    return (
      <div
        key={conversation._id}
        className={cn(
          "group flex items-center p-[7px] mx-2 my-0.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-[#27272A]",
          isSelected && "bg-gray-100 dark:bg-[#27272A]",
          isMenuOpen && "bg-gray-100 dark:bg-[#27272A]" // 菜单打开时保持激活状态
        )}
        onClick={() => setSelectedConversationId(conversation._id)}
      >
        <span className="text-xs font-medium flex-1 truncate">
          {conversation.title || "无标题对话"}
        </span>
        
        {/* 操作下拉菜单 */}
        <DropdownMenu onOpenChange={(open) => {
          setOpenMenuConversationId(open ? conversation._id : null);
        }}>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "ml-auto p-[7px] rounded-md transition-all opacity-0 group-hover:opacity-100",
                "hover:bg-gray-200 dark:hover:bg-gray-700",
                isMenuOpen && "opacity-100 bg-gray-200 dark:bg-gray-700" // 菜单打开时保持激活状态
              )}
              onClick={(e) => {
                e.stopPropagation(); // 防止触发外层div的onClick
              }}
            >
              <MoreVertical className="w-3 h-3 text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-36 py-2">
            <DropdownMenuItem onClick={() => handleEditTitle(conversation._id)} className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" />
              编辑对话标题
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddToFavorites(conversation._id)} className="cursor-pointer">
              <Star className="w-4 h-4 mr-2" />
              添加到收藏
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDeleteConversation(conversation._id)}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除对话
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  
  let recentChatsContent;
  // 处理加载状态
  if (groupedConversations === undefined) {
    recentChatsContent = (
      <section className="mt-5 mb-3">
        {/* 标题区域骨架屏 */}
        <div className="px-3 py-2 flex items-center justify-between">
          <Skeleton className="h-4 w-8 bg-gray-300 dark:bg-gray-600" />
          <Skeleton className="h-4 w-4 bg-gray-300 dark:bg-gray-600" />
        </div>
        
        {/* 模拟分组骨架屏 */}
        <div className="space-y-4">
          {/* 第一个分组 */}
          <div>
            {/* 分组标题骨架屏 */}
            <div className="px-3 py-1">
              <Skeleton className="h-3 w-8 bg-gray-300 dark:bg-gray-600" />
            </div>
            {/* 会话项骨架屏 */}
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center p-[7px] mx-2">
                  <Skeleton className="h-3 w-24 flex-1 bg-gray-300 dark:bg-gray-600" />
                  <Skeleton className="h-3 w-3 ml-2 bg-gray-300 dark:bg-gray-600" />
                </div>
              ))}
            </div>
          </div>
          
          {/* 第二个分组 */}
          <div>
            {/* 分组标题骨架屏 */}
            <div className="px-3 py-1">
              <Skeleton className="h-3 w-12 bg-gray-300 dark:bg-gray-600" />
            </div>
            {/* 会话项骨架屏 */}
            <div className="space-y-1">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center p-[7px] mx-2">
                  <Skeleton className="h-3 w-20 flex-1 bg-gray-300 dark:bg-gray-600" />
                  <Skeleton className="h-3 w-3 ml-2 bg-gray-300 dark:bg-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  } 
  // 处理无聊天记录的情况
  else if (groupedConversations.length === 0) {
    recentChatsContent = (
      <section className="mt-5 mb-3">
        <div className="px-3 py-2 text-sm font-medium">最近</div>
        <div className="p-3 text-center text-xs text-gray-500">
          暂无聊天记录
        </div>
      </section>
    );
  } 
  // 处理有数据的情况
  else {
    recentChatsContent = (
      <section className="mt-5 mb-3">
        <div className="px-3 py-2 text-sm font-medium flex items-center justify-between">
          <span>最近</span>
          <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
        
        {groupedConversations.map((group) => (
          <div key={group.groupName}>
            {/* 渲染分组标题, e.g., '今天', '7天内' */}
            <div className="px-3 py-1 text-xs text-gray-500">{group.groupName}</div>
            
            {/* 渲染该分组下的所有会话 */}
            {group.conversations.map(renderConversationItem)}
          </div>
        ))}
      </section>
    );
  }

  return (
    <>
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
      {recentChatsContent}
    </>
  );
} 