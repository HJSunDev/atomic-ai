import React, { useState } from "react";
import { Search, MoreVertical, Edit, Star, StarOff, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/home/useChatStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useChatHistory } from "@/hooks/useChatHistory";

interface ChatHistoryProps {
  children: React.ReactNode;
  onSheetToggle?: (open: boolean) => void; // 抽屉开关状态回调
}

// 聊天历史记录抽屉组件
export function ChatHistory({ children, onSheetToggle, ...props }: ChatHistoryProps & React.HTMLAttributes<HTMLButtonElement>) {
  // 控制抽屉开关状态
  const [isOpen, setIsOpen] = useState(false);
  
  // 处理抽屉开关状态变化
  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
    onSheetToggle?.(open); // 通知父组件状态变化
  };
  
  // 全局：用于高亮当前会话与删除当前会话时回退
  const { currentConversationId, startNewConversation } = useChatStore();

  // 统一业务逻辑：复用 useChatHistory
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
    onConversationSelect: () => handleSheetOpenChange(false),
    onBeforeDeleteCurrent: () => startNewConversation(),
  });
  
  // 渲染单个会话项
  const renderConversationItem = (conversation: Doc<"conversations">) => {
    const isSelected = currentConversationId === conversation._id;
    const isMenuOpen = openMenuConversationId === conversation._id;
    const isFavorited = conversation.isFavorited || false;
    const isEditing = editingConversationId === conversation._id;
    
    return (
      <div
        key={conversation._id}
        className={cn(
          "group flex items-center p-[7px] mx-[6px] rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-[#27272A]",
          isSelected && !isEditing && "bg-gray-100 dark:bg-[#27272A]",
          isMenuOpen && !isEditing && "bg-gray-100 dark:bg-[#27272A]"
        )}
        onClick={() => {
          if (!isEditing) {
            handleSelectConversation(conversation._id);
          }
        }}
      >
        <div className="flex-1 min-w-0 overflow-hidden">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="text-[14px] font-normal flex-1 truncate border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 h-[1.125rem] leading-[1.125rem] selection:bg-gray-200 dark:selection:bg-gray-600 selection:text-inherit rounded-none text-[#262626] dark:text-gray-200"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[14px] font-normal truncate transition-colors",
                  "text-[#262626] dark:text-gray-200"
                )}>
                  {conversation.title || "无标题对话"}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* 操作菜单 - 仅hover或菜单打开时显示 */}
        <DropdownMenu onOpenChange={(open) => {
          if (!open && isMenuOpen) {
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
                (isMenuOpen || isSelected) && "opacity-100" // 选中时也稍微显示，或者保持只在hover显
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-3 h-3 text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 py-2 dark:bg-[#202020] dark:border-gray-700">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleEditTitle(conversation);
              }}
              className="cursor-pointer text-xs"
            >
              <Edit className="w-3.5 h-3.5 mr-2 opacity-70" />
              重命名
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(conversation._id, isFavorited);
              }}
              className="cursor-pointer text-xs"
            >
              {isFavorited ? (
                <>
                  <StarOff className="w-3.5 h-3.5 mr-2 opacity-70" />
                  取消收藏
                </>
              ) : (
                <>
                  <Star className="w-3.5 h-3.5 mr-2 opacity-70" />
                  添加到收藏
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteConversation(conversation._id);
              }}
              className="text-destructive focus:text-destructive cursor-pointer text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2 opacity-70" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  
  // 渲染搜索结果
  const renderSearchResults = () => {
    if (!searchResults) return null;

    return (
      <div className="pb-4 mt-5">
        <h3 className="px-3 py-2 text-[16px] font-semibold text-[#262626] dark:text-gray-200 mb-2 mt-2">
          搜索结果 {searchResults.length > 0 && `(${searchResults.length})`}
        </h3>
        
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-sm">
              没有找到匹配的对话
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {searchResults.map(renderConversationItem)}
          </div>
        )}
      </div>
    );
  };
  
  // 渲染收藏区域
  const renderFavoritesSection = () => {
    if (!conversationData?.favorited || conversationData.favorited.length === 0) {
      return null;
    }
    
    const favoritedConversations = conversationData.favorited;
    const displayedFavorites = showAllFavorites ? favoritedConversations : favoritedConversations.slice(0, 5); // 增加默认显示数量
    const hasMoreFavorites = favoritedConversations.length > 5;
    
    return (
      <div className="mt-2 mb-4">
        <h3 className="px-3 py-2 text-[16px] font-semibold text-[#262626] dark:text-gray-200">收藏</h3>
        
        <div className="space-y-0.5">
          {displayedFavorites.map(renderConversationItem)}
        </div>
        
        {hasMoreFavorites && (
          <div
            className="flex items-center px-[7px] mx-[6px] cursor-pointer mt-1"
            onClick={() => setShowAllFavorites(!showAllFavorites)}
          >
             <span className="flex items-center text-[14px] font-normal text-[#8c8c8c] pl-1">
                {showAllFavorites ? "收起" : `查看更多 (${favoritedConversations.length - 5})`}
                <ChevronDown className={cn(
                  "w-3 h-3 ml-1 transition-transform duration-200",
                  showAllFavorites && "rotate-180"
                )} />
             </span>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染最近聊天区域
  const renderRecentChatsSection = () => {
    if (!conversationData?.grouped || conversationData.grouped.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-muted-foreground text-sm">
            暂无聊天记录
          </div>
        </div>
      );
    }
    
    const groupedConversations = conversationData.grouped;
    
    return (
      <div className="mt-2">
        <div className="px-3 py-2 text-[16px] font-semibold text-[#262626] dark:text-gray-200 flex items-center justify-between">
           <span>最近</span>
           {/* <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" /> */}
        </div>
        {groupedConversations.map((group: { groupName: string; conversations: Doc<"conversations">[] }) => (
          <div key={group.groupName} className="mb-2">
            <div className="px-3 text-[12px] font-normal text-[#8c8c8c] py-1">
              {group.groupName}
            </div>
            <div className="space-y-0.5">
              {group.conversations.map(renderConversationItem)}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染加载状态
  const renderLoadingSkeleton = () => (
    <div className="space-y-6 px-2 mt-5">
      {/* 收藏区域骨架屏 */}
      <div>
        <Skeleton className="h-4 w-12 mb-3 mx-3 opacity-50" />
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center px-3 py-2">
              <Skeleton className="h-3 w-32 opacity-60" />
            </div>
          ))}
        </div>
      </div>
      
      {/* 最近聊天区域骨架屏 */}
      <div>
        <Skeleton className="h-4 w-12 mb-3 mx-3 opacity-50" />
        <div className="space-y-4">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex}>
              <div className="space-y-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center px-3 py-2">
                    <Skeleton className="h-3 w-40 opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild {...props}>
        {children}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-80 sm:w-96 p-0 gap-0 flex flex-col border-l border-border/40 shadow-2xl"
      >
        <SheetHeader className="px-5 py-4 shrink-0">
          <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
             历史记录
          </SheetTitle>
        </SheetHeader>
        
        {/* 搜索框 - 优化为 Notion 风格 */}
        <div className="px-4 pb-2 shrink-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="搜索对话..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-9 bg-secondary/50 hover:bg-secondary/80 focus-visible:bg-secondary border-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded-md placeholder:text-muted-foreground/60 text-sm"
            />
          </div>
        </div>
        
        {/* 聊天列表 - 滚动区域 */}
        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {isLoading ? (
            renderLoadingSkeleton()
          ) : isSearching ? (
            renderSearchResults()
          ) : (
            <>
              {renderFavoritesSection()}
              {renderRecentChatsSection()}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}