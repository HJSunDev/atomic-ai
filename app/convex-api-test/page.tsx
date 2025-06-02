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

export default function ConvexApiTestPage() {
  // 状态管理
  const [getResponse, setGetResponse] = useState<ApiResponse | null>(null);
  const [postResponse, setPostResponse] = useState<ApiResponse | null>(null);
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
          <strong>接口路径:</strong> <code className="bg-white px-2 py-1 rounded">/hello-world</code>
        </p>
        <p className="text-sm mt-1 text-blue-600">
          这个接口是通过 Convex HTTP Actions 提供的，具备更强的扩展能力
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* 接口文档 */}
      <Card>
        <CardHeader>
          <CardTitle>Convex HTTP 接口文档</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Convex 的优势:</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• 可以直接访问 Convex 数据库和其他服务</li>
                <li>• 支持实时数据同步和订阅</li>
                <li>• 内置身份验证和权限管理</li>
                <li>• 可以调用其他 Convex 函数（actions、mutations、queries）</li>
                <li>• 自动处理类型安全和错误处理</li>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 