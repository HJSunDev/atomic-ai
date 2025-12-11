import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * 切换点赞状态
 */
export const toggleLike = mutation({
  args: {
    targetId: v.string(), // Document ID or App ID
    targetType: v.union(v.literal("prompt"), v.literal("app")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("请先登录");
    }
    const userId = identity.subject;

    // 1. 检查是否已点赞
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_target", (q) =>
        q.eq("userId", userId).eq("targetId", args.targetId)
      )
      .first();

    // 2. 更新点赞表和对应的计数
    if (existingLike) {
      // 取消点赞
      await ctx.db.delete(existingLike._id);

      // 递减计数
      if (args.targetType === "prompt") {
        const docId = args.targetId as Id<"documents">;
        const doc = await ctx.db.get(docId);
        if (doc) {
          const currentLikes = doc.likes || 0;
          await ctx.db.patch(docId, { likes: Math.max(0, currentLikes - 1) });
        }
      } else {
        const appId = args.targetId as Id<"apps">;
        const app = await ctx.db.get(appId);
        if (app) {
          const currentLikes = app.likes || 0;
          await ctx.db.patch(appId, { likes: Math.max(0, currentLikes - 1) });
        }
      }

      return false; // 当前状态：未点赞
    } else {
      // 添加点赞
      await ctx.db.insert("likes", {
        userId,
        targetId: args.targetId,
        targetType: args.targetType,
      });

      // 递增计数
      if (args.targetType === "prompt") {
        const docId = args.targetId as Id<"documents">;
        const doc = await ctx.db.get(docId);
        if (doc) {
          const currentLikes = doc.likes || 0;
          await ctx.db.patch(docId, { likes: currentLikes + 1 });
        }
      } else {
        const appId = args.targetId as Id<"apps">;
        const app = await ctx.db.get(appId);
        if (app) {
          const currentLikes = app.likes || 0;
          await ctx.db.patch(appId, { likes: currentLikes + 1 });
        }
      }

      return true; // 当前状态：已点赞
    }
  },
});

/**
 * 增加浏览量 (View)
 * 前端进入详情页时调用
 */
export const viewItem = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("prompt"), v.literal("app")),
  },
  handler: async (ctx, args) => {
    // 浏览量通常不需要严格的身份验证，或者可以仅针对登录用户统计
    // 这里允许未登录用户增加浏览量
    
    if (args.targetType === "prompt") {
      const docId = args.targetId as Id<"documents">;
      const doc = await ctx.db.get(docId);
      if (doc) {
        const currentViews = doc.views || 0;
        await ctx.db.patch(docId, { views: currentViews + 1 });
      }
    } else {
      const appId = args.targetId as Id<"apps">;
      const app = await ctx.db.get(appId);
      if (app) {
        const currentViews = app.views || 0;
        await ctx.db.patch(appId, { 
          views: currentViews + 1
        });
      }
    }
  },
});
