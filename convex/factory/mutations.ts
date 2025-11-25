import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";

// ============= 公开 Mutations (需要身份验证) =============

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

// 归档应用
export const archiveApp = mutation({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权操作：请先登录");
    }
    const userId = identity.subject;

    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("应用不存在");
    }
    if (app.userId !== userId) {
      throw new Error("无权操作此应用");
    }

    await ctx.db.patch(args.appId, {
      isArchived: true,
    });
  },
});

// 发布应用
export const publishApp = mutation({
  args: {
    appId: v.id("apps"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权操作：请先登录");
    }
    const userId = identity.subject;

    const app = await ctx.db.get(args.appId);
    if (!app) {
      throw new Error("应用不存在");
    }
    if (app.userId !== userId) {
      throw new Error("无权操作此应用");
    }

    await ctx.db.patch(args.appId, {
      isPublished: true,
      publishedAt: Date.now(),
    });
  },
});

// ============= 内部 Mutations (供 Action 调用) =============

// 创建消息
export const createMessage = internalMutation({
  args: {
    appId: v.id("apps"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    isStreaming: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("app_messages", {
      appId: args.appId,
      role: args.role,
      content: args.content,
      isStreaming: args.isStreaming,
    });
    return messageId;
  },
});

// 更新消息内容（用于流式传输）
export const updateMessageContent = internalMutation({
  args: {
    messageId: v.id("app_messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

// 更新消息流式状态
export const updateMessageStreamingStatus = internalMutation({
  args: {
    messageId: v.id("app_messages"),
    isStreaming: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isStreaming: args.isStreaming,
    });
  },
});

// 关联消息与代码版本
export const linkMessageToVersion = internalMutation({
  args: {
    messageId: v.id("app_messages"),
    versionId: v.id("app_versions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      relatedCodeId: args.versionId,
    });
  },
});

// 创建代码版本快照
export const createAppVersion = internalMutation({
  args: {
    appId: v.id("apps"),
    messageId: v.id("app_messages"),
    code: v.string(),
    version: v.number(),
    diffDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const versionId = await ctx.db.insert("app_versions", {
      appId: args.appId,
      messageId: args.messageId,
      code: args.code,
      version: args.version,
      diffDescription: args.diffDescription,
      creationTime: Date.now(),
    });
    return versionId;
  },
});

// 更新应用的最新代码和版本号
export const updateAppLatestCode = internalMutation({
  args: {
    appId: v.id("apps"),
    latestCode: v.string(),
    version: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.appId, {
      latestCode: args.latestCode,
      v: args.version,
    });
  },
});
