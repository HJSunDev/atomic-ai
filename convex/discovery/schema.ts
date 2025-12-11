import { defineTable } from "convex/server";
import { v } from "convex/values";

export const discoverySchema = {
  // 点赞表 (多态关联)
  likes: defineTable({
    userId: v.string(), // 点赞的用户
    targetId: v.string(), // 被点赞的对象ID (Document ID 或 App ID)
    targetType: v.union(v.literal("prompt"), v.literal("app")), // 对象类型
  })
    .index("by_user_target", ["userId", "targetId"]) // 用于检查用户是否已点赞
    .index("by_target", ["targetId"]), // 用于统计(如果需要精确计算，虽然我们主要依赖计数器字段)
};

