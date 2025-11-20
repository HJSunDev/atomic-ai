import { defineTable } from "convex/server";
import { v } from "convex/values";

export const appGenerationSchema = {
  // 应用/项目表
  apps: defineTable({
    userId: v.string(), // 归属用户 (Clerk ID)
    prompt: v.string(), // 初始创建时的提示词
    name: v.string(), // 应用名称
    description: v.optional(v.string()), // 描述
    latestCode: v.optional(v.string()), // 最新版本的完整代码 (冗余字段，用于快速加载)
    v: v.number(), // 当前版本号
    isArchived: v.boolean(), // 是否归档
    creationTime: v.number(), // 创建时间
    
    // 发布相关字段
    isPublished: v.optional(v.boolean()), // 是否已发布
    publishedAt: v.optional(v.number()), // 发布时间
    visitCount: v.optional(v.number()), // 访问次数 (预留)
  })
    .index("by_user", ["userId"])
    .index("by_creation_time", ["creationTime"])
    // 新增索引：用于查询公开已发布的应用，按发布时间倒序
    .index("by_published", ["isPublished", "publishedAt"]),

  // 对话历史表
  app_messages: defineTable({
    appId: v.id("apps"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(), // 消息内容
    relatedCodeId: v.optional(v.id("app_versions")), // 该消息关联生成的代码版本ID
    isStreaming: v.optional(v.boolean()), // 是否正在流式传输中
  }).index("by_app", ["appId"]),

  // 代码版本快照表
  app_versions: defineTable({
    appId: v.id("apps"),
    messageId: v.id("app_messages"), // 关联的 AI 消息 ID
    code: v.string(), // 纯净的代码内容
    dependencies: v.optional(v.string()), // 依赖配置 (JSON 字符串)
    version: v.number(), // 版本号
    diffDescription: v.optional(v.string()), // AI 总结的本次修改点
    creationTime: v.number(),
  })
    .index("by_app", ["appId"])
    .index("by_app_version", ["appId", "version"]),
};

