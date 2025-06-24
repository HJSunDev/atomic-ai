import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userModelPreferencesSchema = {
  // 用户模型偏好表
  // 用于存储每个用户置顶的AI模型偏好设置
  userModelPreferences: defineTable({
    // 用户的Clerk User ID
    userId: v.string(),
    // 模型ID，对应models.ts配置文件中的模型标识符
    modelId: v.string(),
    // 置顶顺序
    order: v.number(),
  })
    // 按用户ID索引，方便查询用户的所有置顶模型
    .index("by_userId", ["userId"])
    // 按用户ID和顺序索引，确保按正确顺序返回用户的置顶模型
    .index("by_userId_order", ["userId", "order"])
    // 按用户ID和模型ID的联合索引，用于快速检查用户是否已置顶某个模型，避免重复置顶
    .index("by_userId_modelId", ["userId", "modelId"]),
}; 