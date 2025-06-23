import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { AVAILABLE_MODELS } from "../_lib/models";

/**
 * 置顶一个模型到用户偏好列表
 * 新选择的模型会排在最前面（order=1）
 */
export const pinModel = mutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    // 获取当前用户ID（权限检查）
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 验证模型ID是否有效
    if (!AVAILABLE_MODELS.hasOwnProperty(args.modelId)) {
      throw new Error(`无效的模型ID: ${args.modelId}`);
    }

    // 检查模型是否已被置顶
    const existing = await ctx.db
      .query("userModelPreferences")
      .withIndex("by_userId_modelId", (q) => 
        q.eq("userId", userId).eq("modelId", args.modelId)
      )
      .first();

    if (existing) {
      throw new Error("该模型已在置顶列表中");
    }

    // 获取用户当前的偏好列表
    const currentPreferences = await ctx.db
      .query("userModelPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // 将所有现有模型的order后移一位
    for (const pref of currentPreferences) {
      await ctx.db.patch(pref._id, { order: pref.order + 1 });
    }

    // 将新模型设置为第一位
    const newPreferenceId = await ctx.db.insert("userModelPreferences", {
      userId: userId,
      modelId: args.modelId,
      order: 1,
    });

    return newPreferenceId;
  },
});

/**
 * 取消置顶一个模型
 */
export const unpinModel = mutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    // 获取当前用户ID（权限检查）
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 查找要删除的偏好记录
    const preferenceToDelete = await ctx.db
      .query("userModelPreferences")
      .withIndex("by_userId_modelId", (q) => 
        q.eq("userId", userId).eq("modelId", args.modelId)
      )
      .first();

    if (!preferenceToDelete) {
      throw new Error("该模型未在置顶列表中");
    }

    const deletedOrder = preferenceToDelete.order;

    // 删除偏好记录
    await ctx.db.delete(preferenceToDelete._id);

    // 调整其他模型的order（比被删除模型order大的，都减1）
    const remainingPreferences = await ctx.db
      .query("userModelPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const pref of remainingPreferences) {
      if (pref.order > deletedOrder) {
        await ctx.db.patch(pref._id, { order: pref.order - 1 });
      }
    }

    return { success: true };
  },
});




