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
    // 文档的标题，必填
    title: v.string(),
    // 文档的描述信息，可选
    description: v.optional(v.string()),
    // 提示词的前置信息（例如，提示词的背景信息、角色扮演指令等），可选
    promptPrefix: v.optional(v.string()),
    // 提示词的后置信息（例如，输出格式要求、结束语等），可选
    promptSuffix: v.optional(v.string()), 
    // 软删除标记，默认为 false
    isArchived: v.boolean(),
    // 该文档包含的引用块数量（冗余存储用于提升查询性能，避免每次聚合查询）
    referenceCount: v.number(),
  })
    // 按用户ID索引，用于查询用户的所有文档
    .index("by_userId", ["userId"])
    // 按用户ID和模块标题索引，方便用户查找自己创建的特定模块（若标题在用户级别需要唯一性或常用于搜索）
    .index("by_userId_title", ["userId", "title"]),

  // 块表（新架构）
  // 系统的核心，定义了所有文档的具体内容和结构
  blocks: defineTable({
    // 该块所属的父文档ID，关联到documents表的_id字段
    documentId: v.id("documents"),
    // 块的类型。初期支持 'text' 和 'reference'
    type: v.union(v.literal("text"), v.literal("reference")),
    // 文本内容。为内容块时，有值；为引用块时，为空
    content: v.optional(v.string()),
    // 引用的文档ID。仅当 type === 'reference' 时有值，关联到documents表的_id字段
    referenceId: v.optional(v.id("documents")),
    // 该块在其父文档中的显示顺序，从0开始
    order: v.number(),
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