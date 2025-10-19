import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";


/**
 * 创建新文档
 * 
 * 文档创建时会自动生成一个初始的文本块（order = 0），因为：
 * 1. 文档必须至少包含一个内容块才能进行编辑
 * 2. 初始文本块为用户提供了即时可用的编辑入口点
 * 3. 确保文档数据结构的完整性和一致性
 * 
 * @returns 新创建文档的ID
 */
export const createDocument = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    promptPrefix: v.optional(v.string()),
    promptSuffix: v.optional(v.string()),
    initialContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const documentId = await ctx.db.insert("documents", {
      userId,
      title: args.title,
      description: args.description,
      promptPrefix: args.promptPrefix,
      promptSuffix: args.promptSuffix,
      isArchived: false,
      referenceCount: 0,
    });

    await ctx.db.insert("blocks", {
      documentId,
      type: "text",
      content: args.initialContent ?? "",
      order: 0,
    });

    return { documentId } as const;
  },
});


/**
 * 更新文档元信息
 * 
 * 此接口专注于文档级别的元数据更新，不涉及块内容，因为：
 * 1. 文档元信息（标题、描述等）修改频率低
 * 2. 块内容修改频率高，发生在编辑器实时输入过程中
 * 3. 职责分离使得接口更清晰，便于维护和测试
 */
export const updateDocument = mutation({
  args: {
    // 必填
    id: v.id("documents"),
    // 可选
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    promptPrefix: v.optional(v.string()),
    promptSuffix: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("目标文档不存在");
    if (existing.userId !== userId) throw new Error("无权更新此文档");

    const patch: Record<string, unknown> = {};
    if (typeof args.title !== "undefined") patch.title = args.title;
    if (typeof args.description !== "undefined") patch.description = args.description;
    if (typeof args.promptPrefix !== "undefined") patch.promptPrefix = args.promptPrefix;
    if (typeof args.promptSuffix !== "undefined") patch.promptSuffix = args.promptSuffix;

    if (Object.keys(patch).length === 0) {
      return { success: true, updated: false } as const;
    }

    await ctx.db.patch(args.id, patch);
    return { success: true, updated: true } as const;
  },
});


/**
 * 更新文档的内容块
 * 
 * 此接口用于更新文档自己的内容块，因为：
 * 1. 每个文档有且只有一个自己的内容块（type="text"），通过documentId+type即可定位
 * 2. 编辑器中用户编辑的是当前文档的内容，而不是引用的其他文档
 * 3. 如需编辑被引用的文档，应该打开那个文档本身进行编辑
 * 
 * 使用场景：
 * - 用户在编辑器中输入文本内容
 * - 编辑器自动保存（如debounce 500ms）
 * - 前端只需要知道documentId，无需关心blockId和order
 */
export const updateDocumentContent = mutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("目标文档不存在");
    if (document.userId !== userId) throw new Error("无权更新此文档");

    const contentBlock = await ctx.db
      .query("blocks")
      .withIndex("by_documentId_type", (q) => 
        q.eq("documentId", args.documentId).eq("type", "text")
      )
      .first();

    if (!contentBlock) {
      throw new Error("文档内容块不存在");
    }

    if (contentBlock.content === args.content) {
      return { success: true, updated: false } as const;
    }

    await ctx.db.patch(contentBlock._id, { content: args.content });
    return { success: true, updated: true } as const;
  },
});


/**
 * 归档文档（软删除）
 * 
 * 归档后的文档不会出现在文档列表中，但数据仍保留在数据库中，因为：
 * 1. 软删除允许用户恢复误删的文档
 * 2. 保留历史数据用于审计和分析
 * 3. 避免级联删除引用关系的复杂性
 * 
 * 使用场景：
 * - 用户在文档列表中删除文档
 * - 文档管理中的批量归档操作
 */
export const archiveDocument = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("目标文档不存在");
    if (document.userId !== userId) throw new Error("无权归档此文档");

    if (document.isArchived === true) {
      return { success: true, updated: false } as const;
    }

    await ctx.db.patch(args.id, { isArchived: true });
    return { success: true, updated: true } as const;
  },
});


/**
 * 取消归档文档
 * 
 * 将已归档的文档恢复到正常状态，使其重新出现在文档列表中，因为：
 * 1. 用户可能误操作归档了文档
 * 2. 需要重新启用之前归档的文档
 * 
 * 使用场景：
 * - 归档列表中恢复文档
 * - 撤销误操作的归档
 */
export const unarchiveDocument = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("目标文档不存在");
    if (document.userId !== userId) throw new Error("无权取消归档此文档");

    if (document.isArchived === false) {
      return { success: true, updated: false } as const;
    }

    await ctx.db.patch(args.id, { isArchived: false });
    return { success: true, updated: true } as const;
  },
});


/**
 * 永久删除文档（硬删除）
 * 
 * 此接口会彻底删除文档及其所有块，操作不可逆，因此需要严格的前置检查：
 * 1. 检查是否有其他文档的引用块引用了此文档
 * 2. 如果存在引用，拒绝删除并返回引用信息，要求用户先手动解除引用关系
 * 3. 如果无引用，删除文档本身和文档的所有块（内容块和引用块）
 * 
 * 设计理由：
 * - 防止破坏数据完整性：避免引用块指向已删除的文档
 * - 用户明确控制：让用户清楚了解依赖关系，主动解除引用
 * - 避免级联删除：不自动删除其他文档，保证数据安全
 * 
 * 使用场景：
 * - 用户确认彻底删除文档
 * - 清理不再需要的文档数据
 */
export const deleteDocument = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const document = await ctx.db.get(args.id);
    if (!document) throw new Error("目标文档不存在");
    if (document.userId !== userId) throw new Error("无权删除此文档");

    const referencingBlocks = await ctx.db
      .query("blocks")
      .withIndex("by_referenceId", (q) => q.eq("referenceId", args.id))
      .collect();

    if (referencingBlocks.length > 0) {
      const references = await Promise.all(
        referencingBlocks.map(async (block) => {
          const refDoc = await ctx.db.get(block.documentId);
          return {
            blockId: block._id,
            documentId: block.documentId,
            documentTitle: refDoc?.title ?? "未知文档",
          };
        })
      );

      return {
        success: false,
        deleted: false,
        reason: "has_references" as const,
        message: `此文档被 ${references.length} 个其他文档引用，请先解除引用关系`,
        references,
      };
    }

    // 获取该文档的所有块
    const blocksToDelete = await ctx.db
      .query("blocks")
      .withIndex("by_documentId_order", (q) => q.eq("documentId", args.id))
      .collect();

    await Promise.all(blocksToDelete.map((block) => ctx.db.delete(block._id)));

    await ctx.db.delete(args.id);

    return {
      success: true,
      deleted: true,
      deletedBlocksCount: blocksToDelete.length,
    } as const;
  },
});




/**
 * [内部] 更新块内容 (用于流式传输)
 * 
 * 设计特性：
 * - 作为内部mutation，只能被服务器端的action调用，保证安全性
 * - 无权限检查，因为权限验证已在调用方action中完成，避免重复开销
 * - 专为流式写入场景优化：零查询，直接patch，最高性能
 * - 每次调用都会覆盖块的content字段
 * 
 * 使用场景：
 * - AI流式生成内容时，高频调用更新块内容
 * - 从action或工具函数中调用
 */
export const updateBlockContent = internalMutation({
  args: {
    blockId: v.id("blocks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.blockId, { 
      content: args.content 
    });
  },
});