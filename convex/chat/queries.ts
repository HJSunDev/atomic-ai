import { query } from "../_generated/server";
import { v } from "convex/values";
import { groupConversationsByTime } from "../_lib/timeUtils";

/**
 * 获取用户的对话列表
 * 用于侧边栏显示用户的历史对话记录
 */
export const getUserConversations = query({
  args: {},
  handler: async (ctx, args) => {
    // 从认证上下文获取用户ID
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    
    return conversations;
  },
});

/**
 * 获取对话中的消息记录
 * 用于聊天界面显示完整的对话历史
 */
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // 验证用户身份
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    // 验证会话属于当前用户
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("无权访问此会话");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId_and_isChosenReply", (q) =>
        q.eq("conversationId", args.conversationId).eq("isChosenReply", true)
      )
      .order("asc")
      .collect();
    
    return messages;
  },
});



/**
 * 获取消息的多个AI回复选项
 * 用于显示一个问题的多个AI回答，供用户查看和选择最佳答案
 */
export const getMessageReplies = query({
  args: {
    parentMessageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("messages")
      .withIndex("by_parentMessageId", (q) => q.eq("parentMessageId", args.parentMessageId))
      .order("asc")
      .collect();
    
    return replies;
  },
});

/**
 * 获取当前用户的所有会话，并按时间分组
 * 分组规则：今天、昨天、7天内、30天内、更早
 * 只有存在会话的分组才会被返回
 * 返回一个对象，包含 "favorited" 和 "grouped" 两个部分
 */
export const listGroupedByTime = query({
  args: {},
  handler: async (ctx) => {
    // 1. 获取认证用户信息
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // 返回一个空结构，前端处理未登录状态
      return { favorited: [], grouped: [] };
    }
    const userId = identity.subject;

    // 2. 查询该用户的所有已收藏会话
    const favoritedConversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId_isFavorited", (q) =>
        q.eq("userId", userId).eq("isFavorited", true)
      )
      .order("desc")
      .collect();

    // 3. 查询该用户的所有未收藏会话
    const regularConversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      // 过滤掉 isFavorited 为 true 的会话，正确处理 undefined 和 false 的情况
      .filter((q) => q.neq(q.field("isFavorited"), true))
      .order("desc")
      .collect();

    // 4. 使用工具函数对常规会话进行分组
    const groupedConversations = groupConversationsByTime(regularConversations);

    // 5. 返回最终的数据结构
    return {
      favorited: favoritedConversations,
      grouped: groupedConversations,
    };
  },
});