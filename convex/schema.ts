import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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

  // 消息表
  // 记录会话中的每一条消息
  messages: defineTable({
    // 所属会话ID，关联到conversations表
    conversationId: v.id("conversations"),
    // 发送消息的Clerk User ID (用户发送时填写此字段)
    userId: v.optional(v.string()),
    // 消息角色：用户("user")、系统消息("system")
    role: v.union(v.literal("user"), v.literal("system")),
    // 消息的文本内容
    content: v.string(),
  })
    // 按会话ID和消息创建时间（Convex自动维护的_creationTime字段）索引
    // 确保消息能按正确顺序加载，并能快速获取指定会话的消息列表
    .index("by_conversationId_creationTime", ["conversationId", "_creationTime"]),

  // 新增 AI回复表
  aiResponses: defineTable({
    // 所属会话ID，关联到conversations表
    conversationId: v.id("conversations"),
    // 关联到触发此回复的用户消息 (messages表中的消息ID)
    userMessageId: v.id("messages"),
    // 标识是哪个AI模型生成的回复
    aiModel: v.string(),
    // AI回复的文本内容
    content: v.string(),
    // 可选：其他元数据，如token使用、耗时等
    metadata: v.optional(v.object({
      tokensUsed: v.optional(v.number()),
      durationMs: v.optional(v.number()),
      // 您可以在此添加更多模型特定的或其他通用的元数据字段
    })),
  })
    // 主要用于获取某用户消息的所有AI回复
    .index("by_userMessageId", ["userMessageId"]) 
    // 用于按时间顺序获取会话的所有AI回复（如果需要独立查看或排序）
    .index("by_conversationId_creationTime", ["conversationId", "_creationTime"]),

  // 提示词模块表
  // 用于管理和维护模块化的提示词
  promptModules: defineTable({
    // 创建该模块的Clerk User ID
    userId: v.string(),
    // 模块的标题，必填
    title: v.string(),
    // 模块的描述信息，可选
    description: v.optional(v.string()),
    // 提示词的前置信息（例如，给大模型的上下文、角色扮演指令等），可选
    promptPrefix: v.optional(v.string()),
    // 模块的核心提示词内容，必填
    promptContent: v.string(),
    // 软删除标记，默认为 false。创建时需在mutation中设置为false
    isArchived: v.boolean(),
    // 注意：`fullPrompt` (完整提示词) 将通过Convex query动态构建，不在数据库中直接存储
    // 这样可以确保数据的一致性，避免冗余存储和更新复杂性
  })
    // 按用户ID索引，方便查询某用户创建的所有提示词模块
    .index("by_userId", ["userId"])
    // 按用户ID和模块标题索引，方便用户查找自己创建的特定模块（若标题在用户级别需要唯一性或常用于搜索）
    .index("by_userId_title", ["userId", "title"]),

  // 提示词模块关系表
  // 定义提示词模块之间的父子关系，实现模块的组合和嵌套
  promptModuleRelationships: defineTable({
    // 父模块的ID，关联到promptModules表
    parentId: v.id("promptModules"),
    // 子模块的ID，关联到promptModules表
    childId: v.id("promptModules"),
    // 子模块在父模块中的顺序
    order: v.number()
  })
    // 按父模块ID索引，方便快速查找一个模块的所有直接子模块，并且按照顺序排列
    .index("by_parentId_order", ["parentId", "order"])
    // 按子模块ID索引，方便快速查找一个模块作为子模块的所有父模块（可用于分析依赖、防止循环等）
    .index("by_childId", ["childId"])
    // 联合索引，确保同一对父子关系不重复（需在mutation中配合检查），或快速查找特定的父子关系
    .index("by_parentId_childId", ["parentId", "childId"]),
}); 