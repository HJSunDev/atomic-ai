"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// 定义消息类型
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export default function StreamingChat() {
  // 状态管理
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>流式聊天</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 h-[27rem] overflow-y-auto p-4 rounded-md bg-green-100">
            {messages.map((message, i) => (
              <div 
                key={i} 
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : message.role === "system"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* 流式内容显示 */}
            {streamingContent && (
              <div className="flex flex-col items-start bg-blue-100">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                  <p className="whitespace-pre-wrap">{streamingContent}</p>
                </div>
              </div>
            )}
            
            {/* 加载指示器 */}
            {isLoading && !streamingContent && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          <form className="w-full space-y-2">
            <Textarea
              placeholder="输入你的消息..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[80px]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  思考中...
                </>
              ) : (
                "发送"
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
} 