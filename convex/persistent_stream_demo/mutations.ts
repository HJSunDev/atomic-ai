import { mutation } from "../_generated/server";
import { components } from "../_generated/api";
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";

// 初始化 Persistent Text Streaming 组件
const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming
);

// 创建一个新的流 - 返回 streamId
export const createStream = mutation({
  args: {
    content: v.optional(v.string()),
    chunkSize: v.optional(v.number()),
    delay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 创建流并返回 streamId
    const streamId = await persistentTextStreaming.createStream(ctx);
    
    // 在这里可以保存流的配置参数，但现在我们先不涉及数据库操作
    // 可以通过 streamId 来识别这个流
    
    return streamId;
  },
}); 