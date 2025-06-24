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
    // 按会话ID索引，确保消息能快速获取指定会话的消息列表
    // _creationTime会自动添加到索引末尾，不需要显式指定
    .index("by_conversationId", ["conversationId"]),

  // AI回复表
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
    // 用于获取会话的所有AI回复（_creationTime会自动添加）
    .index("by_conversationId", ["conversationId"]),
}; 