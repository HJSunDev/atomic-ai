import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

/**
 * 通用更新接口：用于更新提示词模块的核心属性。
 * - 幂等：仅更新传入的字段，未传入的字段保持不变。
 * - 权限：仅允许模块所属用户更新。
 * - 约束：不允许通过该接口修改 userId 和 isArchived。
 */
export const updatePromptModule = mutation({
  args: {
    // 必填：要更新的文档ID
    id: v.id("promptModules"),
    // 可选：仅传递需要修改的字段
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    promptPrefix: v.optional(v.string()),
    promptContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 认证：仅登录用户可调用
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 读取目标文档并校验归属
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("目标提示词模块不存在");
    if (existing.userId !== userId) throw new Error("无权更新此提示词模块");

    // 构建待更新的字段：仅包含显式传入的键
    const patch: Record<string, unknown> = {};
    if (typeof args.title !== "undefined") patch.title = args.title;
    if (typeof args.description !== "undefined") patch.description = args.description;
    if (typeof args.promptPrefix !== "undefined") patch.promptPrefix = args.promptPrefix;
    if (typeof args.promptContent !== "undefined") patch.promptContent = args.promptContent;

    // 如果没有任何可更新字段，则直接返回（幂等）
    if (Object.keys(patch).length === 0) {
      return { success: true, updated: false } as const;
    }

    // 执行更新
    await ctx.db.patch(args.id, patch);

    return { success: true, updated: true } as const;
  },
});


/**
 * 归档提示词模块（软删除）。
 * - 将 isArchived 设为 true。
 * - 幂等：已归档则不重复写入。
 * - 仅模块所有者可操作。
 */
export const archivePromptModule = mutation({
  args: {
    id: v.id("promptModules"),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("目标提示词模块不存在");
    if (existing.userId !== userId) throw new Error("无权归档此提示词模块");

    if (existing.isArchived === true) {
      return { success: true, updated: false } as const;
    }

    await ctx.db.patch(args.id, { isArchived: true });
    return { success: true, updated: true } as const;
  },
});

/**
 * 取消归档提示词模块。
 * - 将 isArchived 设为 false。
 * - 幂等：未归档状态则不重复写入。
 * - 仅模块所有者可操作。
 */
export const unarchivePromptModule = mutation({
  args: {
    id: v.id("promptModules"),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("目标提示词模块不存在");
    if (existing.userId !== userId) throw new Error("无权取消归档此提示词模块");

    if (existing.isArchived === false) {
      return { success: true, updated: false } as const;
    }

    await ctx.db.patch(args.id, { isArchived: false });
    return { success: true, updated: true } as const;
  },
});

/**
 * 新增提示词模块。
 * - 必填：title, promptContent
 * - 可选：description, promptPrefix
 * - 创建时强制 isArchived = false；userId 来自认证上下文
 */
export const createPromptModule = mutation({
  args: {
    title: v.string(),
    promptContent: v.string(),
    description: v.optional(v.string()),
    promptPrefix: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 认证：仅登录用户可调用
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 插入新模块（软删除标记固定为 false）
    const newId = await ctx.db.insert("promptModules", {
      userId,
      title: args.title,
      description: args.description,
      promptPrefix: args.promptPrefix,
      promptContent: args.promptContent,
      isArchived: false,
    });

    return { id: newId } as const;
  },
});

/**
 * 永久删除提示词模块（硬删除）。
 * - 清理关系表中与该模块相关的所有父/子关系；
 * - 删除模块本身；
 * - 仅模块所有者可操作；
 * - 不会级联删除其他模块。
 */
export const deletePromptModule = mutation({
  args: {
    id: v.id("promptModules"),
  },
  handler: async (ctx, args) => {
    // 认证
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 读取并校验归属
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("目标提示词模块不存在");
    if (existing.userId !== userId) throw new Error("无权删除此提示词模块");

    // 清理作为父模块的关系
    const parentRelations = await ctx.db
      .query("promptModuleRelationships")
      .withIndex("by_parentId_order", (q) => q.eq("parentId", args.id))
      .collect();
    await Promise.all(parentRelations.map((rel) => ctx.db.delete(rel._id)));

    // 清理作为子模块的关系
    const childRelations = await ctx.db
      .query("promptModuleRelationships")
      .withIndex("by_childId", (q) => q.eq("childId", args.id))
      .collect();
    await Promise.all(childRelations.map((rel) => ctx.db.delete(rel._id)));

    // 删除模块本身
    await ctx.db.delete(args.id);

    return {
      success: true,
      removedParentRelations: parentRelations.length,
      removedChildRelations: childRelations.length,
    } as const;
  },
});


