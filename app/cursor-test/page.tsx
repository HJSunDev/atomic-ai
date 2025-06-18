"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypingCursor, AICursor, ThinkingCursor, WritingCursor } from "@/components/ui/typing-cursor";

export default function CursorTestPage() {
  const [showCursor, setShowCursor] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [currentType, setCurrentType] = useState<'line' | 'underscore' | 'block' | 'custom'>('line');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">AI 光标测试页面</h1>
        <p className="text-lg text-muted-foreground">
          测试各种光标样式的显示效果
        </p>
      </div>

      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>光标控制面板</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowCursor(!showCursor)}
              variant={showCursor ? "default" : "outline"}
            >
              {showCursor ? "隐藏光标" : "显示光标"}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">光标类型:</label>
            <div className="flex gap-2">
              {(['line', 'underscore', 'block', 'custom'] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={currentType === type ? "default" : "outline"}
                  onClick={() => setCurrentType(type)}
                >
                  {type === 'line' ? '竖线' : 
                   type === 'underscore' ? '下划线' : 
                   type === 'block' ? '方块' : '自定义'}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">闪烁速度:</label>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <Button
                  key={speed}
                  size="sm"
                  variant={currentSpeed === speed ? "default" : "outline"}
                  onClick={() => setCurrentSpeed(speed)}
                >
                  {speed === 'slow' ? '慢速' : 
                   speed === 'normal' ? '普通' : '快速'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 光标效果展示 */}
      <Card>
        <CardHeader>
          <CardTitle>实时光标效果展示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-4">当前配置的光标效果:</h4>
            <div className="bg-white p-4 rounded border text-lg">
              这是一段测试文本，用于展示光标效果
              <TypingCursor
                type={currentType}
                speed={currentSpeed}
                show={showCursor}
                customText="●"
                color="#3b82f6"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">基础光标样式:</h4>
              
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">竖线光标 (蓝色):</span>
                  <span className="text-base">正在输入文本<TypingCursor type="line" color="#3b82f6" show={showCursor} /></span>
                </div>

                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">下划线光标 (绿色):</span>
                  <span className="text-base">正在输入文本<TypingCursor type="underscore" color="#10b981" show={showCursor} /></span>
                </div>

                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">方块光标 (橙色):</span>
                  <span className="text-base">正在输入文本<TypingCursor type="block" color="#f59e0b" show={showCursor} /></span>
                </div>

                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">自定义符号 (紫色):</span>
                  <span className="text-base">正在输入文本<TypingCursor type="custom" customText="●" color="#8b5cf6" show={showCursor} /></span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">预设光标样式:</h4>
              
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">AI 光标:</span>
                  <span className="text-base">AI正在回复{showCursor && <AICursor />}</span>
                </div>

                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">思考光标:</span>
                  <span className="text-base">AI正在思考{showCursor && <ThinkingCursor />}</span>
                </div>

                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">写作光标:</span>
                  <span className="text-base">AI正在写作{showCursor && <WritingCursor />}</span>
                </div>

                <div className="bg-white p-4 rounded border">
                  <span className="text-sm text-gray-600 block mb-2">不同速度展示:</span>
                  <div className="space-y-2 text-sm">
                    <div>慢速: 测试文本<TypingCursor speed="slow" show={showCursor} /></div>
                    <div>普通: 测试文本<TypingCursor speed="normal" show={showCursor} /></div>
                    <div>快速: 测试文本<TypingCursor speed="fast" show={showCursor} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose text-sm">
            <h4 className="font-medium mb-2">光标组件使用方法:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import { TypingCursor } from "@/components/ui/typing-cursor";

// 基础使用
<TypingCursor 
  type="line"           // 光标类型: line | underscore | block | custom
  speed="normal"        // 速度: slow | normal | fast
  color="#3b82f6"       // 颜色
  show={true}          // 是否显示
  customText="●"       // 自定义文本 (type='custom' 时使用)
/>

// 在流式传输中使用
{streamingStatus === "streaming" && (
  <TypingCursor type="line" color="#10b981" />
)}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 