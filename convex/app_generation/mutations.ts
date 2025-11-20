import { v } from "convex/values";
import { mutation } from "../_generated/server";

// 创建一个新应用
export const createApp = mutation({
  args: {
    prompt: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权操作：请先登录");
    }
    const userId = identity.subject;

    const appId = await ctx.db.insert("apps", {
      userId,
      prompt: args.prompt,
      name: args.name || "未命名应用",
      v: 0,
      isArchived: false,
      creationTime: Date.now(),
    });

    return appId;
  },
});
