"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import dynamic from "next/dynamic";

// 动态导入 useStream hook，禁用 SSR
const PersistentStreamComponent = dynamic(
  () => import("./components/StreamComponent"),
  { 
    ssr: false,
    loading: () => <div className="p-4 text-center text-gray-500">加载流式组件中...</div>
  }
);

export default function PersistentStreamingPage() {
  // Persistent Text Streaming 相关状态
  const [persistentStreamId, setPersistentStreamId] = useState<string | null>(null);
  const [persistentStreamContent, setPersistentStreamContent] = useState<string>("");
  const [persistentChunkSize, setPersistentChunkSize] = useState<number>(2);
  const [persistentDelay, setPersistentDelay] = useState<number>(150);
  const [isDriven, setIsDriven] = useState<boolean>(false);
  
  // Convex mutations
  const createStream = useMutation(api.streaming.createStream);
  
  // 获取 Convex HTTP 接口基础 URL
  const getConvexHttpUrl = () => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL 环境变量未配置');
    }
    // Convex HTTP Actions 的正确 URL 格式
    // 从 WebSocket URL 构建 HTTP site URL
    const httpUrl = convexUrl
      .replace('wss://', 'https://')
      .replace('ws://', 'http://')
      .replace('.convex.cloud', '.convex.site');
    
    return httpUrl;
  };

  // 不再在这里直接调用 useStream，而是通过 PersistentStreamComponent 来处理

  // 测试 Persistent Text Streaming
  const testPersistentStream = async () => {
    try {
      setIsDriven(true);
      
      // 创建新的流
      const streamId = await createStream({
        content: persistentStreamContent,
        chunkSize: persistentChunkSize,
        delay: persistentDelay,
      });
      
      setPersistentStreamId(streamId);
      console.log('创建的 streamId:', streamId);
      
      // 启动流式传输 (useStream hook 会自动处理)
      // 由于设置了 isDriven=true，useStream 会自动发起 HTTP 请求
      
    } catch (error) {
      console.error('Persistent Stream 创建失败:', error);
      setIsDriven(false);
    }
  };
  
  // 重置 Persistent Stream
  const resetPersistentStream = () => {
    setPersistentStreamId(null);
    setIsDriven(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Persistent Text Streaming 测试</h1>
        <p className="text-lg text-muted-foreground">
          基于 Convex 官方组件的高级流式传输解决方案
        </p>
      </div>
      
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
        <h3 className="font-semibold mb-2 text-blue-800">🚀 Persistent Text Streaming 特性</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 mb-1">核心优势:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• 数据库持久化存储</li>
              <li>• 多用户实时同步</li>
              <li>• 断线重连恢复</li>
              <li>• WebSocket 响应式</li>
              <li>• AI光标视觉反馈</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-700 mb-1">适用场景:</h4>
            <ul className="space-y-1 text-green-600">
              <li>• AI 聊天对话</li>
              <li>• 实时内容生成</li>
              <li>• 多用户协作</li>
              <li>• 长时间流式处理</li>
              <li>• 打字机效果展示</li>
            </ul>
          </div>
        </div>
        <div className="mt-3 p-2 bg-white rounded border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-700">
            <strong>接口地址:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{getConvexHttpUrl()}/persistent-stream</code>
          </p>
        </div>
      </div>

      {/* 配置和测试区域 */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800">流式传输配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="persistentContent" className="text-sm font-medium text-gray-700">
                传输内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="persistentContent"
                placeholder="输入要流式传输的文本内容（模拟AI回复）..."
                value={persistentStreamContent}
                onChange={(e) => setPersistentStreamContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                留空将使用默认的示例内容。在实际应用中，这里会是AI模型生成的内容。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="persistentChunkSize" className="text-sm font-medium text-gray-700">
                  块大小（字符数）
                </label>
                <input
                  id="persistentChunkSize"
                  type="number"
                  min="1"
                  max="10"
                  value={persistentChunkSize}
                  onChange={(e) => setPersistentChunkSize(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">每次传输的字符数量</p>
              </div>
              
              <div>
                <label htmlFor="persistentDelay" className="text-sm font-medium text-gray-700">
                  延迟（毫秒）
                </label>
                <input
                  id="persistentDelay"
                  type="number"
                  min="50"
                  max="1000"
                  value={persistentDelay}
                  onChange={(e) => setPersistentDelay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">模拟AI生成的延迟时间</p>
              </div>
            </div>
          </div>
          
                     <PersistentStreamComponent
             persistentStreamId={persistentStreamId}
             isDriven={isDriven}
             getConvexHttpUrl={getConvexHttpUrl}
             cursorOptions={{
               type: 'line',
               speed: 'normal',
               color: '#10b981', // 绿色主题
               show: true
             }}
           >
             {({ persistentText, persistentStatus, textWithCursor }) => (
               <div className="flex gap-3">
                 <Button 
                   onClick={testPersistentStream} 
                   disabled={isDriven && persistentStatus === "streaming"}
                   className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2"
                 >
                   {isDriven && persistentStatus === "streaming" ? "正在流式传输..." : "🚀 开始 Persistent Streaming"}
                 </Button>
                 
                 <Button 
                   onClick={resetPersistentStream} 
                   variant="outline"
                   className="px-6 border-green-300 text-green-700 hover:bg-green-50"
                 >
                   重置
                 </Button>
               </div>
             )}
           </PersistentStreamComponent>
        </CardContent>
      </Card>

       {/* 流式传输结果展示 */}
       {persistentStreamId && (
         <PersistentStreamComponent
           persistentStreamId={persistentStreamId}
           isDriven={isDriven}
           getConvexHttpUrl={getConvexHttpUrl}
           cursorOptions={{
             type: 'line',
             speed: 'normal',
             color: '#3b82f6', // 蓝色主题
             show: true
           }}
         >
           {({ persistentText, persistentStatus, textWithCursor }) => (
             <Card className="border-2 border-blue-200">
               <CardHeader className="bg-blue-50">
                 <CardTitle className="text-blue-800">流式传输状态</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 pt-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                     <h4 className="font-semibold text-gray-700">Stream ID:</h4>
                     <code className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded font-mono">
                       {persistentStreamId.slice(0, 8)}...
                     </code>
                   </div>
                   <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                     <h4 className="font-semibold text-gray-700">状态:</h4>
                     <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                       persistentStatus === "streaming" ? "bg-blue-100 text-blue-800" :
                       persistentStatus === "done" ? "bg-green-100 text-green-800" :
                       "bg-gray-100 text-gray-800"
                     }`}>
                       {persistentStatus === "streaming" ? "🔄 传输中" : 
                        persistentStatus === "done" ? "✅ 完成" : "⏳ 等待"}
                     </span>
                   </div>
                 </div>
                 
                 <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                   <h4 className="font-semibold mb-3 text-green-800 flex items-center">
                     <span className="mr-2">📝</span>
                     实时内容展示 (带AI光标效果)
                   </h4>
                   <div className="bg-white p-4 rounded-lg border min-h-[80px] max-h-[300px] overflow-y-auto">
                     <p className="text-sm whitespace-pre-wrap leading-relaxed">
                       {persistentText || textWithCursor ? (
                         textWithCursor
                       ) : (
                         <span className="text-gray-400 italic">等待内容传输...</span>
                       )}
                     </p>
                   </div>
                 </div>
                 
                 <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                   <h4 className="font-semibold text-yellow-800 text-sm mb-2 flex items-center">
                     <span className="mr-2">🎯</span>
                     Persistent 特性演示指南
                   </h4>
                   <ul className="text-sm text-yellow-700 space-y-1">
                     <li>• <strong>多标签页测试:</strong> 打开新标签页访问此页面，可以看到同步的流式内容</li>
                     <li>• <strong>刷新恢复:</strong> 流式传输过程中刷新页面，状态会自动恢复到当前进度</li>
                     <li>• <strong>持久存储:</strong> 即使关闭浏览器，重新打开后内容仍然保持</li>
                     <li>• <strong>多用户协作:</strong> 多个用户可以同时观看同一个流的实时进度</li>
                     <li>• <strong>AI光标效果:</strong> 流式传输时显示闪烁光标，提升用户体验</li>
                   </ul>
                 </div>
                 
                 {/* AI光标样式演示区域 */}
                 <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                   <h4 className="font-semibold text-purple-800 text-sm mb-3 flex items-center">
                     <span className="mr-2">✨</span>
                     AI光标样式预览
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <span className="text-purple-700 w-20">竖线光标:</span>
                         <span className="bg-white px-3 py-2 rounded border flex items-center text-base">正在输入<span className="inline-block w-[2px] h-[1.2em] bg-blue-500 animate-pulse-cursor ml-[2px]"></span></span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-purple-700 w-20">下划线:</span>
                         <span className="bg-white px-3 py-2 rounded border flex items-baseline text-base">正在输入<span className="inline-block w-[0.8em] h-[3px] bg-green-500 animate-pulse-cursor ml-[2px] translate-y-[2px]"></span></span>
                       </div>
                     </div>
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <span className="text-purple-700 w-20">方块光标:</span>
                         <span className="bg-white px-3 py-2 rounded border flex items-center text-base">正在输入<span className="inline-block w-[0.5em] h-[1.1em] bg-orange-500 animate-pulse-cursor ml-[2px]"></span></span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-purple-700 w-20">自定义符号:</span>
                         <span className="bg-white px-3 py-2 rounded border flex items-center text-base">正在输入<span className="inline-block animate-pulse-cursor ml-[2px] text-purple-500 text-lg">●</span></span>
                       </div>
                     </div>
                   </div>
                 </div>
               </CardContent>
             </Card>
           )}
         </PersistentStreamComponent>
       )}

      {/* 技术说明 */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-800">技术实现说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">🔧 核心组件</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">@convex-dev/persistent-text-streaming</code></li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">useStream</code> React Hook</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">PersistentTextStreaming</code> 服务端组件</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">TypingCursor</code> AI光标组件</li>
                <li>• WebSocket 响应式订阅</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">🎯 适用场景</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• AI 聊天应用（ChatGPT风格）</li>
                <li>• 实时内容生成和展示</li>
                <li>• 多用户协作编辑</li>
                <li>• 长时间运行的流式任务</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">💡 与传统流式传输的对比</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">特性</th>
                    <th className="text-left p-2">传统 HTTP 流</th>
                    <th className="text-left p-2">Persistent Text Streaming</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b">
                    <td className="p-2 font-medium">断线恢复</td>
                    <td className="p-2">❌ 不支持</td>
                    <td className="p-2">✅ 自动恢复</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">多用户观看</td>
                    <td className="p-2">❌ 仅限发起者</td>
                    <td className="p-2">✅ 支持多用户</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">数据持久化</td>
                    <td className="p-2">❌ 仅在内存</td>
                    <td className="p-2">✅ 数据库存储</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">实时同步</td>
                    <td className="p-2">⚠️ 有限支持</td>
                    <td className="p-2">✅ WebSocket 响应式</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">视觉反馈</td>
                    <td className="p-2">❌ 无光标效果</td>
                    <td className="p-2">✅ AI打字光标</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 