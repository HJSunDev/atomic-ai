import { v } from "convex/values";
import { query, internalQuery } from "../_generated/server";

// ============= 公开 Queries (需要身份验证) =============

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

// 获取应用的对话历史（公开接口，带权限检查）
export const getAppMessages = query({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // 权限检查：验证用户是否有权查看此应用的消息
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("应用不存在");
    }

    const isAuthor = userId === app.userId;
    const isPublic = !!app.isPublished;

    if (!isAuthor && !isPublic) {
      throw new Error("无权访问");
    }

    const messages = await ctx.db
      .query("app_messages")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .order("asc")
      .collect();

    return messages;
  },
});

// 获取应用的代码版本历史
export const listAppVersions = query({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    // 权限检查
    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("应用不存在");
    }

    const isAuthor = userId === app.userId;
    const isPublic = !!app.isPublished;

    if (!isAuthor && !isPublic) {
      throw new Error("无权访问");
    }

    const versions = await ctx.db
      .query("app_versions")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .order("desc")
      .collect();

    return versions;
  },
});

// 获取特定版本的代码
export const getAppVersion = query({
  args: {
    versionId: v.id("app_versions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new Error("版本不存在");
    }

    // 权限检查
    const app = await ctx.db.get(version.appId);
    if (!app) {
      throw new Error("应用不存在");
    }

    const isAuthor = userId === app.userId;
    const isPublic = !!app.isPublished;

    if (!isAuthor && !isPublic) {
      throw new Error("无权访问");
    }

    return version;
  },
});

// ============= 内部 Queries (供 Action 调用) =============

// 内部查询：获取应用详情（无权限检查）
export const getAppById = internalQuery({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.appId);
  },
});

// 内部查询：获取应用的对话历史（无权限检查）
export const listAppMessages = internalQuery({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("app_messages")
      .withIndex("by_app", (q) => q.eq("appId", args.appId))
      .order("asc")
      .collect();

    return messages;
  },
});
