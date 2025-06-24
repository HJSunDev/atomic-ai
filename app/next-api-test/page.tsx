"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApiResponse {
  message: string;
  timestamp: string;
  status: string;
}

export default function ApiTestPage() {
  // 状态管理
  const [getResponse, setGetResponse] = useState<ApiResponse | null>(null);
  const [postResponse, setPostResponse] = useState<ApiResponse | null>(null);
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 测试 GET 请求
  const testGetApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hello-world');
      const data = await response.json();
      setGetResponse(data);
    } catch (error) {
      console.error('GET 请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 测试 POST 请求
  const testPostApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hello-world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      setPostResponse(data);
    } catch (error) {
      console.error('POST 请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">API 接口测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GET 请求测试 */}
        <Card>
          <CardHeader>
            <CardTitle>GET 请求测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              测试接口: <code className="bg-muted px-2 py-1 rounded">/api/hello-world</code>
            </p>
            
            <Button 
              onClick={testGetApi} 
              disabled={isLoading}
              className="w-full"
            >
              发送 GET 请求
            </Button>
            
            {getResponse && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">响应结果:</h4>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(getResponse, null, 2)}
                </pre>
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
              测试接口: <code className="bg-muted px-2 py-1 rounded">/api/hello-world</code>
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
              发送 POST 请求
            </Button>
            
            {postResponse && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">响应结果:</h4>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(postResponse, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 接口文档 */}
      <Card>
        <CardHeader>
          <CardTitle>接口文档</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">GET /api/hello-world</h4>
              <p className="text-sm text-muted-foreground">获取默认的 "hello world" 消息</p>
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>响应示例:</strong>
                <pre>{`{
  "message": "hello world",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}`}</pre>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold">POST /api/hello-world</h4>
              <p className="text-sm text-muted-foreground">发送自定义名称，获取个性化问候</p>
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                <strong>请求体:</strong>
                <pre>{`{
  "name": "张三"
}`}</pre>
                <strong>响应示例:</strong>
                <pre>{`{
  "message": "hello 张三",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 