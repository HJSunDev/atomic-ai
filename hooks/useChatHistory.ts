import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/home/useChatStore";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * useChatHistory Hook 的配置选项
 */
interface UseChatHistoryOptions {
  /** 
   * 在选择会话时触发的回调函数。
   * 可用于执行一些额外的操作，例如关闭抽屉。
   */
  onConversationSelect?: (conversationId: Id<"conversations">) => void;
  /**
   * 在删除当前活动会话之前触发的回调函数。
   * 可用于执行一些清理或状态重置操作，例如开始一个新会话。
   */
  onBeforeDeleteCurrent?: (conversationId: Id<"conversations">) => void;
}

/**
 * 封装聊天历史记录相关的所有业务逻辑、状态管理和数据获取。
 * @param options - 可选的配置项，用于定制 Hook 的行为。
 * @returns 返回一个包含状态、数据和事件处理函数的对象，供 UI 组件使用。
 */
export function useChatHistory({
  onConversationSelect,
  onBeforeDeleteCurrent,
}: UseChatHistoryOptions = {}) {
  // 1. 状态管理
  const [searchValue, setSearchValue] = useState("");
  const [openMenuConversationId, setOpenMenuConversationId] = useState<Id<"conversations"> | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<Id<"conversations"> | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. 全局状态和数据获取
  const { currentConversationId, selectConversation } = useChatStore();
  
  const debouncedSearch = useDebouncedValue(searchValue, 500);
  const isSearching = debouncedSearch.trim().length > 0;

  const conversationData = useQuery(
    api.chat.queries.listGroupedByTime,
    isSearching ? "skip" : {}
  );
  
  const searchResults = useQuery(
    api.chat.queries.searchUserConversations,
    isSearching ? { search: debouncedSearch } : "skip"
  );

  const isLoading = (isSearching && searchResults === undefined) || (!isSearching && conversationData === undefined);

  // 3. 数据变更操作 (Mutations)
  const toggleFavorite = useMutation(api.chat.mutations.toggleConversationFavorite);
  const deleteConversationMutation = useMutation(api.chat.mutations.deleteConversation);
  const updateTitle = useMutation(api.chat.mutations.updateConversationTitle);

  // 4. 副作用处理
  useEffect(() => {
    if (editingConversationId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingConversationId]);

  // 5. 事件处理函数
  const handleEditTitle = (conversation: Doc<"conversations">) => {
    setOpenMenuConversationId(null);
    setEditingConversationId(conversation._id);
    setEditingTitle(conversation.title || "");
  };

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
      // TODO: 添加用户提示
    } finally {
      setEditingConversationId(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleTitleSubmit();
    } else if (event.key === "Escape") {
      setEditingConversationId(null);
    }
  };

  const handleToggleFavorite = async (conversationId: Id<"conversations">, isFavorited: boolean) => {
    try {
      await toggleFavorite({ conversationId, isFavorited: !isFavorited });
    } catch (error) {
      console.error("切换收藏状态失败:", error);
    }
  };

  const handleDeleteConversation = async (conversationId: Id<"conversations">) => {
    try {
      if (currentConversationId === conversationId) {
        // 如果定义了 onBeforeDeleteCurrent 回调，则调用它
        onBeforeDeleteCurrent?.(conversationId);
      }
      await deleteConversationMutation({ conversationId });
    } catch (error) {
      console.error("删除对话失败:", error);
    }
  };

  const handleSelectConversation = (conversationId: Id<"conversations">) => {
    selectConversation(conversationId);
    // 如果定义了 onConversationSelect 回调，则调用它
    onConversationSelect?.(conversationId);
  };

  // 6. 返回给组件的接口
  return {
    // 数据
    conversationData,
    searchResults,
    // 加载与搜索状态
    isLoading,
    isSearching,
    searchValue,
    // UI 状态
    openMenuConversationId,
    editingConversationId,
    editingTitle,
    showAllFavorites,
    // Ref
    inputRef,
    // 状态更新函数
    setSearchValue,
    setOpenMenuConversationId,
    setEditingTitle,
    setShowAllFavorites,
    // 事件处理器
    handleEditTitle,
    handleTitleSubmit,
    handleKeyDown,
    handleToggleFavorite,
    handleDeleteConversation,
    handleSelectConversation,
  };
}
