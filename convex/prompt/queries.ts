import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";


/**
 * 查询当前用户的所有未归档文档列表
 * 
 * 此接口不返回文档的块内容，因为：
 * 1. 列表场景下加载所有块会导致不必要的性能开销
 * 2. 前端通常只需要文档元信息用于列表展示
 * 3. 块内容应当在用户打开特定文档时按需加载
 */
export const listDocuments = query({
  args: {},
  handler: async (ctx): Promise<Doc<"documents">[]> => {
    // 权限校验：必须是已认证用户才能访问
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 查询当前用户的所有未归档文档
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // 过滤出未归档的文档
    return documents.filter((doc) => doc.isArchived !== true);
  },
});


/**
 * 按标题搜索当前用户的文档
 * 
 * 设计特性：
 * - 使用子串匹配（includes），支持标题任意位置匹配
 * - 不区分大小写
 * - 自动过滤归档文档
 * - 空搜索词返回所有未归档文档
 * - 支持中英文混合搜索
 * 
 * 实现说明：
 * - 原本使用 searchIndex，但其基于分词，无法很好支持中间匹配
 * - 改用应用层过滤，在用户级别文档数量可控的情况下性能可接受
 * - 如果将来数据量增大，可考虑集成专业搜索引擎（如 Algolia、Elasticsearch）
 * 
 * @param searchTerm - 搜索关键词，为空时返回所有文档
 * @returns 匹配的文档列表，按创建时间降序排列
 */
export const searchDocumentsByTitle = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"documents">[]> => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 查询用户的所有未归档文档
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    const unarchived = documents.filter((doc) => doc.isArchived !== true);

    // 空搜索词返回所有文档
    const searchTerm = args.searchTerm.trim();
    if (!searchTerm) {
      return unarchived;
    }

    // 不区分大小写的子串匹配（支持标题任意位置）
    const searchLower = searchTerm.toLowerCase();
    return unarchived.filter((doc) => {
      const titleLower = (doc.title || "").toLowerCase();
      return titleLower.includes(searchLower);
    });
  },
});


/**
 * 获取文档及其内容块
 * 
 * 用于获取单个文档的详细信息，包括文档元数据和关联的内容块
 * 适用于文档查看、编辑等多种场景
 * 
 * @param documentId - 文档ID
 * @returns 包含文档和内容块的对象，如果文档不存在或无权限则返回null
 * 
 * 返回结构：
 * {
 *   document: {
 *     _id, _creationTime, userId, title, description, 
 *     promptPrefix, promptSuffix, isArchived, referenceCount
 *   },
 *   contentBlock: {
 *     _id, _creationTime, documentId, type: "text", 
 *     content, order
 *   }
 * }
 */
export const getDocumentWithContent = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const document = await ctx.db.get(args.documentId);
    if (!document) return null;
    if (document.userId !== userId) return null;
    if (document.isArchived) return null;

    const contentBlock = await ctx.db
      .query("blocks")
      .withIndex("by_documentId_type", (q) => 
        q.eq("documentId", args.documentId).eq("type", "text")
      )
      .first();

    if (!contentBlock) {
      throw new Error("文档内容块不存在");
    }

    return {
      document,
      contentBlock,
    };
  },
});


/**
 * 文档大纲项类型定义
 */
type OutlineItem = 
  | { kind: 'content'; order: number }
  | { 
      kind: 'reference'; 
      order: number; 
      referencedDocument: {
        _id: Id<"documents">;
        title?: string;
        description?: string;
        promptPrefix?: string;
        promptSuffix?: string;
        referenceCount: number;
      };
    };

/**
 * 文档大纲类型定义
 */
type DocumentOutline = {
  documentId: Id<"documents">;
  items: OutlineItem[];
};

/**
 * 获取文档的大纲结构（内容块占位 + 引用块元信息）
 * 
 * 设计特性：
 * - 轻量级：只返回块级大纲，不返回内容块正文，不递归引用文档的块
 * - 扁平化：items 按 order 排序，包含自身内容块占位和所有引用块的元信息
 * - 权限隔离：自动过滤不属于当前用户或已归档的引用目标
 * - 允许重复引用：同一文档可被引用多次，每次都是独立的引用块
 * 
 * 使用场景：
 * - 操作区需要展示文档的可排序子模块列表（内容块 + 引用块）
 * - 组合文档时需要了解文档结构但不需要完整内容
 * 
 * 返回结构示例：
 * {
 *   documentId: "doc-a",
 *   items: [
 *     { kind: 'content', order: 0 },
 *     { kind: 'reference', order: 1, referencedDocument: {...} },
 *     { kind: 'reference', order: 2, referencedDocument: {...} }
 *   ]
 * }
 */
export const getDocumentOutline = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args): Promise<DocumentOutline | null> => {
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const document = await ctx.db.get(args.documentId);
    if (!document) return null;
    if (document.userId !== userId) return null;
    if (document.isArchived) return null;

    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_documentId_order", (q) => q.eq("documentId", args.documentId))
      .collect();

    const items: (OutlineItem | null)[] = await Promise.all(
      blocks.map(async (block): Promise<OutlineItem | null> => {
        if (block.type === "text") {
          return {
            kind: 'content',
            order: block.order,
          };
        }

        if (block.type === "reference" && block.referenceId) {
          const referencedDoc = await ctx.db.get(block.referenceId);
          
          if (!referencedDoc) return null;
          if (referencedDoc.userId !== userId) return null;
          if (referencedDoc.isArchived) return null;

          return {
            kind: 'reference',
            order: block.order,
            referencedDocument: {
              _id: referencedDoc._id,
              title: referencedDoc.title,
              description: referencedDoc.description,
              promptPrefix: referencedDoc.promptPrefix,
              promptSuffix: referencedDoc.promptSuffix,
              referenceCount: referencedDoc.referenceCount,
            },
          };
        }

        return null;
      })
    );

    const validItems = items.filter((item): item is OutlineItem => item !== null);

    return {
      documentId: args.documentId,
      items: validItems,
    };
  },
});



/**
 * 块数据结构（含递归引用文档）
 */
type EnrichedBlock = Doc<"blocks"> & {
  // 当块类型为reference时，此字段包含被引用文档的完整数据（递归结构）
  referencedDocument: DocumentWithBlocks | null;
};

/**
 * 文档数据结构（含完整块列表）
 */
type DocumentWithBlocks = {
  // 文档元数据
  document: Doc<"documents">;
  // 文档的所有块（按order排序，引用块包含递归的子文档数据）
  blocks: EnrichedBlock[];
};


/**
 * 获取文档及其所有块内容（支持递归获取引用文档）
 * 
 * 设计特性：
 * - 递归深度限制：默认2层（包括根文档），避免过深递归导致性能问题
 * - 循环引用防护：通过路径追踪机制，自动跳过循环引用的文档
 * - 缓存优化：同一文档在递归树中只会查询一次，大幅提升性能
 * - 权限隔离：仅返回当前用户拥有的文档数据
 * - 允许重复引用：支持一个文档的多个块引用同一个目标文档
 * 
 * 使用场景：
 * - 用户点击文档进行详细查看
 * - 需要完整渲染文档内容（包括引用的子文档）
 * 
 * 返回的结构：
 * {
    document: {
      _id: "doc-a",
      _creationTime: 1234567890,
      userId: "user_xxx",
      title: "我的文档A",
      description: "这是一个示例文档",
      promptPrefix: "你是一个助手...",
      promptSuffix: "请用markdown格式输出",
      isArchived: false
    },
    blocks: [
      {
        _id: "block-1",
        documentId: "doc-a",
        type: "text",
        content: "这是文本内容",
        order: 0,
        referencedDocument: null  // 文本块没有引用
      },
      {
        _id: "block-2",
        documentId: "doc-a",
        type: "reference",
        referenceId: "doc-b",
        order: 1,
        referencedDocument: {
          document: {  // ← 被引用文档的完整信息
            _id: "doc-b",
            userId: "user_xxx",
            title: "被引用的文档B",
            description: "...",
            // ... 其他字段
          },
          blocks: [
            // 文档B的块
          ]
        }
      }
    ]
  }
 */
export const getDocumentWithBlocks = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args): Promise<DocumentWithBlocks | null> => {
    // 权限校验：必须是已认证用户才能访问
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 递归深度限制（包括根文档）
    const MAX_DEPTH = 2;

    // 全局缓存：避免同一文档被重复查询
    const documentCache = new Map<Id<"documents">, Doc<"documents">>();
    const blocksCache = new Map<Id<"documents">, Doc<"blocks">[]>();

    /**
     * 递归获取文档及其块内容
     * 
     * @param docId 要查询的文档ID
     * @param currentDepth 当前递归深度（根文档为1）
     * @param visitedInPath 当前路径中已访问的文档ID集合（用于检测循环引用）
     */
    async function fetchDocumentRecursive(
      docId: Id<"documents">,
      currentDepth: number,
      visitedInPath: Set<Id<"documents">>
    ): Promise<DocumentWithBlocks | null> {

      // 终止条件: 深度超限
      if (currentDepth > MAX_DEPTH) {
        return null;
      }

      // 终止条件: 循环引用检测,如果当前路径中已包含该文档，则停止递归
      if (visitedInPath.has(docId)) {
        return null;
      }

      // 从缓存获取文档（缓存未命中时查询数据库）
      let document = documentCache.get(docId);
      if (!document) {
        // 获取文档信息,并缓存，文档信息用于
        const fetchedDoc = await ctx.db.get(docId);
        if (!fetchedDoc) return null;
        document = fetchedDoc;
        documentCache.set(docId, fetchedDoc);
      }

      // 终止条件：文档不属于当前用户
      if (document.userId !== userId) {
        return null;
      }

      // 终止条件：文档已归档
      if (document.isArchived) {
        return null;
      }

      // 从缓存获取块列表（缓存未命中时查询数据库）
      let blocks = blocksCache.get(docId);
      if (!blocks) {
        blocks = await ctx.db
          .query("blocks")
          .withIndex("by_documentId_order", (q) => q.eq("documentId", docId))
          .collect();
        blocksCache.set(docId, blocks);
      }

      // 更新路径访问记录（创建新Set以避免影响其他分支）
      const newVisitedInPath = new Set(visitedInPath);
      newVisitedInPath.add(docId);

      // 处理每个块：对于引用类型的块，递归获取被引用文档的完整数据
      const enrichedBlocks: EnrichedBlock[] = await Promise.all(
        blocks.map(async (block): Promise<EnrichedBlock> => {
          // 引用块，递归获取被引用文档的完整数据
          if (block.type === "reference" && block.referenceId) {
            const referencedDoc = await fetchDocumentRecursive(
              block.referenceId,
              currentDepth + 1,
              newVisitedInPath
            );
            return {
              ...block,
              referencedDocument: referencedDoc,
            };
          }
          // 内容块，直接返回
          return {
            ...block,
            referencedDocument: null,
          };
        })
      );

      return {
        document,
        blocks: enrichedBlocks,
      };
    }

    // 从根文档开始递归查询（深度为1，访问路径为空）
    return await fetchDocumentRecursive(args.documentId, 1, new Set());
  },
});




/**
 * [内部] 获取指定ID的文档
 * 用于action中验证文档存在性和所有权
 */
export const getDocumentById = internalQuery({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


/**
 * [内部] 获取文档的内容块
 * 用于action中获取需要更新的block
 */
export const getDocumentContentBlock = internalQuery({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blocks")
      .withIndex("by_documentId_type", (q) => 
        q.eq("documentId", args.documentId).eq("type", "text")
      )
      .first();
  },
});


/**
 * [内部] 获取指定ID的块
 * 用于 Agent 场景中获取块的当前 steps 状态
 */
export const getBlockById = internalQuery({
  args: {
    blockId: v.id("blocks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.blockId);
  },
});