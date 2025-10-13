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