import { defineTable } from "convex/server";
import { v } from "convex/values";

export const promptSchema = {
  // 提示词模块表
  // 用于管理和维护模块化的提示词
  promptModules: defineTable({
    // 创建该模块的Clerk User ID
    userId: v.string(),
    // 模块的标题，必填
    title: v.string(),
    // 模块的描述信息，可选
    description: v.optional(v.string()),
    // 提示词的前置信息（例如，给大模型的上下文、角色扮演指令等），可选
    promptPrefix: v.optional(v.string()),
    // 模块的核心提示词内容，必填
    promptContent: v.string(),
    // 软删除标记，默认为 false。创建时需在mutation中设置为false
    isArchived: v.boolean(),
    // 注意：`fullPrompt` (完整提示词) 将通过Convex query动态构建，不在数据库中直接存储
    // 这样可以确保数据的一致性，避免冗余存储和更新复杂性
  })
    // 按用户ID索引，方便查询某用户创建的所有提示词模块
    .index("by_userId", ["userId"])
    // 按用户ID和模块标题索引，方便用户查找自己创建的特定模块（若标题在用户级别需要唯一性或常用于搜索）
    .index("by_userId_title", ["userId", "title"]),

  // 提示词模块关系表
  // 定义提示词模块之间的父子关系，实现模块的组合和嵌套
  promptModuleRelationships: defineTable({
    // 父模块的ID，关联到promptModules表
    parentId: v.id("promptModules"),
    // 子模块的ID，关联到promptModules表
    childId: v.id("promptModules"),
    // 子模块在父模块中的顺序
    order: v.number()
  })
    // 按父模块ID索引，方便快速查找一个模块的所有直接子模块，并且按照顺序排列
    .index("by_parentId_order", ["parentId", "order"])
    // 按子模块ID索引，方便快速查找一个模块作为子模块的所有父模块（可用于分析依赖、防止循环等）
    .index("by_childId", ["childId"])
    // 联合索引，确保同一对父子关系不重复（需在mutation中配合检查），或快速查找特定的父子关系
    .index("by_parentId_childId", ["parentId", "childId"]),



  // 文档表（新架构）
  // 顶级容器，不直接存储内容，作为块的集合
  documents: defineTable({
    // 创建该文档的Clerk User ID
    userId: v.string(),
    // 文档的标题，可选
    title: v.optional(v.string()),
    // 文档的描述信息，可选
    description: v.optional(v.string()),
    // 提示词的前置信息（例如，提示词的背景信息、角色扮演指令等），可选
    promptPrefix: v.optional(v.string()),
    // 提示词的后置信息（例如，输出格式要求、结束语等），可选
    promptSuffix: v.optional(v.string()), 
    // 软删除标记，默认为 false
    isArchived: v.boolean(),
    // 最后打开时间 (Unix时间戳 ms)
    lastOpenedAt: v.optional(v.number()),
    // 该文档包含的引用块数量（冗余存储用于提升查询性能，避免每次聚合查询）
    referenceCount: v.number(),
    
    // 发布相关字段
    isPublished: v.optional(v.boolean()), // 是否已发布
    publishedAt: v.optional(v.number()), // 发布时间

    // 社区/统计字段
    authorName: v.optional(v.string()), // 作者名 (快照)
    authorAvatar: v.optional(v.string()), // 作者头像 (快照)
    views: v.optional(v.number()), // 查看/访问数
    likes: v.optional(v.number()), // 点赞数
    clones: v.optional(v.number()), // 复用/克隆数
    tags: v.optional(v.array(v.string())), // 标签
  })
    // 按用户ID索引，用于查询用户的所有文档
    .index("by_userId", ["userId"])
    // 按用户ID和模块标题索引，方便用户查找自己创建的特定模块（若标题在用户级别需要唯一性或常用于搜索）
    .index("by_userId_title", ["userId", "title"])
    // 文档标题搜索索引，支持按用户ID过滤的全文搜索
    .searchIndex("search_documents_by_title", {
      searchField: "title",
      filterFields: ["userId"], 
    })
    // 按用户ID和最后打开时间索引，用于“最近访问”列表的高效查询
    .index("by_userId_lastOpenedAt", ["userId", "lastOpenedAt"])
    // 用于查询公开已发布的文档
    .index("by_published", ["isPublished", "publishedAt"]),

  // 块表（新架构）
  // 系统的核心，定义了所有文档的具体内容和结构
  blocks: defineTable({
    // 该块所属的父文档ID，关联到documents表的_id字段
    documentId: v.id("documents"),
    // 块的类型。初期支持 'text' 和 'reference'
    type: v.union(v.literal("text"), v.literal("reference")),
    // 文本内容（Tiptap JSON 格式字符串）。为内容块时，有值；为引用块时，为空
    // 用于：用户手动编辑的内容、AI 生成完成后转换的内容
    content: v.optional(v.string()),
    // 文档内容的 Markdown 缓存（惰性更新）
    // 用于：AI 上下文构建、Markdown 预览等只读场景
    // 策略：仅在写操作结束时（防抖+空闲）更新，不保证与 content 实时一致，但保证最终一致
    contentMarkdown: v.optional(v.string()),
    // AI 流式生成的临时内容（Markdown 格式字符串）
    // 仅在 AI 生成过程中使用，用于前端实时渲染，生成完成后会转换为 JSON 格式存入 content 字段
    streamingMarkdown: v.optional(v.string()),
    // 标记当前块是否正在进行 AI 流式内容生成
    // true: AI 正在生成中，前端应渲染 streamingMarkdown；false: 生成完成或用户编辑，前端使用 content
    isStreaming: v.optional(v.boolean()),
    // 引用的文档ID。仅当 type === 'reference' 时有值，关联到documents表的_id字段
    referenceId: v.optional(v.id("documents")),
    // 该块在其父文档中的显示顺序，从0开始
    order: v.number(),
    // AI生成过程中的中间步骤记录（如联网搜索）
    steps: v.optional(
      v.array(
        v.object({
          type: v.string(),
          status: v.union(
            v.literal("started"),
            v.literal("in_progress"),
            v.literal("completed"),
            v.literal("failed")
          ),
          input: v.optional(v.any()),
          output: v.optional(
            v.array(
              v.object({
                title: v.string(),
                url: v.string(),
                content: v.optional(v.string()),
                score: v.optional(v.number()),
                favicon: v.optional(v.string()),
              })
            )
          ),
          error: v.optional(v.string()),
        })
      )
    ),
  })
    // 核心索引：按顺序高效查询某个文档的所有块（渲染文档内容时使用）
    .index("by_documentId_order", ["documentId", "order"])
    // 按文档ID和类型索引，用于筛选特定文档中某种类型的块（例如：只查询所有文本块或引用块）
    .index("by_documentId_type", ["documentId", "type"])
    // 按引用ID索引，用于快速查找所有引用了某个特定文档的块（依赖分析、级联更新、防止循环引用）
    .index("by_referenceId", ["referenceId"])
    // 联合索引：用于检查某个文档是否已经引用了特定文档（防止重复引用同一文档）
    .index("by_documentId_referenceId", ["documentId", "referenceId"]),
}; 