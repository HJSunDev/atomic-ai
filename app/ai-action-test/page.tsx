"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AIActionTestPage() {
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string>("");

  // 调用AI流式内容生成action
  const generateAIContent = useAction(api.ai.streaming.aiStreamingAction.generateAIStreamContent);

  // 测试AI action功能
  const testAIAction = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      console.log("开始调用AI action...");

      // 调用action
      const response = await generateAIContent({
        userInput: userInput || undefined,
        chunkSize: 2,
        delay: 100,
      });

      console.log("AI action响应:", response);
      setResult(response);

    } catch (err) {
      console.error("AI action调用失败:", err);
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">AI Action 测试页面</h1>
        <p className="text-lg text-muted-foreground">
          验证AI流式内容生成action的功能
        </p>
      </div>

      {/* 测试配置区域 */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">AI Action 测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="userInput" className="text-sm font-medium text-gray-700">
                用户输入（可选）
              </label>
              <textarea
                id="userInput"
                placeholder="输入自定义问题，留空则使用默认的AI相关问题..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                如果留空，将使用内置的关于人工智能发展历史的问题
              </p>
            </div>

            <Button 
              onClick={testAIAction} 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
            >
              {isLoading ? "正在调用AI服务..." : "🤖 测试AI Action"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 加载状态 */}
      {isLoading && (
        <Card className="border-2 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
              <span className="text-yellow-700">正在生成AI内容，请稍候...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card className="border-2 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800">❌ 错误信息</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 结果显示 */}
      {result && (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800">
              {result.success ? "✅ AI内容生成成功" : "⚠️ AI内容生成部分成功"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* 元数据信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700">状态:</h4>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                  result.success ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}>
                  {result.success ? "成功" : "部分成功"}
                </span>
              </div>
              
              {result.metadata && (
                <>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">使用模型:</h4>
                    <code className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded font-mono">
                      {result.metadata.modelUsed}
                    </code>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">生成时间:</h4>
                    <span className="text-sm text-gray-600">
                      {new Date(result.metadata.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-700">预估Token数:</h4>
                    <span className="text-sm text-gray-600">
                      {result.metadata.estimatedTokens || 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* 错误信息（如果有） */}
            {result.error && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 text-sm mb-2">⚠️ 错误详情</h4>
                <p className="text-sm text-yellow-700">
                  <strong>类型:</strong> {result.error.type}
                </p>
                <p className="text-sm text-yellow-700">
                  <strong>消息:</strong> {result.error.message}
                </p>
                <p className="text-sm text-yellow-700">
                  <strong>时间:</strong> {new Date(result.error.timestamp).toLocaleString('zh-CN')}
                </p>
              </div>
            )}

            {/* AI生成的内容 */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
              <h4 className="font-semibold mb-3 text-green-800 flex items-center">
                <span className="mr-2">🤖</span>
                AI生成的内容
              </h4>
              <div className="bg-white p-4 rounded-lg border min-h-[200px] max-h-[600px] overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {result.content || "无内容"}
                </p>
              </div>
            </div>

            {/* 使用指南 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">💡 测试说明</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>成功响应:</strong> AI服务正常工作，内容由DeepSeek模型生成</li>
                <li>• <strong>部分成功:</strong> AI服务调用失败，但提供了降级内容</li>
                <li>• <strong>内容验证:</strong> 检查生成的内容是否符合预期和上下文</li>
                <li>• <strong>模型信息:</strong> 确认使用的是配置的免费DeepSeek模型</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 技术说明 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">技术验证要点</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">🔧 验证项目</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Action在"use node"环境下正常工作</li>
                <li>• LangChain与OpenRouter集成成功</li>
                <li>• DeepSeek免费模型调用成功</li>
                <li>• 内置消息和上下文工作正常</li>
                <li>• 错误处理和降级机制有效</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">📋 检查清单</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ✅ API密钥配置正确</li>
                <li>• ✅ 模型响应格式符合预期</li>
                <li>• ✅ 元数据信息完整</li>
                <li>• ✅ 降级内容机制工作</li>
                <li>• ✅ 准备集成到流式传输</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 