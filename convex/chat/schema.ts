import { defineTable } from "convex/server";
import { v } from "convex/values";

export const chatSchema = {
  // 会话表
  // 用于记录用户与AI的每一次交互会话
  conversations: defineTable({
    // Clerk User ID，标识会话属于哪个用户
    userId: v.string(),
    // 会话标题，例如基于首个消息或关联的提示词模块，方便用户识别
    title: v.optional(v.string()),
    // 如果会话是从特定提示词模块开始的，记录其ID
    promptModuleId: v.optional(v.id("promptModules")),
    // 标识会话是否被收藏
    isFavorited: v.optional(v.boolean()),
  })
    // 按用户ID索引，方便查询用户的所有会话
    .index("by_userId", ["userId"])
    // 按用户ID和提示词模块ID索引，方便查询用户从特定模块发起的会话
    .index("by_userId_promptModuleId", ["userId", "promptModuleId"])
    // 用于高效查询用户的收藏会话
    .index("by_userId_isFavorited", ["userId", "isFavorited"])
    // 会话标题搜索索引，支持按用户ID过滤的全文搜索
    .searchIndex("search_conversations_by_title", {
      searchField: "title",
      filterFields: ["userId"], // 确保用户只能搜索自己的会话
    }),

  /**
   * 消息表 (messages)
   * 
   * 用于统一存储所有会话中的消息记录。
   * 本设计采用自引用关联（通过 parentMessageId）和选择标志位（isChosenReply），
   * 以此来灵活支持两种核心场景：
   * 1. 简单的线性对话（一个问题，一个AI回复）。
   * 2. 复杂的多AI回复对比（一个问题，多个AI同时回复，并允许用户选择一个作为主线）。
   */
  messages: defineTable({
    // -- 核心关联字段 --
  
    /**
     * 所属会话ID。
     * 用于将这条消息归属到具体的某一次对话中，这是最基本的分组依据。
     * 必须字段。
     */
    conversationId: v.id("conversations"),
  
    /**
     * 父消息ID，指向本表中的另一条消息，用于构建对话的层级关系。
     * 它定义了一条消息是否为另一条消息的直接回复，是实现"对话树"和"一对多"回复的关键。
     * - 对于开启一个新对话回合（thread）的消息，此字段为空。在当前设计中，这通常是用户的提问。
     * - 对于AI的回复，此字段必须指向它所回答的那条用户消息的_id。
     * 可选字段。
     * 
     * 示例结构：
     * 会话 (Conversation)
     * └── 用户提问: "你好吗？" (id: msg_1, parentMessageId: null)  <-- 根
     *     └── AI 回复: "我很好！" (id: msg_2, parentMessageId: msg_1) <-- 子
     * 
     * └── 用户提问: "给我讲个笑话" (id: msg_3, parentMessageId: null) <-- 新的根
     *     ├── AI 回复1 (GPT): "..." (id: msg_4, parentMessageId: msg_3) <-- 子
     *     └── AI 回复2 (Claude): "..." (id: msg_5, parentMessageId: msg_3) <-- 另一个子
     */
    parentMessageId: v.optional(v.id("messages")),
  
    // -- 消息内容与角色 --
  
    /**
     * 消息角色。
     * 用于明确区分消息的发送方。
     * - "user": 由真实用户发送。
     * - "assistant": 由AI助手生成。
     * - "system": 系统消息，可用于设置AI的行为或上下文。
     * 必须字段。
     */
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  
    /**
     * 消息的文本内容。
     * 对于AI的流式回复，这个字段的内容会被持续、动态地追加更新。
     * 必须字段。
     */
    content: v.string(),
  
    /**
     * 用于记录AI在生成最终回复前执行的中间步骤，例如联网搜索。
     * 这是一个对象数组，每个对象代表一个独立的步骤。
     * 这使得前端可以实时展示 "正在搜索..." -> "已找到资料" -> (展示链接) 的过程。
     */
    steps: v.optional(
      v.array(
        v.object({
          // 步骤类型，例如 "web_search"
          type: v.string(),
          // 步骤的当前状态
          status: v.union(
            v.literal("started"), // 已开始
            v.literal("in_progress"), // 进行中
            v.literal("completed"), // 已完成
            v.literal("failed") // 执行失败
          ),
          // 步骤的输入，例如 Agent 决定的搜索查询词
          input: v.optional(v.any()),
          // 步骤的输出，例如搜索结果
          output: v.optional(
            v.array(
              v.object({
                title: v.string(),
                url: v.string(),
                content: v.optional(v.string()),
                // 相关性得分
                score: v.optional(v.number()),
                // 网站图标
                favicon: v.optional(v.string()),
              })
            )
          ),
          // 错误信息（当 status 为 "failed" 时）
          error: v.optional(v.string()),
        })
      )
    ),
  
    // -- 高级功能支持字段 --
  
    /**
     * 考虑到对单条用户消息进行多个ai回复的场景
     * 这个字段是保证对话主线清晰、线性的决定性标志。
     * - 对于 user 和 system 消息，此字段在创建时即为 true。
     * - 对于 assistant 消息，在多AI回复场景下，只有一个回复的此字段能为 true，用户可以切换。
     *   在单AI回复场景下，该AI回复此字段默认为 true。
     * 可选字段，但建议对于非主线AI回复明确设为 false。
     */
    isChosenReply: v.optional(v.boolean()),
  
    // -- 元数据 --
  
    /**
     * 可选的元数据对象。
     * 用于存储与消息相关的、非核心内容的额外信息，例如性能指标、模型详情等。
     * 对于用户消息，此字段通常为空。
     */
    metadata: v.optional(v.object({
      // AI消息的状态标识
      status: v.optional(v.union(
        v.literal("success"),  // 成功生成
        v.literal("error"),    // 生成失败
        v.literal("pending")   // 正在生成中
      )),
      // 生成此回复的AI模型名称
      aiModel: v.optional(v.string()),
      // 本次回复消耗的token数量。
      tokensUsed: v.optional(v.number()),
      // 生成本次回复所花费的时间（毫秒）。
      durationMs: v.optional(v.number()),
    })),
  })
    // -- 数据库索引 --
  
    /**
     * 按会话ID索引。
     * 这是最高频的查询，用于快速获取某个会话的所有相关消息。
     * Convex会自动将 _creationTime 添加到索引末尾，天然支持按时间排序。
     */
    .index("by_conversationId", ["conversationId"])
  
    /**
     * 按会话ID和选择状态索引。
     * 用于高效地获取一个会话的主线消息（即被选中的回复）。
     */
    .index(
      "by_conversationId_and_isChosenReply",
      ["conversationId", "isChosenReply"]
    )
  
    /**
     * 按父消息ID索引。
     * 用于高效地查询某条用户消息下的所有AI回复，是实现"对比多个回复"功能的核心性能保障。
     */
    .index("by_parentMessageId", ["parentMessageId"])
  
    /**
     * 消息内容搜索索引。
     * 支持在消息内容中进行全文搜索，可以按会话ID过滤，确保搜索范围的准确性。
     */
    .searchIndex("search_messages_by_content", {
      searchField: "content",
      filterFields: ["conversationId"], // 可以按特定会话进行搜索
    }),

}; 