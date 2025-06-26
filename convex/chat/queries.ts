import { query } from "../_generated/server";
import { v } from "convex/values";

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