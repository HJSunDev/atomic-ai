import React, { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

// 定义消息类型
export type MessageRole = "user" | "assistant" | "system";

// 定义消息数据结构
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string; // 可选，用于AI消息展示模型信息
}

// AiChatCore接收的属性，支持自定义服务调用
export interface AiChatCoreProps {
  children: (props: AiChatRenderProps) => React.ReactNode;
  // 自定义初始消息，可选
  initialMessages?: Message[];
  // 自定义系统提示，可选
  systemPrompt?: string;
  // 自定义模型ID，可选
  modelId?: string;
  // 传入的API密钥，可选，如果不提供则使用环境变量中的API密钥
  apiKey?: string;
}

// 定义传递给子组件的props类型
export interface AiChatRenderProps {
  messages: Message[];
  inputValue: string;
  isLoading: boolean; // 添加加载状态
  // 我们使用React.RefObject，这是React内置类型
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handlePromptClick: (promptText: string) => void;
  handleSendMessage: () => void;
}

export function AiChatCore({ 
  children, 
  initialMessages,
  systemPrompt,
  modelId,
  apiKey
}: AiChatCoreProps) {
  // 添加状态来跟踪输入内容
  const [inputValue, setInputValue] = useState("");
  // 添加加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 创建DOM元素引用的ref用于消息列表底部的元素
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 创建DOM元素引用的ref用于textarea元素
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 使用 Convex 的 chatCompletion action
  const callChatAI = useAction(api.ai.chat.actions.chatCompletion);

  // 初始默认消息
  const defaultMessages: Message[] = [
    {
      id: "1",
      role: "assistant",
      content: "您好！我是OmniAid智能助手，很高兴为您提供帮助。您可以向我咨询任何问题，我会尽力为您解答。",
      timestamp: new Date(),
      model: modelId ? undefined : "deepseek-v3"
    }
  ];
  
  // 使用传入的初始消息或默认消息
  const [messages, setMessages] = useState<Message[]>(initialMessages || defaultMessages);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  // 滚动到底部的函数 - 内部使用，不需要暴露给子组件，使用auto实现即时滚动
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };
  
  // 组件挂载和消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 处理提示卡片点击
  const handlePromptClick = (promptText: string) => {
    // 查找占位符位置（使用&&&作为光标定位点）
    const placeholderText = "&&&";
    const placeholderIndex = promptText.indexOf(placeholderText);
    
    if (placeholderIndex !== -1) {
      // 如果存在占位符，则替换占位符为空，并记录光标位置
      const newText = promptText.replace(placeholderText, "");
      setInputValue(newText);
      
      // 聚焦到输入框并设置光标位置
      if (textareaRef.current) {
        textareaRef.current.focus();
        // 设置光标位置到占位符的位置
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(placeholderIndex, placeholderIndex);
          }
        }, 0);
      }
    } else {
      // 如果没有占位符，则直接设置文本并聚焦
      setInputValue(promptText);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  
  // 将消息历史格式化为AI服务所需的格式
  const formatMessagesForAI = (messages: Message[]) => {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString()
    }));
  };
  
  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // 创建新的用户消息
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };
    
    // 添加消息到列表
    setMessages(prev => [...prev, newUserMessage]);
    
    // 清空输入框
    setInputValue("");
    
    // 设置加载状态
    setIsLoading(true);
    
    try {
      // 准备聊天历史
      const chatHistory = formatMessagesForAI(messages);
      
      // 调用AI服务
      const response = await callChatAI({
        userMessage: newUserMessage.content,
        chatHistory,
        modelId,
        apiKey,
        systemPrompt
      });
      
      // 创建AI回复消息
      if (response.status === "success") {
        const aiResponse: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: response.content as string,
          timestamp: new Date(),
          model: response.modelUsed?.name
        };
        
        // 添加AI回复到消息列表
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // 错误处理 - 使用安全的类型转换
        const errorContent = typeof response.error === 'string' 
          ? response.error 
          : "未知错误";
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `抱歉，我遇到了一些问题：${errorContent}`,
          timestamp: new Date(),
          model: response.modelUsed?.name
        };
        
        // 添加错误消息到列表
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // 处理异常
      console.error("AI服务调用失败:", error);
      
      // 添加错误消息到列表
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `抱歉，我遇到了一些技术问题，请稍后再试。`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // 重置加载状态
      setIsLoading(false);
    }
  };
  
  // 构建传递给子组件的属性
  // 使用类型断言（as）解决类型兼容性问题
  // 这是安全的，因为React的ref对象在运行时行为一致
  const renderProps: AiChatRenderProps = {
    messages,
    inputValue,
    isLoading,
    textareaRef: textareaRef as React.RefObject<HTMLTextAreaElement>, 
    messagesEndRef: messagesEndRef as React.RefObject<HTMLDivElement>,
    handleInputChange,
    handlePromptClick,
    handleSendMessage
  };
  
  return children(renderProps);
} 