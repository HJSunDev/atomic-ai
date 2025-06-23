import { query } from "../_generated/server";
import { v } from "convex/values";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "../_lib/models";

/**
 * 获取用户的模型偏好列表
 * 返回用户置顶的模型列表，按顺序排列
 */
export const getUserModelPreferences = query({
  args: {},
  handler: async (ctx) => {
    // 获取当前用户ID（权限检查）
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 获取用户的模型偏好，按order字段排序
    const preferences = await ctx.db
      .query("userModelPreferences")
      .withIndex("by_userId_order", (q) => q.eq("userId", userId))
      .collect();

    // 验证模型ID是否有效，过滤掉无效的模型
    const validPreferences = preferences.filter(pref => 
      AVAILABLE_MODELS.hasOwnProperty(pref.modelId)
    );

    // 返回偏好列表，包含模型详细信息
    return validPreferences.map(pref => ({
      ...pref,
      modelConfig: AVAILABLE_MODELS[pref.modelId]
    }));
  },
});


/**
 * 获取用户可以置顶的模型列表
 * 返回所有可用模型，标注哪些已被用户置顶
 */
export const getAvailableModelsForUser = query({
  args: {},
  handler: async (ctx) => {
    // 获取当前用户ID（权限检查）
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 获取用户已置顶的模型
    const userPreferences = await ctx.db
      .query("userModelPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const pinnedModelIds = new Set(userPreferences.map(pref => pref.modelId));

    // 返回所有可用模型，标注置顶状态
    return Object.entries(AVAILABLE_MODELS).map(([modelId, modelConfig]) => ({
      modelId,
      modelConfig,
      isPinned: pinnedModelIds.has(modelId),
      order: userPreferences.find(pref => pref.modelId === modelId)?.order || null
    }));
  },
}); 