"use client";

import { useCallback, useState } from "react";
import { 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Bot,
  Sparkles,
  Zap,
  Presentation,
  FileUser,
  ArrowRight,
  Command,
  MessageSquare,
  AppWindow,
  ArrowUp
} from 'lucide-react';

import { RecentlyVisited } from './_components/RecentlyVisited';
import TimeGreeting from "@/components/time-greeting/TimeGreeting";
import { useIntentRouter } from "@/services/intent";
import { useChatStore } from "@/store/home/useChatStore";
import { IntentRoutingOverlay } from "@/app/home/_ai-creation/components/IntentRoutingOverlay";

export const HomeModule = () => {
  // 输入状态
  const [userPrompt, setUserPrompt] = useState("");

  // 意图路由 Hook
  const { 
    executeIntentRouting, 
    status: routingStatus, 
    intentResult, 
    resetStatus 
  } = useIntentRouter();

  // 从全局 store 读取默认配置
  const selectedModel = useChatStore((state) => state.selectedModel);
  const webSearchEnabled = useChatStore((state) => state.webSearchEnabled);
  const userApiKey = useChatStore((state) => state.userApiKey);

  // 处理输入提交
  const handleSend = useCallback(async () => {
    if (!userPrompt.trim()) return;

    const result = await executeIntentRouting(
      {
        userPrompt: userPrompt.trim(),
        modelId: selectedModel,
        webSearchEnabled,
        userApiKey: userApiKey || undefined,
      },
      { defaultIntent: "chat" }
    );

    if (result.success) {
      setUserPrompt("");
    }
  }, [userPrompt, executeIntentRouting, selectedModel, webSearchEnabled, userApiKey]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <main className="relative w-full h-full bg-white overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        {/* 欢迎区 */}
         <section className="mb-10">
           <TimeGreeting 
             variant="simple"
             className="max-w-2xl" 
             showTime={true} 
             showMessage={true}
           />
         </section>

        {/* Recently Visited */}
        <RecentlyVisited />

        {/* AI Creation / 智创引导 */}
        <section className="mb-12 relative">
          {/* 意图识别状态遮罩 */}
          <IntentRoutingOverlay 
            status={routingStatus} 
            intentResult={intentResult}
            onClose={resetStatus}
          />

          <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Start Creating
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[220px]">
            
            {/* Left: Text Info */}
            <div className="flex-1 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <Command className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI Creation</span>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Turn ideas into reality
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
                Just describe what you need. We'll handle the rest—automatically routing your request to the perfect AI tool.
              </p>

              <button className="group flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors w-fit">
                  Try it now <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>

            {/* Right: Interactive Flow Visual */}
            <div className="flex-1 bg-[#F7F7F5] p-6 flex flex-col justify-center items-center relative overflow-hidden">
               
               {/* Flow Container */}
               <div className="w-full max-w-[280px] flex flex-col items-center z-10 relative">
                  
                  {/* 1. Input Field (The Origin) */}
                  <div className="w-full relative z-20">
                     <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm flex items-center transition-all duration-300 group focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
                        <input 
                           type="text" 
                           value={userPrompt}
                           onChange={(e) => setUserPrompt(e.target.value)}
                           onKeyDown={handleKeyDown}
                           placeholder="Ask AI to create..." 
                           className="w-full h-10 px-3 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent border-none outline-none focus:ring-0"
                        />
                        <button
                           onClick={handleSend}
                           className="pr-3 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                           <span className="text-[10px] border border-gray-200 rounded px-1.5 py-0.5 font-sans hover:border-gray-300 hover:bg-gray-50 transition-colors">↵</span>
                        </button>
                     </div>
                  </div>

                  {/* 2. The Branching Connections (SVG) */}
                  <div className="h-12 w-full relative -mt-1 -mb-1 z-0">
                     <svg className="w-full h-full" preserveAspectRatio="none">
                        {/* Left Path */}
                        <path 
                           d="M140,0 C140,20 50,20 50,48" 
                           fill="none" 
                           stroke="#E5E7EB" 
                           strokeWidth="1.5"
                        />
                        {/* Center Path */}
                        <path 
                           d="M140,0 L140,48" 
                           fill="none" 
                           stroke="#E5E7EB" 
                           strokeWidth="1.5" 
                           strokeDasharray="4 4"
                        />
                        {/* Right Path */}
                        <path 
                           d="M140,0 C140,20 230,20 230,48" 
                           fill="none" 
                           stroke="#E5E7EB" 
                           strokeWidth="1.5"
                        />
                        
                        {/* Animated Particles (Neutral Gray) */}
                        <circle r="2" fill="#9CA3AF" className="animate-[flow-left_3s_infinite]">
                           <animateMotion 
                              dur="3s" 
                              repeatCount="indefinite" 
                              path="M140,0 C140,20 50,20 50,48" 
                              keyPoints="0;1" 
                              keyTimes="0;1" 
                              calcMode="spline" 
                              keySplines="0.4 0 0.2 1"
                           />
                        </circle>
                        <circle r="2" fill="#9CA3AF" className="animate-[flow-center_3s_infinite_1s]">
                           <animateMotion 
                              dur="3s" 
                              repeatCount="indefinite" 
                              path="M140,0 L140,48" 
                           />
                        </circle>
                         <circle r="2" fill="#9CA3AF" className="animate-[flow-right_3s_infinite_0.5s]">
                           <animateMotion 
                              dur="3s" 
                              repeatCount="indefinite" 
                              path="M140,0 C140,20 230,20 230,48" 
                              keyPoints="0;1" 
                              keyTimes="0;1" 
                              calcMode="spline" 
                              keySplines="0.4 0 0.2 1"
                           />
                        </circle>
                     </svg>
                  </div>

                  {/* 3. The Destinations */}
                  <div className="flex items-start justify-between w-full px-2">
                      {/* Chat Option */}
                      <div className="flex flex-col items-center gap-2 group/item cursor-pointer w-20">
                         <div className="relative w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:shadow-md group-hover/item:border-gray-300">
                            <MessageSquare className="w-5 h-5 text-gray-400 group-hover/item:text-gray-900 relative z-10 transition-colors duration-300" strokeWidth={1.5} />
                         </div>
                         <span className="text-[11px] font-medium text-gray-400 group-hover/item:text-gray-900 transition-colors">Chat</span>
                      </div>

                      {/* Doc Option */}
                      <div className="flex flex-col items-center gap-2 group/item cursor-pointer w-20">
                         <div className="relative w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:shadow-md group-hover/item:border-gray-300">
                            <FileText className="w-5 h-5 text-gray-400 group-hover/item:text-gray-900 relative z-10 transition-colors duration-300" strokeWidth={1.5} />
                         </div>
                         <span className="text-[11px] font-medium text-gray-400 group-hover/item:text-gray-900 transition-colors">Doc</span>
                      </div>

                      {/* App Option */}
                      <div className="flex flex-col items-center gap-2 group/item cursor-pointer w-20">
                         <div className="relative w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover/item:-translate-y-1 group-hover/item:shadow-md group-hover/item:border-gray-300">
                            <AppWindow className="w-5 h-5 text-gray-400 group-hover/item:text-gray-900 relative z-10 transition-colors duration-300" strokeWidth={1.5} />
                         </div>
                         <span className="text-[11px] font-medium text-gray-400 group-hover/item:text-gray-900 transition-colors">App</span>
                      </div>
                  </div>

               </div>
            </div>

          </div>
        </section>

        {/* Up Next */}
        <section>
          <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Up Next
          </h2>
          
          {/* Single Container for Notion-like feel */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[200px]">
            
            {/* Left: Concept Teaser (Empty State Style) */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100">
              <div className="mb-4 opacity-20">
                <Sparkles className="w-12 h-12 text-gray-900" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Custom AI Agents</h3>
              <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
                Design specialized AI agents with custom workflows. The future unit of work.
              </p>
              <div className="mt-4 px-3 py-1 bg-gray-50 text-xs text-gray-500 rounded-full border border-gray-200">
                Coming soon
              </div>
            </div>

            {/* Right: Roadmap List */}
            <div className="flex-1 p-6 bg-gray-50/30">
              <div className="flex justify-between items-center text-xs font-medium text-gray-400 mb-4 px-2">
                <span>Module</span>
                <span>Status</span>
              </div>
              <div className="space-y-1">
                {/* Item 1 */}
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50 transition-colors cursor-default group">
                  <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900">
                    <Presentation className="w-4 h-4 mr-3 text-gray-400" strokeWidth={1.5} />
                    AI Presentation (PPT)
                  </div>
                  <span className="text-xs text-gray-400 font-mono">Planning</span>
                </div>
                
                {/* Item 2 */}
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50 transition-colors cursor-default group">
                  <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900">
                    <FileUser className="w-4 h-4 mr-3 text-gray-400" strokeWidth={1.5} />
                    Smart Resume
                  </div>
                  <span className="text-xs text-gray-400 font-mono">Planning</span>
                </div>

                {/* Item 3 */}
                <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50 transition-colors cursor-default group">
                  <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900">
                    <Bot className="w-4 h-4 mr-3 text-gray-400" strokeWidth={1.5} />
                    Agent Workflow
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">In Progress</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
};
