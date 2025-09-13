import React, { useEffect } from "react";
import { MoreVertical, ChevronDown, Edit, Star, StarOff, Trash2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/home/useChatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useChatHistory } from "@/hooks/useChatHistory";

// 最近聊天记录列表组件
export function RecentChatList({ searchQuery }: { searchQuery: string }) {
  const { currentConversationId, startNewConversation } = useChatStore();

  const {
    conversationData,
    searchResults,
    isLoading,
    isSearching,
    searchValue,
    setSearchValue,
    openMenuConversationId,
    setOpenMenuConversationId,
    editingConversationId,
    editingTitle,
    setEditingTitle,
    showAllFavorites,
    setShowAllFavorites,
    inputRef,
    handleEditTitle,
    handleTitleSubmit,
    handleKeyDown,
    handleToggleFavorite,
    handleDeleteConversation,
    handleSelectConversation,
  } = useChatHistory({
    onBeforeDeleteCurrent: () => {
      startNewConversation();
    },
  });

  // 将外部传入的搜索词同步到 Hook 内部的搜索状态
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery, setSearchValue]);
  
  // 渲染单个会话项的函数
  const renderConversationItem = (conversation: Doc<"conversations">) => {
    
    // 判断当前会话项是否被选中（使用全局状态）
    const isSelected = currentConversationId === conversation._id;
    // 判断当前会话项的操作菜单是否处于打开状态
    const isMenuOpen = openMenuConversationId === conversation._id;
    // 判断当前会话项是否被收藏，未设置时默认为 false
    const isFavorited = conversation.isFavorited || false;
    // 判断当前会话项是否处于编辑标题模式
    const isEditing = editingConversationId === conversation._id;

    return (
      <div
        key={conversation._id}
        className={cn(
          "group flex items-center p-[7px] mx-[6px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-[#27272A]",
          isSelected && !isEditing && "bg-gray-100 dark:bg-[#27272A]", // 非编辑时才应用选中样式
          isMenuOpen && !isEditing && "bg-gray-100 dark:bg-[#27272A]"
        )}
        onClick={() => {
          if (!isEditing) {
            handleSelectConversation(conversation._id)
          }
        }}
      >
        {isEditing ? (
          <>
            <Input
              ref={inputRef}
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="text-[14px] font-normal flex-1 truncate border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 h-[1.125rem] leading-[1.125rem] selection:bg-gray-200 dark:selection:bg-gray-600 selection:text-inherit rounded-none text-[#262626]"
              onClick={(e) => e.stopPropagation()} // 防止事件冒泡
            />
            
            {/* AI 功能占位符 - 放在原操作按钮位置 */}
            <div className="ml-auto p-[7px] rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              <Wand2 className="w-3 h-3 text-[#947CF1] cursor-pointer" 
                     onClick={(e) => {
                       e.stopPropagation();
                       console.log("AI 建议标题功能占位");
                     }} />
            </div>
          </>
        ) : (
          <>
            <span className="text-[14px] font-normal text-[#262626] flex-1 truncate">
              {conversation.title || "无标题对话"}
            </span>
            
            {/* 操作下拉菜单 */}
            <DropdownMenu onOpenChange={(open) => {
              if (!open && isMenuOpen) { // 仅在菜单关闭时更新状态
                  setOpenMenuConversationId(null);
              } else if (open) {
                  setOpenMenuConversationId(conversation._id);
              }
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
              <DropdownMenuContent align="center" className="w-36 py-2 dark:bg-[#202020] dark:border-gray-700">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  handleEditTitle(conversation);
                }} className="cursor-pointer">
                  <Edit className="w-4 h-4 mr-2" />
                  编辑对话标题
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(conversation._id, isFavorited);
                  }}
                  className="cursor-pointer"
                >
                  {isFavorited ? (
                    <>
                      <StarOff className="w-4 h-4 mr-2" />
                      取消收藏
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      添加到收藏
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conversation._id);
                  }}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除对话
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    );
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (!searchResults) return null;

    return (
      <section className="mt-5">
        <div className="px-3 py-2 text-[16px] font-semibold text-[#262626]">
          搜索结果 {searchResults.length > 0 && `(${searchResults.length})`}
        </div>
        
        {searchResults.length === 0 ? (
          <div className="p-3 text-center text-xs text-gray-500">
            没有找到匹配的聊天记录
          </div>
        ) : (
          <div className="space-y-1">
            {searchResults.map(renderConversationItem)}
          </div>
        )}
      </section>
    );
  };

  // 渲染收藏区域
  const renderFavoritesSection = () => {
    if (!conversationData?.favorited) return null;

    // 获取所有被收藏的会话
    const favoritedConversations = conversationData.favorited;
    // 根据 showAllFavorites 状态决定展示全部还是前3个收藏会话
    const displayedFavorites = showAllFavorites ? favoritedConversations : favoritedConversations.slice(0, 3);
    // 判断收藏会话数量是否超过3个，用于显示"更多/收起"按钮
    const hasMoreFavorites = favoritedConversations.length > 3;

    return (
      <section className="mt-2">
        <div className="px-3 py-2 text-[16px] font-semibold text-[#262626]">收藏</div>
        
        {favoritedConversations.length === 0 ? (
          <div className="p-3 text-center text-xs text-gray-500">
            暂无收藏
          </div>
        ) : (
          <>
            {/* 渲染收藏的会话 */}
            {displayedFavorites.map(renderConversationItem)}
            
            {/* 展开/收起更多收藏 */}
            {hasMoreFavorites && (
              <div 
                className="flex items-center px-[7px] cursor-pointer"
                onClick={() => setShowAllFavorites(!showAllFavorites)}
              >
                <span className="text-[14px] font-normal text-[#8c8c8c] pl-1">
                  {showAllFavorites ? "收起" : `更多(${favoritedConversations.length - 3})`}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 ml-1 text-[#8c8c8c] transition-transform",
                  showAllFavorites && "rotate-180"
                )} />
              </div>
            )}
          </>
        )}
      </section>
    );
  };
  
  // 渲染最近聊天区域
  const renderRecentChatsSection = () => {
    // 如果没有分组的会话数据，则不渲染最近聊天区域
    if (!conversationData?.grouped) return null;

    // 获取分组后的会话数据
    const groupedConversations = conversationData.grouped;

    if (groupedConversations.length === 0) {
      return (
        <section className="mt-5 mb-3">
          <div className="px-3 py-2 text-[16px] font-semibold text-[#262626]">最近</div>
          <div className="p-3 text-center text-xs text-gray-500">
            暂无聊天记录
          </div>
        </section>
      );
    }

    return (
      <section className="mt-2">
        <div className="px-3 py-2 text-[16px] font-semibold text-[#262626] flex items-center justify-between">
          <span>最近</span>
          <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" />
        </div>
        
        {groupedConversations.map((group: { groupName: string; conversations: Doc<"conversations">[] }) => (
          <div key={group.groupName}>
            {/* 渲染分组标题, e.g., '今天', '7天内' */}
            <div className="px-3 text-[12px] font-normal text-[#8c8c8c]">{group.groupName}</div>
            
            {/* 渲染该分组下的所有会话 */}
            {group.conversations.map(renderConversationItem)}
          </div>
        ))}
      </section>
    );
  };

  // 渲染加载状态的骨架屏
  const renderLoadingSkeleton = () => (
    <>
      {/* 收藏区域骨架屏 */}
      <section className="mt-5">
        <div className="px-3 py-2">
          <Skeleton className="h-4 w-8 bg-gray-300 dark:bg-gray-600" />
        </div>
        <div className="space-y-1">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center p-[7px] mx-2">
              <Skeleton className="h-3 w-20 flex-1 bg-gray-300 dark:bg-gray-600" />
              <Skeleton className="h-3 w-3 ml-2 bg-gray-300 dark:bg-gray-600" />
            </div>
          ))}
        </div>
      </section>

      {/* 最近聊天区域骨架屏 */}
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
    </>
  );

  // 主渲染逻辑

  // 1. 统一处理加载状态，这是最优先的判断
  if (isLoading) {
    return renderLoadingSkeleton();
  }

  // 2. 处理搜索模式下的成功渲染
  if (isSearching) {
    return renderSearchResults();
  }

  // 3. 最后处理正常模式下的成功渲染（作为默认情况）
  // (经过了前面的判断，代码执行到这里时，conversationData 肯定已经加载好了)
  return (
    <>
      {/* 收藏区域 */}
      {renderFavoritesSection()}

      {/* 最近聊天区域 */}
      {renderRecentChatsSection()}
    </>
  );
} 