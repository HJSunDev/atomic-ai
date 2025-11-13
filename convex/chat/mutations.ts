import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { generateConversationTitle } from "../_lib/chatUtils";
import { Id } from "../_generated/dataModel";

/**
 * 更新消息内容
 * 支持两种场景：1) 流式传输中更新AI回复 2) 用户修改自己的历史消息
 */
export const updateMessageContent = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    // 内部调用时跳过权限验证，前端调用时需要验证
    skipAuth: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 如果不是内部调用，需要验证用户权限
    if (!args.skipAuth) {
      const userId = (await ctx.auth.getUserIdentity())?.subject;
      if (!userId) throw new Error("未授权访问");
      
      const message = await ctx.db.get(args.messageId);
      if (!message) throw new Error("消息不存在");
      
      // 验证会话属于当前用户
      const conversation = await ctx.db.get(message.conversationId);
      if (!conversation || conversation.userId !== userId) {
        throw new Error("无权修改此消息");
      }
      
      // 只允许修改用户自己的消息
      if (message.role !== "user") {
        throw new Error("只能修改自己的消息");
      }
    }
    
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

/**
 * 更新消息元数据
 * 记录AI回复的token消耗、响应时间等指标
 * 仅供内部调用，不对前端开放
 */
export const updateMessageMetadata = internalMutation({
  args: {
    messageId: v.id("messages"),
    metadata: v.object({
      status: v.optional(v.union(
        v.literal("success"),
        v.literal("error"),
        v.literal("pending")
      )),
      aiModel: v.optional(v.string()),
      tokensUsed: v.optional(v.number()),
      durationMs: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      metadata: args.metadata,
    });
  },
});

/**
 * 更新消息的 Agent 执行步骤
 * 用于记录 Agent 执行过程中的工具调用步骤（如联网搜索）
 * 支持实时更新步骤状态，让前端可以展示 "正在搜索..." → "已找到资料" 的进度
 * 仅供内部调用，不对前端开放
 */
export const updateMessageAgentSteps = internalMutation({
  args: {
    messageId: v.id("messages"),
    steps: v.array(
      v.object({
        // 步骤类型，例如 "web_search"
        type: v.string(),
        // 步骤的当前状态
        status: v.union(
          v.literal("started"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("failed")
        ),
        // 步骤的输入，例如 Agent 决定的搜索查询词
        input: v.optional(v.any()),
        // 步骤的输出，例如搜索结果
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
        // 错误信息（当 status 为 "failed" 时）
        error: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      steps: args.steps,
    });
  },
});

/**
 * 选择AI回复作为主要答案
 * 当有多个AI回复时，用户选择其中一个作为主对话线
 */
export const markMessageAsChosen = mutation({
  args: {
    messageId: v.id("messages"),
    parentMessageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    // 首先取消同一父消息下所有回复的选中状态
    const siblings = await ctx.db
      .query("messages")
      .withIndex("by_parentMessageId", (q) => 
        q.eq("parentMessageId", args.parentMessageId)
      )
      .collect();
    
    // 批量更新所有兄弟消息为未选中
    for (const sibling of siblings) {
      await ctx.db.patch(sibling._id, { isChosenReply: false });
    }
    
    // 设置当前消息为选中
    await ctx.db.patch(args.messageId, { isChosenReply: true });
  },
});

/**
 * 更新对话标题
 * 用户可以为对话重命名，便于识别和管理
 */
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    // 权限校验：确保只有会话所有者才能修改
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("用户未认证，无法更新会话标题。");
    }

    const existingConversation = await ctx.db.get(args.conversationId);

    // 检查会话是否存在
    if (!existingConversation) {
      throw new Error("会话未找到。");
    }

    // 检查当前用户是否是会话的所有者
    if (existingConversation.userId.toString() !== identity.subject) {
      throw new Error("无权修改此会话的标题。");
    }
    
    // 更新标题
    await ctx.db.patch(args.conversationId, { title: args.newTitle });


    // 可选：返回成功状态或更新后的文档
    return { success: true };
  },
});

/**
 * 删除一个会话及其所有相关的消息。
 * @param conversationId - 要删除的会话的ID。
 */
export const deleteConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    // 1. 验证用户身份
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("用户未认证，无法删除");
    }
    const userId = identity.subject;

    // 2. 验证会话所有权
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("会话未找到");
    }
    if (conversation.userId !== userId) {
      throw new Error("无权删除此会话");
    }

    // 3. 查询与该会话相关的所有消息
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conversationId))
      .collect();

    // 4. 批量删除所有相关消息
    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));

    // 5. 删除会话本身
    await ctx.db.delete(conversationId);

    return { success: true };
  },
});

/**
 * 开启一轮对话
 */
export const startNewChatRound = mutation({
  args: {
    userMessage: v.string(),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    conversationId: Id<"conversations">;
    userMessageId: Id<"messages">;
    assistantMessageId: Id<"messages">;
  }> => {
    // 1. 验证用户身份
    const userId = (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error("未授权访问");

    let convId = args.conversationId;

    // 2. 如果没有会话ID，创建新会话
    if (!convId) {
      const title = generateConversationTitle(args.userMessage);
      convId = await ctx.db.insert("conversations", {
        userId: userId,
        title: title,
      });
    }

    // 3. 创建用户消息
    // 注意：用户消息永远是对话树的根节点，parentMessageId 总是 undefined
    // 系统消息和用户消息的isChosenReply字段默认都是true，以简化查询
    const userMessageId = await ctx.db.insert("messages", {
      conversationId: convId,
      parentMessageId: undefined,
      role: "user",
      content: args.userMessage,
      isChosenReply: true,
    });

    // 4. 创建空的AI消息作为占位符
    const assistantMessageId = await ctx.db.insert("messages", {
      conversationId: convId,
      parentMessageId: userMessageId,
      role: "assistant",
      content: "", // 内容为空，等待action填充
      isChosenReply: true,
      metadata: {
        status: "pending",
      },
    });

    return {
      conversationId: convId,
      userMessageId,
      assistantMessageId,
    };
  },
});

/**
 * 切换会话的收藏状态。
 * @param conversationId - 要操作的会话的ID。
 * @param isFavorited - 目标收藏状态 (true 或 false)。
 */
export const toggleConversationFavorite = mutation({
  args: {
    conversationId: v.id("conversations"),
    isFavorited: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 1. 验证用户身份
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("用户未认证，无法进行操作");
    }
    const userId = identity.subject;

    // 2. 验证会话所有权
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("无权操作此会话");
    }

    // 3. 更新收藏状态
    await ctx.db.patch(args.conversationId, {
      isFavorited: args.isFavorited,
    });

    return { success: true };
  },
}); 



