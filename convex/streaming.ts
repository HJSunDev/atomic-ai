import { httpAction, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { PersistentTextStreaming } from "@convex-dev/persistent-text-streaming";
import { v } from "convex/values";

// 初始化 Persistent Text Streaming 组件
const persistentTextStreaming = new PersistentTextStreaming(
  components.persistentTextStreaming
);

// 验证器
const StreamIdValidator = v.string();

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

// HTTP Action: 处理流式传输
export const streamText = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const { streamId, content, chunkSize, delay } = body;
    
    if (!streamId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "streamId 是必需的",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 模拟AI内容生成的函数
    const generateMockContent = async (ctx: any, request: any, streamId: any, chunkAppender: any) => {
      const textContent = content || "这是一个使用 Convex Persistent Text Streaming 的模拟AI回复示例。通过这个官方组件，我们可以实现更强大的流式传输功能，包括断线重连、多用户同时观看、以及完整的状态持久化。现在你看到的文本是逐字符流式传输的，就像真正的AI模型生成内容一样。";
      const simulatedChunkSize = chunkSize || 2; // 每次传输的字符数
      const simulatedDelay = delay || 150; // 延迟毫秒数
      
      // 逐块发送内容
      for (let i = 0; i < textContent.length; i += simulatedChunkSize) {
        const chunk = textContent.slice(i, i + simulatedChunkSize);
        
        // 使用组件的 chunkAppender 来添加内容
        await chunkAppender(chunk);
        
        // 模拟AI生成的延迟
        if (simulatedDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, simulatedDelay));
        }
      }
      
      // 可以在最后添加一个完成标记
      await chunkAppender("\n\n[✅ 生成完成]");
    };

    // 使用 Persistent Text Streaming 组件的 stream 方法
    const response = await persistentTextStreaming.stream(
      ctx,
      request,
      streamId,
      generateMockContent
    );

    // 设置 CORS 头
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Vary", "Origin");

    return response;
  } catch (error) {
    console.error("流式传输错误:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "流式传输失败",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

// OPTIONS 预检请求处理
export const streamTextOptions = httpAction(async (ctx, request) => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}); 