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
 */
export const listGroupedByTime = query({
  args: {},
  handler: async (ctx) => {
    // 1. 获取认证用户信息
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // 如果用户未认证，根据业务需求可以抛出错误或返回空数组。
      // 在这里我们选择返回空数组，因为前端可能需要优雅地处理未登录状态。
      return [];
    }

    // 2. 从数据库查询该用户的所有会话
    // 使用在 schema 中定义的 `by_userId` 索引来高效查询，并按创建时间降序排列。
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    // 3. 如果没有会话，直接返回空数组
    if (conversations.length === 0) {
      return [];
    }
    
    // 4. 使用抽离的工具函数进行分组，保持本函数职责单一
    return groupConversationsByTime(conversations);
  },
});