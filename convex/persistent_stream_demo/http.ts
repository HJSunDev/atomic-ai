import { type HttpRouter } from "convex/server";
import { streamText, streamTextOptions } from "./httpActions";

// 定义一个函数来注册 persistent_stream_demo 模块的 HTTP 路由
export const registerPersistentStreamDemoRoutes = (http: HttpRouter) => {
  // POST /api/persistent-stream - Persistent Text Streaming 接口
  http.route({
    path: "/persistent-stream",
    method: "POST",
    handler: streamText,
  });

  // OPTIONS 预检请求处理 - Persistent Text Streaming 接口
  http.route({
    path: "/persistent-stream",
    method: "OPTIONS",
    handler: streamTextOptions,
  });

  return http;
}; 