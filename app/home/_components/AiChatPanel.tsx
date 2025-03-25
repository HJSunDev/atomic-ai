import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Send, Clock, Brain, Sparkles, Maximize2, Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Bot, User } from "lucide-react";

// 定义消息类型
type MessageRole = "user" | "assistant";

// 定义消息数据结构
interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string; // 可选，用于AI消息展示模型信息
}

export function AiChatPanel() {
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

  // 模拟无内容对话列表数据
  const [emptyMessages, setEmptyMessages] = useState<Message[]>([]);
  
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
  
  return (
    // AI聊天面板 - 固定占据右侧宽度
    <div className="w-[45%] h-full border-l bg-background flex flex-col overflow-hidden">
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
        {emptyMessages.length === 0 ? (
          // 无对话状态设计
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Atomic</h3>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-[300px]">我是您的智能开发助手，随时为您提供编程相关问题的解答与支持</p>
            
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <div 
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors group cursor-pointer"
                onClick={() => handlePromptClick("&&&是什么？有什么用？使用场景是什么？如何使用？用不用的区别是什么？最佳实践是什么？")}
              >
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">知识节点</span>
                </div>
                <p className="text-xs text-gray-500">帮我拓宽知识边界，探索知识节点</p>
              </div>
            </div>
          </div>
        ) : (
          // 有对话内容时展示消息列表
          messages.map((message, index) => (
            <div 
              key={message.id}
              className="group mb-6 last:mb-2"
            >
              {message.role === "user" ? (
                // 用户消息容器
                <div className="flex flex-col items-end">
                  {/* 用户消息内容 */}
                  <div className="w-3/4 bg-[#F1F2F3] rounded-tl-lg rounded-tr-lg rounded-bl-lg p-4 ml-auto">
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                  </div>
                  
                  {/* 用户消息功能区 - 根据是否为最后一条消息决定是否默认显示 */}
                  <div className={`mt-2 flex items-center gap-1 ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                    <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center bg-white">
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button className="w-6 h-6 rounded hover:bg-gray-100 flex items-center justify-center bg-white">
                      <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ) : (
                // AI消息容器
                <div className="flex flex-col">
                  {/* AI消息内容 */}
                  <div className="w-full">
                    {/* AI信息栏 */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">OmniAid</span>
                      <span className="text-xs text-gray-500">{message.model}</span>
                    </div>
                    
                    {/* AI消息内容 */}
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                  </div>
                  
                  {/* AI消息功能区 - 根据是否为最后一条消息决定是否默认显示 */}
                  <div className={`mt-2 flex items-center gap-1.5 ${index === messages.length - 1 ? 'visible' : 'invisible group-hover:visible'}`}>
                    <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                      <ThumbsUp className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                      <ThumbsDown className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center bg-white">
                      <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {/* 用于滚动到底部的空div */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入区域 */}
      <div className="bg-white">
        {/* 提示词功能区 */}
        <div className="px-4 py-1 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button className="h-7 px-2 rounded-full hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-600">写作</span>
            </button>
            <button className="h-7 px-2 rounded-full hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-600">写日程</span>
            </button>
            <button className="h-7 px-2 rounded-full hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-600">数据分析</span>
            </button>
          </div>
        </div>
        
        {/* 设置区 */}
        <div className="px-4 py-1 flex items-center border-gray-100">
          <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center">
            <Brain className="w-4 h-4 text-[#212125]" />
          </button>
          <div className="flex items-center justify-center ml-auto">
            {/* 历史消息图标 */}
            <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-[#212125]" />
            </button>
          </div>
        </div>
        
        {/* 输入整体模块 */}
        <div className="mx-4 mt-1 mb-2">
          {/* textarea区域 - 默认两行高度，最多五行后滚动 */}
          <div className="rounded-t-md border border-gray-200 overflow-hidden">
            <Textarea 
              placeholder="问我任何问题..." 
              className="min-h-[3.7rem] max-h-[6.25rem] w-full resize-none rounded-none border-0 focus-visible:ring-0 focus:outline-none px-3 py-2.5 text-sm overflow-y-auto"
              value={inputValue}
              onChange={handleInputChange}
              ref={textareaRef}
            />
            
            {/* textarea右下侧功能区 */}
            <div className="bg-white pb-[2px] px-3 flex items-center justify-end border-gray-100">
              <div className="flex items-center">
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <Sparkles className="w-4 h-4 text-gray-500" />
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <Maximize2 className="w-4 h-4 text-gray-500" />
                </button>
                
                {/* 发送按钮 - 根据输入内容决定样式和交互性 */}
                <button 
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                    inputValue.trim() ? "hover:bg-gray-100 cursor-pointer" : "cursor-not-allowed"
                  }`}
                  disabled={!inputValue.trim()}
                >
                  <Send 
                    className="h-4 w-4" 
                    style={{ 
                      color: inputValue.trim() ? "#3D8CDD" : "#BCC1C8" 
                    }} 
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* 选择区 */}
          <div className="px-3 py-2.5 border border-t-0 border-gray-200 rounded-b-md flex items-center gap-4 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-500">选项1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-500">选项2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 