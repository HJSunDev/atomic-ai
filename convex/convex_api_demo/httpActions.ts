import { httpAction } from "../_generated/server";

// GET /hello-world - 获取默认的 hello world 消息
export const getHelloWorld = httpAction(async (ctx, request) => {
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
});

// POST /hello-world - 接收参数，返回个性化问候
export const postHelloWorld = httpAction(async (ctx, request) => {
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
});

// POST /text-stream - 流式文本传输接口
export const postTextStream = httpAction(async (ctx, request) => {
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

    // 获取参数
    const content = data.content || "这是一个流式传输的示例文本";
    const chunkSize = data.chunkSize || 1; // 每次传输的字符数
    const delay = data.delay || 100; // 每次传输的延迟（毫秒）

    // 创建可读流
    const stream = new ReadableStream({
      async start(controller) {
        // 发送开始标记
        const startChunk = JSON.stringify({
          type: "start",
          timestamp: new Date().toISOString(),
          source: "convex",
          totalLength: content.length
        }) + "\n";
        controller.enqueue(new TextEncoder().encode(startChunk));

        // 分块发送内容
        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.slice(i, i + chunkSize);
          const chunkData = JSON.stringify({
            type: "chunk",
            index: Math.floor(i / chunkSize),
            content: chunk,
            timestamp: new Date().toISOString(),
            progress: Math.min(((i + chunkSize) / content.length) * 100, 100).toFixed(2) + "%"
          }) + "\n";
          
          controller.enqueue(new TextEncoder().encode(chunkData));
          
          // 添加延迟以模拟真实的流式传输
          if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

        // 发送结束标记
        const endChunk = JSON.stringify({
          type: "end",
          timestamp: new Date().toISOString(),
          source: "convex",
          totalChunks: Math.ceil(content.length / chunkSize),
          message: "流式传输完成"
        }) + "\n";
        controller.enqueue(new TextEncoder().encode(endChunk));
        
        controller.close();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("流式传输错误:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "流式传输失败",
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
});

// OPTIONS 预检请求处理 - hello-world 接口
export const optionsHelloWorld = httpAction(async (ctx, request) => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
});

// OPTIONS 预检请求处理 - text-stream 接口
export const optionsTextStream = httpAction(async (ctx, request) => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}); 