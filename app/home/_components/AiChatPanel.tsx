import React from "react";

export function AiChatPanel() {
  return (
    // AI聊天面板 - 固定占据右侧50%宽度
    <div className="w-[45%] h-full border-l bg-background flex flex-col overflow-hidden">
      {/* 面板标题 */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">AI助手</h2>
      </div>
      
      {/* 聊天内容区域 - 使用不同颜色块占位 */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
        <div className="space-y-4">
          {/* 模拟聊天消息 - 使用色块占位 */}
          <div className="w-3/4 h-20 bg-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-800">AI消息占位</div>
          </div>
          
          <div className="w-3/4 h-16 bg-green-100 rounded-lg p-4 ml-auto">
            <div className="text-sm text-green-800">用户消息占位</div>
          </div>
          
          <div className="w-3/4 h-24 bg-blue-100 rounded-lg p-4">
            <div className="text-sm text-blue-800">AI消息占位</div>
          </div>
        </div>
      </div>
      
      {/* 输入区域 */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-12 bg-muted rounded-md flex items-center justify-center">
            <span className="text-sm text-muted-foreground">输入框占位</span>
          </div>
          <button className="h-12 w-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            发送
          </button>
        </div>
      </div>
    </div>
  );
} 