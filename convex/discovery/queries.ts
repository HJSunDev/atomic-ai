import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";

export type DiscoveryItem = {
  id: string;
  type: "prompt" | "app";
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
  };
  stats: {
    views: number;
    likes: number;
    clones: number;
  };
  tags: string[];
  createdAt: number; // timestamp
  // 用于前端判断当前用户交互状态
  isLikedByMe?: boolean;
};

/**
 * 获取发现页列表
 * 支持按类型筛选 ("all" | "prompt" | "app")
 * 支持按标签筛选 (tags)
 * 支持排序 (latest, popular, likes)
 * 简单的搜索支持 (在内存中过滤)
 */
export const listDiscoveryItems = query({
  args: {
    filter: v.union(v.literal("all"), v.literal("prompt"), v.literal("app")),
    searchQuery: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    sortBy: v.optional(v.union(v.literal("latest"), v.literal("popular"), v.literal("likes"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const currentUserId = identity?.subject;

    let items: DiscoveryItem[] = [];

    // 1. 获取 Prompts
    if (args.filter === "all" || args.filter === "prompt") {
      const prompts = await ctx.db
        .query("documents")
        .withIndex("by_published", (q) => q.eq("isPublished", true))
        .order("desc")
        .take(100); // 限制数量

      const promptItems = prompts.map((p) => ({
        id: p._id,
        type: "prompt" as const,
        title: p.title || "无标题文档",
        description: p.description || p.promptPrefix || "暂无描述",
        author: {
          name: p.authorName || "Anonymous",
          avatar: p.authorAvatar,
        },
        stats: {
          views: p.views || 0,
          likes: p.likes || 0,
          clones: p.clones || 0,
        },
        tags: p.tags || [],
        createdAt: p.publishedAt || p._creationTime,
      }));
      items.push(...promptItems);
    }

    // 2. 获取 Apps
    if (args.filter === "all" || args.filter === "app") {
      const apps = await ctx.db
        .query("apps")
        .withIndex("by_published", (q) => q.eq("isPublished", true))
        .order("desc")
        .take(100);

      const appItems = apps.map((a) => ({
        id: a._id,
        type: "app" as const,
        title: a.name,
        description: a.description || a.prompt || "暂无描述",
        author: {
          name: a.authorName || "Anonymous",
          avatar: a.authorAvatar,
        },
        stats: {
          views: a.views || 0,
          likes: a.likes || 0,
          clones: a.clones || 0,
        },
        tags: a.tags || [],
        createdAt: a.publishedAt || a.creationTime,
      }));
      items.push(...appItems);
    }

    // 3. 内存中过滤 (标签 & 搜索)
    if (args.tags && args.tags.length > 0) {
      items = items.filter(item => 
        args.tags!.some(tag => item.tags.includes(tag))
      );
    }

    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // 4. 内存中排序
    const sortBy = args.sortBy || 'latest';
    items.sort((a, b) => {
      switch (sortBy) {
        case 'popular': // 按浏览量
          return b.stats.views - a.stats.views;
        case 'likes': // 按点赞数
          return b.stats.likes - a.stats.likes;
        case 'latest':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // 5. 补充当前用户的点赞状态 (批量查询优化)
    if (currentUserId) {
        // 只对前 50 个结果进行状态检查 (分页优化)
        const displayItems = items.slice(0, 50);
        
        const likeChecks = await Promise.all(
            displayItems.map(async (item) => {
                const like = await ctx.db
                    .query("likes")
                    .withIndex("by_user_target", q => 
                        q.eq("userId", currentUserId).eq("targetId", item.id)
                    )
                    .first();
                return !!like;
            })
        );
        
        displayItems.forEach((item, index) => {
            item.isLikedByMe = likeChecks[index];
        });
        
        return displayItems;
    }

    return items.slice(0, 50);
  },
});
