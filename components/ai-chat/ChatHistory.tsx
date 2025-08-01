import React, { useState, useRef, useEffect } from "react";
import { Search, MoreVertical, Edit, Star, StarOff, Trash2, ChevronDown } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id, Doc } from "@/convex/_generated/dataModel";
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
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

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
  
  // 搜索相关状态
  const [searchValue, setSearchValue] = useState("");
  
  // 获取分组会话数据
  const conversationData = useQuery(api.chat.queries.listGroupedByTime);
  
  // 全局聊天状态管理
  const { currentConversationId, selectConversation } = useChatStore();
  
  // 会话操作相关状态
  const [openMenuConversationId, setOpenMenuConversationId] = useState<Id<"conversations"> | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<Id<"conversations"> | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 控制收藏区域的展开/收起状态
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  
  // Convex mutations
  const toggleFavorite = useMutation(api.chat.mutations.toggleConversationFavorite);
  const deleteConversation = useMutation(api.chat.mutations.deleteConversation);
  const updateTitle = useMutation(api.chat.mutations.updateConversationTitle);
  
  // 监听编辑状态变化，自动聚焦输入框
  useEffect(() => {
    if (editingConversationId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingConversationId]);
  
  // 处理编辑对话标题
  const handleEditTitle = (conversation: Doc<"conversations">) => {
    setOpenMenuConversationId(null);
    setEditingConversationId(conversation._id);
    setEditingTitle(conversation.title || "");
  };
  
  // 提交标题修改
  const handleTitleSubmit = async () => {
    if (!editingConversationId || !editingTitle.trim()) {
      setEditingConversationId(null);
      return;
    }
    
    try {
      await updateTitle({
        conversationId: editingConversationId,
        newTitle: editingTitle,
      });
    } catch (error) {
      console.error("更新标题失败:", error);
    } finally {
      setEditingConversationId(null);
    }
  };
  
  // 处理键盘事件
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleTitleSubmit();
    } else if (event.key === "Escape") {
      setEditingConversationId(null);
    }
  };
  
  // 处理收藏/取消收藏
  const handleToggleFavorite = async (conversationId: Id<"conversations">, currentFavoriteStatus: boolean) => {
    try {
      await toggleFavorite({
        conversationId,
        isFavorited: !currentFavoriteStatus,
      });
    } catch (error) {
      console.error("切换收藏状态失败:", error);
    }
  };
  
  // 处理删除对话
  const handleDeleteConversation = async (conversationId: Id<"conversations">) => {
    try {
      await deleteConversation({ conversationId });
    } catch (error) {
      console.error("删除对话失败:", error);
    }
  };
  
  // 处理会话选择
  const handleSelectConversation = (conversationId: Id<"conversations">) => {
    selectConversation(conversationId);
    handleSheetOpenChange(false); // 选择后关闭抽屉
  };
  
  // 渲染单个会话项
  const renderConversationItem = (conversation: Doc<"conversations">) => {
    const isSelected = currentConversationId === conversation._id;
    const isMenuOpen = openMenuConversationId === conversation._id;
    const isFavorited = conversation.isFavorited || false;
    const isEditing = editingConversationId === conversation._id;
    const isCurrent = isSelected; // 当前会话标识
    
    return (
      <div
        key={conversation._id}
        className={cn(
          "group flex items-center p-3 mx-3 my-1 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
          isSelected && !isEditing && "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
          isMenuOpen && !isEditing && "bg-gray-50 dark:bg-gray-800/50"
        )}
        onClick={() => {
          if (!isEditing) {
            handleSelectConversation(conversation._id);
          }
        }}
      >
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleKeyDown}
              className="text-sm font-medium border-none bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 h-auto"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {conversation.title || "无标题对话"}
                </span>
                {isCurrent && (
                  <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                    当前的
                  </span>
                )}
              </div>
              {/* 这里可以添加会话预览文本或时间戳 */}
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {/* 占位符：最后一条消息预览 */}
                点击查看对话详情...
              </span>
            </div>
          )}
        </div>
        
        {/* 操作菜单 */}
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
                "ml-2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100",
                "hover:bg-gray-200 dark:hover:bg-gray-700",
                isMenuOpen && "opacity-100 bg-gray-200 dark:bg-gray-700"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleEditTitle(conversation);
              }}
              className="cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-2" />
              编辑标题
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
      </div>
    );
  };
  
  // 渲染收藏区域
  const renderFavoritesSection = () => {
    if (!conversationData?.favorited || conversationData.favorited.length === 0) {
      return null;
    }
    
    const favoritedConversations = conversationData.favorited;
    const displayedFavorites = showAllFavorites ? favoritedConversations : favoritedConversations.slice(0, 3);
    const hasMoreFavorites = favoritedConversations.length > 3;
    
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 px-3 mb-3">收藏</h3>
        
        <div className="space-y-1">
          {displayedFavorites.map(renderConversationItem)}
        </div>
        
        {hasMoreFavorites && (
          <div
            className="flex items-center p-3 mx-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer rounded-lg mt-2"
            onClick={() => setShowAllFavorites(!showAllFavorites)}
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {showAllFavorites ? "收起" : `查看更多 (${favoritedConversations.length - 3})`}
            </span>
            <ChevronDown className={cn(
              "w-4 h-4 ml-1 text-gray-500 transition-transform",
              showAllFavorites && "rotate-180"
            )} />
          </div>
        )}
      </div>
    );
  };
  
  // 渲染最近聊天区域
  const renderRecentChatsSection = () => {
    if (!conversationData?.grouped || conversationData.grouped.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            暂无聊天记录
          </div>
        </div>
      );
    }
    
    const groupedConversations = conversationData.grouped;
    
    return (
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 px-3 mb-3">最近</h3>
        
        {groupedConversations.map((group) => (
          <div key={group.groupName} className="mb-4">
            <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
              {group.groupName}
            </div>
            <div className="space-y-1">
              {group.conversations.map(renderConversationItem)}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // 渲染加载状态
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {/* 收藏区域骨架屏 */}
      <div>
        <Skeleton className="h-5 w-12 mb-3 mx-3" />
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center p-3 mx-3">
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-4 ml-2" />
            </div>
          ))}
        </div>
      </div>
      
      {/* 最近聊天区域骨架屏 */}
      <div>
        <Skeleton className="h-5 w-12 mb-3 mx-3" />
        <div className="space-y-4">
          {[...Array(2)].map((_, groupIndex) => (
            <div key={groupIndex}>
              <Skeleton className="h-3 w-16 mb-2 mx-3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center p-3 mx-3">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-4 ml-2" />
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
      <SheetContent side="right" className="w-80 sm:w-96 p-0">
        <SheetHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            聊天历史
          </SheetTitle>
        </SheetHeader>
        
        {/* 搜索框 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索对话..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>
        
        {/* 聊天列表 */}
        <div className="flex-1 overflow-y-auto py-4">
          {conversationData === undefined ? (
            renderLoadingSkeleton()
          ) : (
            <div>
              {renderFavoritesSection()}
              {renderRecentChatsSection()}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
