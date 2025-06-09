"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiResponse {
  message: string;
  timestamp: string;
  status: string;
  source?: string;
}

// 流式数据的类型定义
interface StreamChunk {
  type: "start" | "chunk" | "end";
  content?: string;
  timestamp: string;
  progress?: string;
  index?: number;
  totalLength?: number;
  totalChunks?: number;
  message?: string;
  source?: string;
}

export default function ConvexApiTestPage() {
  // 状态管理
  const [getResponse, setGetResponse] = useState<ApiResponse | null>(null);
  const [postResponse, setPostResponse] = useState<ApiResponse | null>(null);
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 流式传输相关状态
  const [streamContent, setStreamContent] = useState<string>("");
  const [streamChunkSize, setStreamChunkSize] = useState<number>(10);
  const [streamDelay, setStreamDelay] = useState<number>(100);
  const [streamResult, setStreamResult] = useState<string>("");
  const [streamProgress, setStreamProgress] = useState<string>("0%");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamLogs, setStreamLogs] = useState<StreamChunk[]>([]);
  
  // 获取 Convex HTTP 接口基础 URL
  const getConvexHttpUrl = () => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL 环境变量未配置');
    }
    // Convex HTTP Actions 的正确 URL 格式
    // 从 WebSocket URL 构建 HTTP site URL
    // 例如：wss://greedy-peccary-27.convex.cloud -> https://greedy-peccary-27.convex.site
    const httpUrl = convexUrl
      .replace('wss://', 'https://')
      .replace('ws://', 'http://')
      .replace('.convex.cloud', '.convex.site');
    
    return httpUrl;
  };

  // 测试 GET 请求
  const testGetApi = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getConvexHttpUrl();
      const fullUrl = `${baseUrl}/hello-world`;
      console.log('请求 URL:', fullUrl); // 调试信息
      
      const response = await fetch(fullUrl);
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response, got: ${contentType}. Response: ${text}`);
      }
      
      const data = await response.json();
      setGetResponse(data);
    } catch (error) {
      console.error('GET 请求失败:', error);
      setGetResponse({
        message: `请求失败: ${error}`,
        timestamp: new Date().toISOString(),
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 测试 POST 请求
  const testPostApi = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getConvexHttpUrl();
      const fullUrl = `${baseUrl}/hello-world`;
      console.log('请求 URL:', fullUrl); // 调试信息
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response, got: ${contentType}. Response: ${text}`);
      }
      
      const data = await response.json();
      setPostResponse(data);
    } catch (error) {
      console.error('POST 请求失败:', error);
      setPostResponse({
        message: `请求失败: ${error}`,
        timestamp: new Date().toISOString(),
        status: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 测试流式传输
  const testStreamApi = async () => {
    setIsStreaming(true);
    setStreamResult("");
    setStreamProgress("0%");
    setStreamLogs([]);
    
    try {
      const baseUrl = getConvexHttpUrl();
      const fullUrl = `${baseUrl}/text-stream`;
      console.log('流式传输请求 URL:', fullUrl); // 调试信息
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: streamContent || "这是一个流式传输的示例文本，用于测试 NextJS + Convex 技术栈下的 Persistent Text Streaming 方案。通过这个接口，我们可以验证服务端分块传输数据的能力，以及前端实时接收和展示数据的效果。",
          chunkSize: streamChunkSize,
          delay: streamDelay,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      // 检查是否支持流式读取
      if (!response.body) {
        throw new Error('Response body is null, streaming not supported');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          // 解码数据
          buffer += decoder.decode(value, { stream: true });
          
          // 按行分割数据（每行是一个 JSON 对象）
          const lines = buffer.split('\n');
          buffer = lines.pop() || ""; // 保留最后一个可能不完整的行
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const chunk: StreamChunk = JSON.parse(line);
                setStreamLogs(prev => [...prev, chunk]);
                
                if (chunk.type === "chunk" && chunk.content) {
                  accumulatedContent += chunk.content;
                  setStreamResult(accumulatedContent);
                  if (chunk.progress) {
                    setStreamProgress(chunk.progress);
                  }
                } else if (chunk.type === "start") {
                  console.log('流式传输开始:', chunk);
                } else if (chunk.type === "end") {
                  console.log('流式传输结束:', chunk);
                }
              } catch (parseError) {
                console.error('解析流式数据错误:', parseError, '原始数据:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
    } catch (error) {
      console.error('流式传输失败:', error);
      setStreamLogs(prev => [...prev, {
        type: "end",
        timestamp: new Date().toISOString(),
        message: `流式传输失败: ${error}`,
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Convex HTTP API 接口测试</h1>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">接口信息:</h3>
        <p className="text-sm">
          <strong>WebSocket URL:</strong> <code className="bg-white px-2 py-1 rounded">{process.env.NEXT_PUBLIC_CONVEX_URL}</code>
        </p>
        <p className="text-sm mt-1">
          <strong>HTTP Site URL:</strong> <code className="bg-white px-2 py-1 rounded">{getConvexHttpUrl()}</code>
        </p>
        <p className="text-sm mt-1">
          <strong>标准接口:</strong> <code className="bg-white px-2 py-1 rounded">/hello-world</code>
        </p>
        <p className="text-sm mt-1">
          <strong>流式接口:</strong> <code className="bg-white px-2 py-1 rounded">/text-stream</code>
        </p>
        <p className="text-sm mt-1 text-blue-600">
          这些接口通过 Convex HTTP Actions 提供，支持标准 HTTP 请求和流式数据传输
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GET 请求测试 */}
        <Card>
          <CardHeader>
            <CardTitle>GET 请求测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              测试 Convex 接口: <code className="bg-muted px-2 py-1 rounded">/hello-world</code>
            </p>
            
            <Button 
              onClick={testGetApi} 
              disabled={isLoading}
              className="w-full"
            >
              发送 GET 请求到 Convex
            </Button>
            
            {getResponse && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Convex 响应结果:</h4>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(getResponse, null, 2)}
                </pre>
                {getResponse.source === 'convex' && (
                  <p className="text-green-600 text-sm mt-2">✅ 成功通过 Convex 后端返回</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* POST 请求测试 */}
        <Card>
          <CardHeader>
            <CardTitle>POST 请求测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              测试 Convex 接口: <code className="bg-muted px-2 py-1 rounded">/hello-world</code>
            </p>
            
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">自定义名称</label>
              <input
                id="name"
                type="text"
                placeholder="输入你的名字..."
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <Button 
              onClick={testPostApi} 
              disabled={isLoading}
              className="w-full"
            >
              发送 POST 请求到 Convex
            </Button>
            
            {postResponse && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Convex 响应结果:</h4>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(postResponse, null, 2)}
                </pre>
                {postResponse.source === 'convex' && (
                  <p className="text-green-600 text-sm mt-2">✅ 成功通过 Convex 后端返回</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 流式传输测试 */}
        <Card>
          <CardHeader>
            <CardTitle>流式传输测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              测试 Convex 接口: <code className="bg-muted px-2 py-1 rounded">/text-stream</code>
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="streamContent" className="text-sm font-medium">传输内容</label>
                <textarea
                  id="streamContent"
                  placeholder="输入要流式传输的文本内容..."
                  value={streamContent}
                  onChange={(e) => setStreamContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="chunkSize" className="text-sm font-medium">块大小</label>
                  <input
                    id="chunkSize"
                    type="number"
                    min="1"
                    max="100"
                    value={streamChunkSize}
                    onChange={(e) => setStreamChunkSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="delay" className="text-sm font-medium">延迟(ms)</label>
                  <input
                    id="delay"
                    type="number"
                    min="0"
                    max="2000"
                    value={streamDelay}
                    onChange={(e) => setStreamDelay(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={testStreamApi} 
              disabled={isStreaming}
              className="w-full"
            >
              {isStreaming ? "流式传输中..." : "开始流式传输"}
            </Button>
            
            {(streamResult || isStreaming) && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">传输进度:</h4>
                  <span className="text-sm text-blue-600">{streamProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: streamProgress }}
                  ></div>
                </div>
                <div className="p-4 bg-muted rounded-lg max-h-32 overflow-y-auto">
                  <h4 className="font-semibold mb-2">实时内容:</h4>
                  <p className="text-sm whitespace-pre-wrap">{streamResult}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 流式传输日志 */}
      {streamLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>流式传输详细日志</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {streamLogs.map((log, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.type === 'start' ? 'bg-green-100 text-green-800' :
                      log.type === 'chunk' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  </div>
                  {log.content && <p className="text-sm">内容: {log.content}</p>}
                  {log.progress && <p className="text-sm">进度: {log.progress}</p>}
                  {log.message && <p className="text-sm">消息: {log.message}</p>}
                  {log.totalLength && <p className="text-sm">总长度: {log.totalLength}</p>}
                  {log.totalChunks && <p className="text-sm">总块数: {log.totalChunks}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 接口文档 */}
      <Card>
        <CardHeader>
          <CardTitle>Convex HTTP 接口文档</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Convex 流式传输的优势:</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• 支持 Persistent Text Streaming，适合实时数据传输</li>
                <li>• 可以直接访问 Convex 数据库进行实时数据处理</li>
                <li>• 内置的错误处理和恢复机制</li>
                <li>• 支持复杂的业务逻辑和数据转换</li>
                <li>• 可以与其他 Convex 服务无缝集成</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">GET {getConvexHttpUrl()}/hello-world</h4>
              <p className="text-sm text-muted-foreground">通过 Convex 获取默认的 "hello world" 消息</p>
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>响应示例:</strong>
                <pre>{`{
  "message": "hello world",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success",
  "source": "convex"
}`}</pre>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold">POST {getConvexHttpUrl()}/hello-world</h4>
              <p className="text-sm text-muted-foreground">通过 Convex 发送自定义名称，获取个性化问候</p>
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>请求体:</strong>
                <pre>{`{
  "name": "张三"
}`}</pre>
                <strong>响应示例:</strong>
                <pre>{`{
  "message": "hello 张三",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success",
  "source": "convex"
}`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">POST {getConvexHttpUrl()}/text-stream</h4>
              <p className="text-sm text-muted-foreground">通过 Convex 进行流式文本传输</p>
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>请求体:</strong>
                <pre>{`{
  "content": "要传输的文本内容",
  "chunkSize": 10,
  "delay": 100
}`}</pre>
                <strong>流式响应示例:</strong>
                <pre>{`{"type":"start","timestamp":"...","source":"convex","totalLength":50}
{"type":"chunk","index":0,"content":"要传输的","timestamp":"...","progress":"20.00%"}
{"type":"chunk","index":1,"content":"文本内容","timestamp":"...","progress":"40.00%"}
{"type":"end","timestamp":"...","source":"convex","totalChunks":5,"message":"流式传输完成"}`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 