import { query } from "../_generated/server";
import { components } from "../_generated/api";
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";

// 初始化 Persistent Text Streaming 组件
const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming
);

// 验证器
const StreamIdValidator = v.string();

// 获取流的当前内容
export const getStreamBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await persistentTextStreaming.getStreamBody(
      ctx,
      args.streamId as any
    );
  },
}); 