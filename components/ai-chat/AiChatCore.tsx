import React, { useState, useRef, useEffect } from "react";

// 定义消息类型
export type MessageRole = "user" | "assistant";

// 定义消息数据结构
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string; // 可选，用于AI消息展示模型信息
}

// 核心组件属性类型
export interface AiChatCoreProps {
  children: (props: {
    messages: Message[];
    inputValue: string;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handlePromptClick: (promptText: string) => void;
    handleSendMessage: () => void;
  }) => React.ReactNode;
}

export function AiChatCore({ children }: AiChatCoreProps) {
  // 添加状态来跟踪输入内容
  const [inputValue, setInputValue] = useState("");
  
  // 创建一个ref用于消息列表底部的元素
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 创建一个ref用于textarea元素
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 模拟对话数据，参考OpenAI格式
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "您好！我是OmniAid智能助手，很高兴为您提供帮助。您可以向我咨询任何关于开发的问题，我会尽力为您解答。",
      timestamp: new Date(Date.now() - 300000),
      model: "GPT-4o"
    },
    {
      id: "2",
      role: "user",
      content: "你能帮我解释一下React中的useMemo和useCallback钩子的区别吗？",
      timestamp: new Date(Date.now() - 240000)
    },
    {
      id: "3",
      role: "assistant",
      content: "useMemo和useCallback都是React的性能优化钩子，它们的主要区别如下：\n\n**useMemo**：\n- 用于缓存计算结果\n- 当依赖项改变时，重新计算结果\n- 返回的是计算值本身\n- 适用于计算密集型操作\n\n**useCallback**：\n- 用于缓存函数\n- 当依赖项改变时，重新创建函数\n- 返回的是缓存的函数引用\n- 适用于防止子组件不必要的重渲染\n\n两者的语法相似，但用途不同。简单来说，useMemo缓存值，useCallback缓存函数。",
      timestamp: new Date(Date.now() - 180000),
      model: "GPT-4o"
    },
    {
      id: "4",
      role: "user",
      content: "谢谢！那么什么情况下应该优先使用useCallback而不是useMemo？",
      timestamp: new Date(Date.now() - 120000)
    },
    {
      id: "5",
      role: "assistant",
      content: "应该优先使用useCallback而不是useMemo的情况：\n\n1. **传递函数给子组件时**：当你需要将函数作为props传递给使用React.memo或shouldComponentUpdate优化的子组件时，useCallback能确保函数引用不变，避免子组件不必要的重渲染。\n\n2. **事件处理函数**：对于事件处理函数，尤其是在列表渲染时创建的事件处理函数，使用useCallback可以避免每次渲染创建新函数。\n\n3. **依赖于函数引用的钩子**：当其他钩子(如useEffect)依赖于某个函数时，使用useCallback可以避免因函数引用变化导致的不必要执行。\n\n4. **函数本身很简单但被频繁创建**：如果函数很简单(如一行箭头函数)，使用useMemo不划算，因为缓存开销可能大于重新创建函数的开销。\n\n记住，过早优化可能是有害的。只有当性能分析表明有必要时，才应该应用这些优化技术。在大多数情况下，React足够快，不需要这些微优化。",
      timestamp: new Date(Date.now() - 60000),
      model: "GPT-4o"
    }
  ]);
  
  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  
  // 滚动到底部的函数 - 使用auto实现即时滚动
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
  
  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // 创建新的用户消息
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date()
    };
    
    // 添加消息到列表
    setMessages([...messages, newUserMessage]);
    
    // 清空输入框
    setInputValue("");
    
    // 这里应该有发送到后端的逻辑，并等待回复
    // 模拟AI回复
    const currentInput = newUserMessage.content;
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `已收到您的消息："${currentInput}"。这是一个模拟回复。`,
        timestamp: new Date(),
        model: "GPT-4o"
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };
  
  // 因为TypeScript推断类型不准确，我们需要明确类型转换
  const childrenProps = {
    messages,
    inputValue,
    textareaRef,
    messagesEndRef,
    handleInputChange,
    handlePromptClick,
    handleSendMessage,
  };
  
  return children(childrenProps as any);
} 