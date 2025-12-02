"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, ChevronRight, 
  Send, Globe, Sparkles, Clock, LayoutGrid, 
  MoreHorizontal, Edit3, Calendar, BarChart2,
  ChevronDown, Medal
} from "lucide-react";
import { FaceIcon } from "@/components/ai-assistant/FaceIcon";

// -----------------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------------

const HISTORY_ITEMS = [
  { title: "React Server Components 最佳实践", active: true },
  { title: "设计一个高并发 API 架构", active: false },
  { title: "Q3 产品增长数据分析", active: false },
  { title: "TypeScript 类型系统深度解析", active: false },
  { title: "微服务架构迁移方案", active: false },
];

const SEARCH_RESULTS = [
  { title: "React Server Components RFC - React Official", source: "React.dev" },
  { title: "Server Components vs Client Components - Next.js", source: "Next.js" },
  { title: "RSC Performance Optimization Guide", source: "Vercel Blog" },
  { title: "Streaming SSR with React 19", source: "React Blog" },
  { title: "Server Components Best Practices 2025", source: "Web.dev" },
];

const STREAM_CONTENT = [
  { type: "h1", text: "React Server Components 核心概念与实践" },
  { type: "h3", icon: "⚡", text: "核心优势" },
  { type: "p", text: "• 零客户端 JavaScript：Server Components 在服务器端渲染，不发送 JavaScript 到客户端，显著减少包体积。" },
  { type: "p", text: "• 直接访问后端资源：可以安全地连接数据库、文件系统或内部 API，无需暴露敏感信息。" },
  { type: "h3", icon: "🏗️", text: "架构设计" },
  { type: "p", text: "• 组件分层：将数据获取逻辑放在 Server Components，交互逻辑放在 Client Components，实现关注点分离。" },
  { type: "p", text: "• 流式渲染：利用 Suspense 边界实现渐进式渲染，提升首屏加载速度。" },
  { type: "h3", icon: "💡", text: "最佳实践" },
  { type: "p", text: "• 使用 'use client' 指令明确标记客户端组件，避免不必要的客户端边界。" },
  { type: "p", text: "• 通过 props 传递序列化数据，而非直接传递函数或非序列化对象。" },
];

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const TypingCursor = () => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
    className="inline-block w-1.5 h-4 bg-black ml-1 align-middle"
  />
);

export const NeuralChatPreview = () => {
  const [phase, setPhase] = useState(0);
  // 0: Idle
  // 1: Typing
  // 2: Sent / Thinking
  // 3: Searching
  // 4: Streaming
  // 5: Complete

  useEffect(() => {
    let mounted = true;
    const loop = async () => {
      while (mounted) {
        if (!mounted) break;
        setPhase(0);
        await new Promise(r => setTimeout(r, 2000));
        
        if (!mounted) break;
        setPhase(1); // Typing
        await new Promise(r => setTimeout(r, 1500));
        
        if (!mounted) break;
        setPhase(2); // Sent
        await new Promise(r => setTimeout(r, 800));
        
        if (!mounted) break;
        setPhase(3); // Searching
        await new Promise(r => setTimeout(r, 2000));
        
        if (!mounted) break;
        setPhase(4); // Streaming
        await new Promise(r => setTimeout(r, 4000));
        
        if (!mounted) break;
        setPhase(5); // Complete
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    loop();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full h-full bg-white flex overflow-hidden rounded-xl border border-white/10 shadow-2xl font-sans select-none text-zinc-800">
      
      {/* Sidebar (Left) - 240px */}
      <div className="hidden md:flex w-[240px] bg-[#F9F9F9] border-r border-zinc-100 flex-col shrink-0">
        <div className="p-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
             <input 
                type="text" 
                placeholder="搜索聊天记录" 
                className="w-full h-9 pl-9 pr-8 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-300 transition-colors" 
             />
             <div className="absolute right-2 top-1/2 -translate-y-1/2 border border-zinc-200 rounded px-1.5 py-0.5">
                <LayoutGrid size={10} className="text-zinc-400" />
             </div>
           </div>
           
           <button className="w-full h-9 mt-3 bg-white border border-zinc-200 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-50 transition-colors text-zinc-600 text-xs font-medium">
              <Plus size={14} />
              <span>新建聊天</span>
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2">
           <div className="text-xs font-medium text-zinc-400 px-2 mb-2 mt-2">最近</div>
           <div className="flex flex-col gap-1">
              {HISTORY_ITEMS.map((item, i) => (
                <div 
                  key={i} 
                  className={`group flex items-center px-3 py-2 rounded-lg text-xs cursor-default transition-colors ${item.active ? 'bg-zinc-200/60 text-zinc-900 font-medium' : 'text-zinc-600 hover:bg-zinc-100'}`}
                >
                   <span className="truncate">{item.title}</span>
                </div>
              ))}
           </div>
           
           <div className="text-xs font-medium text-zinc-400 px-2 mb-2 mt-6">30天内</div>
           <div className="flex flex-col gap-1">
              {HISTORY_ITEMS.slice(1, 4).map((item, i) => (
                <div key={i} className="px-3 py-2 rounded-lg text-xs text-zinc-600 hover:bg-zinc-100 truncate">
                   {item.title}
                </div>
              ))}
           </div>
        </div>

        <div className="p-3 border-t border-zinc-200 flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <span className="text-xs font-bold">L</span>
           </div>
           <div className="flex flex-col">
              <span className="text-xs font-medium">Leon</span>
              <span className="text-[10px] text-zinc-400">Free Plan</span>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-hidden p-4 sm:p-8 sm:pb-24 flex flex-col gap-6 overflow-y-auto">
           
           {/* User Message */}
           <AnimatePresence>
             {phase >= 2 && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex justify-end mb-2"
               >
                  <div className="bg-[#F4F4F4] px-4 py-3 rounded-2xl rounded-tr-sm text-zinc-800 text-sm max-w-[80%]">
                     React Server Components 最佳实践
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* TimeStamp */}
           <AnimatePresence>
              {phase >= 2 && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="text-[10px] text-zinc-300 text-right pr-1 -mt-4 mb-2"
                 >
                   21:42
                 </motion.div>
              )}
           </AnimatePresence>

           {/* AI Response */}
           <AnimatePresence>
             {phase >= 3 && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex gap-4 max-w-3xl mr-auto w-full items-start"
               >
                  {/* Avatar: Using FaceIcon as requested */}
                  <div className="shrink-0 mt-1">
                     <div className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-sm">
                        <FaceIcon className="w-5 h-5 text-zinc-700" expression={phase === 3 ? "surprised" : phase === 4 ? "neutral" : "neutral"} />
                     </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-3">
                     {/* Model Tag */}
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-800">OmniAid</span>
                        <span className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 rounded font-medium">
                           moonshotai/kimi-k2-thinking
                        </span>
                     </div>

                     {/* 1. Search Step */}
                     <div className="bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100/50">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 cursor-pointer hover:bg-zinc-100 transition-colors">
                           {phase === 3 ? (
                             <div className="w-3 h-3 border-2 border-zinc-300 border-t-blue-500 rounded-full animate-spin" />
                           ) : (
                             <ChevronRight size={12} />
                           )}
                           <span className="font-medium">
                              {phase === 3 ? "正在搜索相关内容..." : "已找到 5 个相关结果"}
                           </span>
                        </div>
                        
                        <AnimatePresence>
                          {phase >= 3 && (
                             <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: phase === 3 ? "auto" : 0, opacity: phase === 3 ? 1 : 0 }}
                               className="overflow-hidden"
                             >
                                <div className="px-3 pb-2 flex flex-col gap-1">
                                   {SEARCH_RESULTS.map((res, i) => (
                                     <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                                        <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                        <span className="truncate">{res.title}</span>
                                        <span className="ml-auto text-[9px] px-1 bg-zinc-100 rounded">{res.source}</span>
                                     </div>
                                   ))}
                                </div>
                             </motion.div>
                          )}
                        </AnimatePresence>
                     </div>

                     {/* 2. Content Streaming */}
                     {phase >= 4 && (
                        <div className="space-y-3 text-zinc-800 text-sm leading-relaxed">
                           {STREAM_CONTENT.map((block, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.6 }} // Stagger
                              >
                                 {block.type === 'h1' && (
                                    <div className="flex items-center gap-2 mb-3">
                                       <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-sm">⚛️</div>
                                       <h1 className="text-base font-bold">{block.text}</h1>
                                    </div>
                                 )}
                                 {block.type === 'h3' && (
                                    <div className="flex items-center gap-2 mt-4 mb-1">
                                       <span className="text-base">{block.icon}</span>
                                       <h3 className="font-bold text-zinc-900">{block.text}</h3>
                                    </div>
                                 )}
                                 {block.type === 'p' && <p className="text-zinc-600 pl-1">{block.text}</p>}
                              </motion.div>
                           ))}
                           {phase === 4 && <TypingCursor />}
                        </div>
                     )}

                     {/* 3. Action Chips */}
                     {phase >= 5 && (
                        <motion.div 
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex gap-2 mt-4 pt-2"
                        >
                           <Chip icon={<Edit3 size={12} />} text="生成代码示例" />
                           <Chip icon={<BarChart2 size={12} />} text="性能对比分析" />
                           <Chip icon={<Globe size={12} />} text="查看更多资源" />
                        </motion.div>
                     )}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Input Area (Fixed Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
           <div className="border border-zinc-200 rounded-xl bg-white shadow-sm focus-within:ring-1 focus-within:ring-zinc-300 transition-all">
              <textarea 
                 readOnly
                 rows={1}
                 className="w-full resize-none px-4 py-3 outline-none text-sm text-zinc-800 placeholder:text-zinc-400 bg-transparent min-h-[50px]"
                 placeholder={phase === 0 ? "问我任何问题..." : ""}
                 value={phase === 1 ? "React Server Components 最佳实践" : ""}
              />
              
              {/* Typing Simulation */}
              {phase === 1 && (
                 <div className="absolute top-3 left-4 pointer-events-none text-sm text-zinc-800">
                    React Server Components 最佳实践<TypingCursor />
                 </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center justify-between px-3 pb-2">
                 <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-50 cursor-pointer text-zinc-500 transition-colors">
                       <div className="w-4 h-4 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[8px]">
                          <Sparkles size={8} />
                       </div>
                       <span className="text-xs font-medium">GPT-OSS 20B</span>
                       <ChevronDown size={12} />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-50 cursor-pointer text-zinc-500 transition-colors">
                       <Globe size={12} />
                       <span className="text-xs">全网</span>
                       <div className="w-6 h-3 bg-zinc-200 rounded-full relative ml-1">
                          <div className="absolute left-0.5 top-0.5 w-2 h-2 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 text-zinc-400">
                    <Sparkles size={16} />
                    <div className="rotate-45"><ChevronRight size={16} /></div>
                    <Send size={16} className={phase === 1 ? "text-zinc-800" : ""} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div className="md:hidden absolute inset-0 pointer-events-none z-50 flex items-end justify-center pb-8 bg-gradient-to-t from-black/5 to-transparent">
      </div>
    </div>
  );
};

const Chip = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full text-xs text-zinc-600 hover:bg-zinc-200 cursor-pointer transition-colors">
      {icon}
      <span>{text}</span>
   </div>
);
