import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";

// 定义返回类型：在原始模块文档基础上扩展 children 字段
export type PromptModuleWithChildren = Doc<"promptModules"> & {
  children: Doc<"promptModules">[];
};

/**
 * 查询当前用户的提示词模块列表（排除已归档），并为每个模块附带其直接子模块列表。
 * - 仅支持两层（父 -> 子）关系；
 * - 不区分是否为顶层模块：所有未归档模块都会返回；
 * - 子模块顺序按照关系表中的 order 升序排列；
 * - 为未来支持多级嵌套预留了可扩展的内部结构（当前 depth 固定为 1）。
 */
export const listPromptModulesWithChildren = query({
  args: {},
  handler: async (ctx): Promise<PromptModuleWithChildren[]> => {
    // 权限校验：获取当前用户ID
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 查询当前用户的未归档提示词模块
    const modules = (await ctx.db
      .query("promptModules")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect())
      .filter((m) => m.isArchived !== true);

    if (modules.length === 0) return [];

    // 内部工具：按父模块ID查询其直接子关系，并返回按顺序的子模块文档
    const fetchDirectChildren = async (
      parentId: Id<"promptModules">
    ): Promise<Doc<"promptModules">[]> => {
      // 读取父 -> 子 的关系记录，按 order 升序排列
      // orderedChildRecords 结构示例：
      // [
      //   {
      //     _id: "abc123...",
      //     _creationTime: 1700000000000,
      //     parentId: "parent_module_id",  // 当前传入的 parentId
      //     childId: "child_module_1",     // 子模块1的ID
      //     order: 1                       // 排序：第1个子模块
      //   },
      //   {
      //     _id: "def456...",
      //     _creationTime: 1700000001000,
      //     parentId: "parent_module_id",  // 同样的父模块
      //     childId: "child_module_2",     // 子模块2的ID
      //     order: 2                       // 排序：第2个子模块
      //   }
      // ]
      const orderedChildRecords = await ctx.db
        .query("promptModuleRelationships")
        .withIndex("by_parentId_order", (q) => q.eq("parentId", parentId))
        .order("asc")
        .collect();

      if (orderedChildRecords.length === 0) return [];

      // 依序读取子模块文档，保持与 orderedChildRecords 的顺序一致
      const children = await Promise.all(
        orderedChildRecords.map(async (record) => {
          // 安全防御：避免父子自指
          if (record.childId === parentId) return null;
          const child = await ctx.db.get(record.childId);
          // 仅返回当前用户的未归档模块，避免越权或脏数据
          if (!child) return null;
          if (child.userId !== userId) return null;
          if (child.isArchived === true) return null;
          return child;
        })
      );

      // 过滤掉空值并保持顺序
      return children.filter((c): c is Doc<"promptModules"> => c !== null);
    };

    // 构建结果：每个模块附带其直接子模块
    const result = await Promise.all(
      modules.map(async (mod) => {
        const children = await fetchDirectChildren(mod._id);
        return { ...mod, children } as PromptModuleWithChildren;
      })
    );

    return result;
  },
});

/**
 * 查询当前用户未作为其他模块子模块的提示词模块列表（排除已归档）。
 * - 使用关系表索引 `by_childId` 判断模块是否被引用为子模块；
 * - 仅返回当前用户的未归档模块；
 * - 不关心父模块的归档状态或归属用户，只要存在引用即视为“已作为子模块”。
 */
export const listPromptModulesNotUsedAsChild = query({
  args: {},
  handler: async (ctx) => {
    // 权限校验：获取当前用户ID
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 查询当前用户的未归档提示词模块
    const modules = (await ctx.db
      .query("promptModules")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect())
      .filter((m) => m.isArchived !== true);

    if (modules.length === 0) return [];

    // 过滤掉“已作为子模块”的模块
    const topLevelCandidates = await Promise.all(
      modules.map(async (mod) => {
        // 通过 childId 索引快速判断是否存在引用
        const usedAsChild = await ctx.db
          .query("promptModuleRelationships")
          .withIndex("by_childId", (q) => q.eq("childId", mod._id))
          .first();
        return usedAsChild ? null : mod;
      })
    );

    // 过滤掉空值
    return topLevelCandidates.filter((m) => m !== null);
  },
});

/**
 * [内部] 获取指定ID的提示词模块
 * 用于action中验证模块存在性和所有权
 */
export const getPromptModuleById = internalQuery({
  args: {
    id: v.id("promptModules"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


