import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useChatStore } from "@/store/home/useChatStore";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/**
 * useChatHistory Hook 的配置选项
 *
 * 该 Hook 专注于统一封装“聊天历史/会话列表”的业务逻辑，
 * 允许不同宿主组件（如侧边栏列表、右侧抽屉）通过回调钩子覆盖细微的交互差异。
 *
 * 设计理念：
 * - 职责单一：对话查询、搜索、收藏、标题编辑、删除等逻辑集中管理
 * - 低耦合：通过回调扩展差异化行为（选择会话后关闭抽屉、删除当前会话前新建空会话等）
 * - 可测试：逻辑集中，便于单元测试
 */
export interface UseChatHistoryOptions {
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
 * useChatHistory 返回值的类型定义。
 *
 * 提供 UI 渲染所需的数据、状态以及事件处理器。
 */
export interface UseChatHistoryResult {
  // 数据
  conversationData: ReturnType<typeof useQuery>;
  searchResults: ReturnType<typeof useQuery>;
  // 加载与搜索状态
  isLoading: boolean;
  isSearching: boolean;
  searchValue: string;
  // UI 状态
  openMenuConversationId: Id<"conversations"> | null;
  editingConversationId: Id<"conversations"> | null;
  editingTitle: string;
  showAllFavorites: boolean;
  // Ref
  inputRef: React.RefObject<HTMLInputElement | null>;
  // 状态更新函数
  setSearchValue: (val: string) => void;
  setOpenMenuConversationId: (id: Id<"conversations"> | null) => void;
  setEditingTitle: (title: string) => void;
  setShowAllFavorites: (show: boolean) => void;
  // 事件处理器
  handleEditTitle: (conversation: Doc<"conversations">) => void;
  handleTitleSubmit: () => Promise<void>;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleToggleFavorite: (conversationId: Id<"conversations">, isFavorited: boolean) => Promise<void>;
  handleDeleteConversation: (conversationId: Id<"conversations">) => Promise<void>;
  handleSelectConversation: (conversationId: Id<"conversations">) => void;
}

/**
 * 封装聊天历史记录相关的所有业务逻辑、状态管理和数据获取。
 * @param options - 可选的配置项，用于定制 Hook 的行为。
 * @returns 返回一个包含状态、数据和事件处理函数的对象，供 UI 组件使用。
 *
 * 使用示例：
 *
 * const {
 *   conversationData,
 *   searchResults,
 *   isLoading,
 *   isSearching,
 *   searchValue,
 *   setSearchValue,
 *   handleSelectConversation,
 *   handleEditTitle,
 *   handleTitleSubmit,
 *   handleDeleteConversation,
 * } = useChatHistory({
 *   onConversationSelect: () => closeSheet(),
 *   onBeforeDeleteCurrent: () => startNewConversation(),
 * });
 */
export function useChatHistory({
  onConversationSelect,
  onBeforeDeleteCurrent,
}: UseChatHistoryOptions = {}): UseChatHistoryResult {
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
  /**
   * 进入标题编辑模式。
   * - 关闭当前行的更多菜单，避免视觉状态冲突
   * - 预填充现有标题，并在 input 聚焦后选中，方便直接覆盖输入
   */
  const handleEditTitle = (conversation: Doc<"conversations">) => {
    setOpenMenuConversationId(null);
    setEditingConversationId(conversation._id);
    setEditingTitle(conversation.title || "");
  };

  /**
   * 提交标题修改。
   * - 对空标题进行保护：空值直接退出编辑，不发起请求
   * - 始终在 finally 中退出编辑模式，确保 UI 状态一致性
   */
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

  /**
   * 处理标题输入框的快捷键：
   * - Enter：提交更改
   * - Escape：取消编辑
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleTitleSubmit();
    } else if (event.key === "Escape") {
      setEditingConversationId(null);
    }
  };

  /**
   * 切换收藏状态。
   * - 采用幂等的布尔切换策略，避免因并发导致的状态错乱
   */
  const handleToggleFavorite = async (conversationId: Id<"conversations">, isFavorited: boolean) => {
    try {
      await toggleFavorite({ conversationId, isFavorited: !isFavorited });
    } catch (error) {
      console.error("切换收藏状态失败:", error);
    }
  };

  /**
   * 删除会话。
   * - 若删除的是当前会话，在真正删除前触发外部回调以进行清理（如重置 UI 或新建会话）
   */
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

  /**
   * 选择会话。
   * - 更新全局当前会话 ID
   * - 触发外部回调（如关闭抽屉）
   */
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
