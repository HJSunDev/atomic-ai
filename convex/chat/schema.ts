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
  })
    // 按用户ID索引，方便查询用户的所有会话
    .index("by_userId", ["userId"])
    // 按用户ID和提示词模块ID索引，方便查询用户从特定模块发起的会话
    .index("by_userId_promptModuleId", ["userId", "promptModuleId"]),

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
      // 生成此回复的AI模型名称，例如 "gpt-4-turbo"。
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
    .index("by_parentMessageId", ["parentMessageId"]),

}; 