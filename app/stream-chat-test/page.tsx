"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  MessageCircle, 
  User, 
  Bot, 
  RefreshCw,
  Settings,
  Clock,
  Trash2
} from "lucide-react";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from "@/convex/_lib/models";


export default function StreamChatTestPage() {
  // 从Clerk获取用户认证状态
  const { isSignedIn } = useUser();
  // 绑定输入框的文本内容
  const [inputValue, setInputValue] = useState("");
  // 跟踪是否正在等待AI响应，用于禁用输入和显示加载指示器
  const [isLoading, setIsLoading] = useState(false);
  // 用户选择的AI模型ID
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL_ID);
  // 用于配置AI行为的系统提示词
  const [systemPrompt, setSystemPrompt] = useState("你是用户的好朋友");
  // 当前正在进行的会话ID。如果为null，表示是一个新会话。
  const [currentConversationId, setCurrentConversationId] = useState<Id<"conversations"> | null>(null);
  // 用户为付费模型输入的API密钥
  const [apiKey, setApiKey] = useState("");
  // 标识当前正在流式传输的AI消息的ID，用于UI效果
  const [streamingMessageId, setStreamingMessageId] = useState<Id<"messages"> | null>(null);
  // 指向消息列表末尾的DOM元素，用于实现自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Convex Data Hooks ---
  // Convex action: 用于调用后端流式聊天逻辑
  const streamChat = useAction(api.chat.action.streamChat);
  
  // Convex mutation: 用于删除会话
  const deleteConversation = useMutation(api.chat.mutations.deleteConversation);
  
  // Convex query: 获取当前登录用户的所有会话列表
  // skip是 Convex useQuery 的内置功能，用于跳过查询执行，避免无效请求。
  const conversations = useQuery(
    api.chat.queries.getUserConversations,
    // 当 isSignedIn 为 true 时执行查询，否则跳过
    isSignedIn ? {} : "skip"
  );

  // Convex query: 获取当前选中会话的所有消息
  const messages = useQuery(
    api.chat.queries.getConversationMessages,
    // 仅当 currentConversationId 存在时才执行此查询。
    // 如果 currentConversationId 为 null，则传递 "skip" 关键字，
    // 这是 Convex useQuery 的内置功能，用于跳过查询执行，避免无效请求。
    currentConversationId ? { conversationId: currentConversationId } : "skip"
  );

  // --- Effects ---
  // 监听消息流状态
  // 效果：当后端完成流式传输并更新消息元数据后，清除本地的流式状态
  useEffect(() => {
    // 如果当前没有正在流的消息，或者消息列表为空，则不执行任何操作
    if (!streamingMessageId || !messages) return;

    // 在消息列表中查找正在流式传输的那条消息
    const streamingMessage = messages.find((m) => m._id === streamingMessageId);

    // 如果找到了这条消息，并且它已经包含了元数据（metadata），
    // 这就明确地标志着后端的流式处理和元数据更新已全部完成。
    if (streamingMessage && streamingMessage.metadata) {
      // 清除流式状态，这将导致UI上的"流式传输中"指示器消失
      setStreamingMessageId(null);
    }
  }, [messages, streamingMessageId]); // 当消息列表或流式ID变化时重新运行此效果

  // 自动滚动到消息列表底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 效果：每当消息列表更新时，自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Event Handlers ---
  // 处理发送消息的逻辑
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isSignedIn) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // 不等待streamChat完成，而是启动流式处理
      streamChat({
        userMessage,
        conversationId: currentConversationId || undefined,
        modelId: selectedModel,
        userApiKey: apiKey || undefined,
        systemPrompt: systemPrompt || undefined,
      }).then((result) => {
        if (result.success) {
          // 如果这是新会话，设置当前会话ID
          if (!currentConversationId && result.conversationId) {
            setCurrentConversationId(result.conversationId);
          }
          // 设置正在流式传输的消息ID，以启动UI上的流式效果
          if (result.assistantMessageId) {
            setStreamingMessageId(result.assistantMessageId);
          }
        } else {
          console.error("流式聊天失败:", result.error);
        }
      })
      .catch((error) => {
        console.error("发送消息失败:", error);
      })
      .finally(() => {
        // 无论成功还是失败，最终都将加载状态设置为false
        setIsLoading(false);
      });

    } catch (error) {
      console.error("发送消息失败:", error);
      setIsLoading(false);
    }
  };

  // 处理删除会话的逻辑
  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: Id<"conversations">) => {
    // 阻止事件冒泡，防止触发父元素的点击事件（即选中会话）
    e.stopPropagation();

    // 如果删除的是当前选中的会话，则清空当前会话ID
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
    
    try {
      // 调用后端的mutation来删除会话
      await deleteConversation({ conversationId });
    } catch (error) {
      console.error("删除会话失败:", error);
      // 在实际应用中，这里可以添加用户友好的错误提示，例如使用Toast组件
    }
  };

  // 处理创建新会话的逻辑 - 点击新建会话按钮触发
  const handleNewConversation = () => {
    setCurrentConversationId(null);
  };

  // 处理选择已有会话的逻辑 - 点击会话列表中的一个会话时触发
  const handleSelectConversation = (conversationId: Id<"conversations">) => {
    setCurrentConversationId(conversationId);
  };

  // Textarea 的键盘事件处理 - 按下 Enter 键时触发
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    // 1. 根容器：占满整个屏幕高度，并设置为flex列布局
    <div className="h-screen bg-gray-50 dark:bg-gray-900 p-4 flex flex-col">
      {/* 2. 内容容器：自动填充剩余空间，并继续使用flex列布局 */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* 3. 网格布局：自动填充父容器空间，并允许子项收缩 */}
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
          
          {/* 左侧边栏：设置为flex列布局，允许内部元素滚动 */}
          <aside className="lg:col-span-1 space-y-4 flex flex-col min-h-0">
            {/* 会话控制 */}
            <Card className="flex-shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  会话管理
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleNewConversation}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  新建会话
                </Button>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {conversations?.map((conv) => (
                    <div key={conv._id} className="flex items-center gap-1 group">
                      <Button
                        onClick={() => handleSelectConversation(conv._id)}
                        variant={currentConversationId === conv._id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-xs flex-1"
                      >
                        <span className="truncate">
                          {conv.title || "未命名会话"}
                        </span>
                      </Button>
                      <Button
                        onClick={(e) => handleDeleteConversation(e, conv._id)}
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 模型设置：设置为可伸缩，内容溢出时滚动 */}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  模型设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 overflow-y-auto">
                <div>
                  <label className="text-xs font-medium mb-1 block">AI模型</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full text-xs p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                  >
                    {Object.entries(AVAILABLE_MODELS).map(([id, model]) => (
                      <option key={id} value={id}>
                        {model.modelName} {model.isFree && "(免费)"}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-medium mb-1 block">API密钥 (可选)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="仅付费模型需要"
                    className="w-full text-xs p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">系统提示</label>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="设置AI的行为..."
                    className="text-xs min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* 主聊天区域：设置为flex列布局 */}
          <article className="lg:col-span-3 flex flex-col min-h-0">
            {/* 4. 聊天卡片：设置为flex列布局，并填充所有可用空间 */}
            <Card className="flex-1 flex flex-col min-h-0">
              {/* 卡片头部：固定高度，不收缩 */}
              <CardHeader className="border-b flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  流式聊天测试
                  {currentConversationId && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      会话ID: {currentConversationId.slice(-8)}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              {/* 5. 消息区域：关键！填充剩余空间(flex-1)，并设置内容溢出时滚动(overflow-y-auto) */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {!messages?.length ? (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>开始新的对话吧！</p>
                      <p className="text-sm mt-2">测试我们的流式AI聊天功能</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages?.map((message) => (
                      <div key={message._id} className="space-y-2">
                        {message.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="max-w-xs lg:max-w-md bg-blue-500 text-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4" />
                                <span className="text-xs opacity-90">您</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Bot className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  AI助手
                                </span>
                                {message.metadata?.aiModel && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded text-blue-800 dark:text-blue-200">
                                    {message.metadata.aiModel}
                                  </span>
                                )}
                                {/* 流式传输指示器 */}
                                {streamingMessageId === message._id && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600 dark:text-green-400">流式传输中</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                                {/* 如果是正在流式传输的消息且内容为空，显示占位符 */}
                                {streamingMessageId === message._id && !message.content && (
                                  <span className="text-gray-400 italic">正在生成回复...</span>
                                )}
                                {/* 流式传输中的光标效果 */}
                                {streamingMessageId === message._id && message.content && (
                                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                                )}
                              </p>
                              {message.metadata && !streamingMessageId && (
                                <div className="flex items-center gap-3 mt-2 pt-2 border-t text-xs text-gray-500 dark:text-gray-400">
                                  {message.metadata.tokensUsed && (
                                    <span>Tokens: {message.metadata.tokensUsed}</span>
                                  )}
                                  {message.metadata.durationMs && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {(message.metadata.durationMs / 1000).toFixed(1)}s
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </CardContent>

              {/* 6. 输入区域：固定高度，不收缩 */}
              <footer className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "AI正在思考中..." : "输入消息..."}
                    className="flex-1 min-h-[80px] resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="sm"
                    className="self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>按 Enter 发送，Shift+Enter 换行</span>
                  <span>当前模型: {AVAILABLE_MODELS[selectedModel]?.modelName}</span>
                </div>
              </footer>
            </Card>
          </article>
        </main>
      </div>
    </div>
  );
} 