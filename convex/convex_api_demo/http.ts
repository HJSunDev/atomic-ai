import { HttpRouter } from "convex/server";
import {
  getHelloWorld,
  postHelloWorld,
  postTextStream,
  optionsHelloWorld,
  optionsTextStream,
} from "./httpActions";

/**
 * 注册 Convex API Demo 模块的 HTTP 路由
 * @param http HTTP 路由器实例
 */
export function registerConvexApiDemoRoutes(http: HttpRouter) {
  // GET /hello-world - 获取默认的 hello world 消息
  http.route({
    path: "/hello-world",
    method: "GET",
    handler: getHelloWorld,
  });

  // POST /hello-world - 接收参数，返回个性化问候
  http.route({
    path: "/hello-world",
    method: "POST",
    handler: postHelloWorld,
  });

  // OPTIONS 预检请求处理 - hello-world 接口
  http.route({
    path: "/hello-world",
    method: "OPTIONS",
    handler: optionsHelloWorld,
  });

  // POST /text-stream - 流式文本传输接口
  http.route({
    path: "/text-stream",
    method: "POST",
    handler: postTextStream,
  });

  // OPTIONS 预检请求处理 - text-stream 接口
  http.route({
    path: "/text-stream",
    method: "OPTIONS",
    handler: optionsTextStream,
  });
} 