import { v } from "convex/values";
import { query } from "../_generated/server";

// 获取应用列表
export const listApps = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // 未登录用户看不到任何私有应用
      return [];
    }
    const userId = identity.subject;

    const apps = await ctx.db
      .query("apps")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return apps;
  },
});

// 获取应用详情
export const getApp = query({
  args: { appId: v.id("apps") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;
    
    const app = await ctx.db.get(args.appId);
    
    if (!app) {
      return null; // 应用不存在
    }

    // 权限检查逻辑
    const isAuthor = userId === app.userId;
    const isPublic = !!app.isPublished;

    // 如果既不是作者，也不是公开应用，则拒绝访问
    if (!isAuthor && !isPublic) {
      // 这里返回 null 类似于 404/403 混合，保护隐私不暴露资源存在性
      // 或者也可以选择 throw new Error("无权访问")
      return null; 
    }

    return {
      ...app,
      isAuthor, // 前端可据此判断显示"编辑"还是"只读"界面
    };
  },
});
