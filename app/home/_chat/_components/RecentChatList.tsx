import React, { useState } from "react";
import { Loader2, MoreVertical, ChevronDown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id, Doc } from "@/convex/_generated/dataModel";

// 最近聊天记录列表组件
export function RecentChatList() {
  // 1. 使用新的query获取按时间分组的会话
  const groupedConversations = useQuery(api.chat.queries.listGroupedByTime);
  
  // 2. 维护当前选中的会话ID (后续可接入全局状态管理)
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);

  // 渲染单个会话项的函数, 样式参考 AiModelList
  const renderConversationItem = (conversation: Doc<"conversations">) => {
    const isSelected = selectedConversationId === conversation._id;
    return (
      <div
        key={conversation._id}
        className={cn(
          "group flex items-center p-[7px] mx-2 my-0.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-[#27272A]",
          isSelected && "bg-gray-100 dark:bg-[#27272A]"
        )}
        onClick={() => setSelectedConversationId(conversation._id)}
      >
        <span className="text-xs font-medium flex-1 truncate">
          {conversation.title || "无标题对话"}
        </span>
        <div
          className={cn(
            "ml-auto p-[7px] rounded-md transition-all opacity-0 group-hover:opacity-100",
            "hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
          onClick={(e) => {
            e.stopPropagation(); // 防止触发外层div的onClick
            // TODO: 在此实现更多操作菜单功能
          }}
        >
          <MoreVertical className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    );
  };

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
      {(() => {
        // 3. 处理加载状态
        if (groupedConversations === undefined) {
          return (
            <section className="mt-5 mb-3">
              <div className="px-3 py-2 text-sm font-medium">最近</div>
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                <span className="ml-2 text-sm text-gray-500">加载中...</span>
              </div>
            </section>
          );
        }
        
        // 4. 处理无聊天记录的情况
        if (groupedConversations.length === 0) {
          return (
            <section className="mt-5 mb-3">
              <div className="px-3 py-2 text-sm font-medium">最近</div>
              <div className="p-3 text-center text-xs text-gray-500">
                暂无聊天记录
              </div>
            </section>
          );
        }

        return (
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
      })()}
    </>
  );
} 