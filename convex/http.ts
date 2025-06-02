import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

// 创建 HTTP 路由
const http = httpRouter();

// GET /api/hello-world - 获取默认的 hello world 消息
http.route({
  path: "/hello-world",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      return new Response(
        JSON.stringify({
          message: "hello world",
          timestamp: new Date().toISOString(),
          status: "success",
          source: "convex"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            // 允许跨域访问
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "获取数据失败",
          source: "convex"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
});

// POST /api/hello-world - 接收参数，返回个性化问候
http.route({
  path: "/hello-world",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // 解析请求体
      const body = await request.text();
      let data: any = {};
      
      if (body) {
        try {
          data = JSON.parse(body);
        } catch (parseError) {
          return new Response(
            JSON.stringify({
              error: "Bad Request",
              message: "请求数据格式错误",
              source: "convex"
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      const name = data.name || "world";
      
      return new Response(
        JSON.stringify({
          message: `hello ${name}`,
          timestamp: new Date().toISOString(),
          status: "success",
          source: "convex"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: "处理请求失败",
          source: "convex"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  }),
});

// OPTIONS 预检请求处理
http.route({
  path: "/hello-world",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});


export default http; 