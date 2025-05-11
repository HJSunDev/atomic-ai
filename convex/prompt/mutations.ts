import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

// 创建新的提示词模块
export const createPromptModule = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    promptPrefix: v.optional(v.string()),
    promptContent: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法创建提示词模块，请先登录。");
    }
    const userId = identity.subject; // Clerk User ID

    const promptModuleId = await ctx.db.insert("promptModules", {
      userId,
      title: args.title,
      description: args.description,
      promptPrefix: args.promptPrefix,
      promptContent: args.promptContent,
      isArchived: false, // 新建模块默认为未归档
    });

    return promptModuleId;
  },
});

// 更新已存在的提示词模块
export const updatePromptModule = mutation({
  args: {
    moduleId: v.id("promptModules"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    promptPrefix: v.optional(v.string()),
    promptContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法更新提示词模块，请先登录。");
    }

    const existingModule = await ctx.db.get(args.moduleId);
    if (!existingModule) {
      throw new Error("提示词模块未找到。");
    }

    if (existingModule.userId !== identity.subject) {
      throw new Error("权限不足：您无法编辑不属于您的提示词模块。");
    }

    const { moduleId, ...rest } = args;
    await ctx.db.patch(moduleId, rest);

    return moduleId;
  },
});

// 归档（软删除）提示词模块
export const archivePromptModule = mutation({
  args: {
    moduleId: v.id("promptModules"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法归档提示词模块，请先登录。");
    }

    const existingModule = await ctx.db.get(args.moduleId);
    if (!existingModule) {
      throw new Error("提示词模块未找到。");
    }

    if (existingModule.userId !== identity.subject) {
      throw new Error("权限不足：您无法归档不属于您的提示词模块。");
    }

    // TODO: 检查该模块是否被其他未归档模块作为子模块引用，如果是，可能需要提示或阻止归档
    // 例如：查询 promptModuleRelationships 表中 childId 为此 moduleId 且父模块未归档的记录

    await ctx.db.patch(args.moduleId, { isArchived: true });
    return args.moduleId;
  },
});

// 取消归档提示词模块
export const unarchivePromptModule = mutation({
  args: {
    moduleId: v.id("promptModules"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法取消归档提示词模块，请先登录。");
    }
    const existingModule = await ctx.db.get(args.moduleId);
    if (!existingModule) {
      throw new Error("提示词模块未找到。");
    }
    if (existingModule.userId !== identity.subject) {
      throw new Error("权限不足：您无法操作不属于您的提示词模块。");
    }
    await ctx.db.patch(args.moduleId, { isArchived: false });
    return args.moduleId;
  },
});

// 添加子模块到父模块
export const addChildModule = mutation({
  args: {
    parentId: v.id("promptModules"),
    childId: v.id("promptModules"),
    order: v.optional(v.number()), // 子模块的顺序，可选
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法添加子模块，请先登录。");
    }

    const parentModule = await ctx.db.get(args.parentId);
    const childModule = await ctx.db.get(args.childId);

    if (!parentModule || !childModule) {
      throw new Error("父模块或子模块未找到。");
    }
    if (parentModule.userId !== identity.subject || childModule.userId !== identity.subject) {
      throw new Error("权限不足：您只能操作属于您的提示词模块。");
    }
    if (args.parentId === args.childId) {
      throw new Error("无法将模块添加为自身的子模块。");
    }
    // 检查是否已存在该父子关系
    const existingRelationship = await ctx.db
      .query("promptModuleRelationships")
      .withIndex("by_parentId_childId", (q) =>
        q.eq("parentId", args.parentId).eq("childId", args.childId)
      )
      .unique();

    if (existingRelationship) {
      // 如果关系已存在，可以选择更新order或直接返回提示
      // 此处简单返回已存在提示
      // 如果需要更新order，则使用 existingRelationship._id 进行 patch
      console.warn("该子模块已存在于父模块中。");
      return existingRelationship._id;
      // throw new Error("该子模块已存在于父模块中。");
    }
    
    // 如果没有提供 order，计算新的 order 值
    let order = args.order;
    if (order === undefined) {
      const lastChild = await ctx.db
        .query("promptModuleRelationships")
        .withIndex("by_parentId_order", (q) => q.eq("parentId", args.parentId))
        .order("desc") // 假设 order 越大越靠后
        .first();
      order = lastChild ? lastChild.order + 1 : 0;
    }

    const relationshipId = await ctx.db.insert("promptModuleRelationships", {
      parentId: args.parentId,
      childId: args.childId,
      order: order,
    });

    return relationshipId;
  },
});

// 从父模块移除子模块
export const removeChildModule = mutation({
  args: {
    parentId: v.id("promptModules"),
    childId: v.id("promptModules"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法移除子模块，请先登录。");
    }
    
    const parentModule = await ctx.db.get(args.parentId);
     if (!parentModule || parentModule.userId !== identity.subject) {
      throw new Error("权限不足或父模块不存在。");
    }

    const relationship = await ctx.db
      .query("promptModuleRelationships")
      .withIndex("by_parentId_childId", (q) =>
        q.eq("parentId", args.parentId).eq("childId", args.childId)
      )
      .unique();

    if (!relationship) {
      throw new Error("指定的父子模块关系不存在。");
    }

    await ctx.db.delete(relationship._id);
    return { success: true, relationshipId: relationship._id };
  },
});

// 更新子模块在父模块中的顺序
export const updateChildModuleOrder = mutation({
  args: {
    // 可以传递一个包含 { relationshipId: Id<"promptModuleRelationships">, order: number } 的数组
    // 或者单个修改，这里先实现单个修改的简单版本
    relationshipId: v.id("promptModuleRelationships"),
    newOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法更新子模块顺序，请先登录。");
    }

    const relationship = await ctx.db.get(args.relationshipId);
    if (!relationship) {
      throw new Error("模块关系未找到。");
    }
    
    const parentModule = await ctx.db.get(relationship.parentId);
    if (!parentModule || parentModule.userId !== identity.subject) {
         throw new Error("权限不足或父模块不存在，无法更新子模块顺序。");
    }

    await ctx.db.patch(args.relationshipId, { order: args.newOrder });
    return args.relationshipId;
  },
});

// 批量更新某父模块下子模块的顺序
export const reorderChildModules = mutation({
  args: {
    parentId: v.id("promptModules"),
    // 传入一个子模块ID的有序列表
    orderedChildIds: v.array(v.id("promptModules")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("未授权：无法重排序子模块，请先登录。");
    }

    const parentModule = await ctx.db.get(args.parentId);
    if (!parentModule || parentModule.userId !== identity.subject) {
      throw new Error("权限不足或父模块不存在。");
    }

    // 获取当前父模块下的所有子模块关系
    const currentRelationships = await ctx.db
      .query("promptModuleRelationships")
      .withIndex("by_parentId_order", q => q.eq("parentId", args.parentId))
      .collect();

    // 开启事务或确保原子性（Convex mutation 默认是原子的）
    for (let i = 0; i < args.orderedChildIds.length; i++) {
      const childId = args.orderedChildIds[i];
      const relationshipToUpdate = currentRelationships.find(r => r.childId === childId);
      
      if (relationshipToUpdate) {
        if (relationshipToUpdate.order !== i) { // 只有顺序改变了才更新
          await ctx.db.patch(relationshipToUpdate._id, { order: i });
        }
      } else {
        // 如果新的有序列表中包含了一个当前不存在的子模块关系，可以选择忽略、报错或自动添加
        // 此处选择忽略，仅更新已存在的子模块顺序
        console.warn(`子模块 ${childId} 与父模块 ${args.parentId} 的关系不存在，无法更新其顺序。`);
      }
    }
    
    // （可选）处理在 orderedChildIds 中未出现的原有子模块，例如将它们删除或标记为无序
    // 这里暂不处理，只根据传入的列表更新顺序

    return { success: true, parentId: args.parentId };
  },
});

// TODO: 可能需要的其他 mutations:
// - 复制一个提示词模块及其子模块结构
// - 检查并修复循环依赖 (更适合在 query 或特定工具函数中处理) 