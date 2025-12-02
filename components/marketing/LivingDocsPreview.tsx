"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Plus, Search, MoreHorizontal, 
  ChevronRight, Edit2, Clock, CheckCircle2,
  Bold, Italic, List, Heading, Quote, Image as ImageIcon,
  Layout, X
} from "lucide-react";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";

// -----------------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------------

const DOC_CONTENT = [
  { type: "h1", text: "无标题" },
  { type: "meta", text: "添加描述...\n+添加前置信息" },
  { type: "p", text: "" }, // Empty line for typing
];

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

const TypingCursor = () => (
  <motion.span
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
    className="inline-block w-[2px] h-[1.2em] bg-black align-middle ml-[1px]"
  />
);

export const LivingDocsPreview = () => {
  const [phase, setPhase] = useState(0);
  // 0: Idle (Empty)
  // 1: Typing Title
  // 2: Typing Command
  // 3: AI Menu Open
  // 4: AI Generating
  // 5: Content Reveal

  useEffect(() => {
    let mounted = true;
    const loop = async () => {
      while (mounted) {
        if (!mounted) break;
        setPhase(0);
        await new Promise(r => setTimeout(r, 1500));
        
        if (!mounted) break;
        setPhase(1); // Typing Title "Project Nebula"
        await new Promise(r => setTimeout(r, 1500));
        
        if (!mounted) break;
        setPhase(2); // Typing Command "/"
        await new Promise(r => setTimeout(r, 800));
        
        if (!mounted) break;
        setPhase(3); // AI Menu Open
        await new Promise(r => setTimeout(r, 1200));

        if (!mounted) break;
        setPhase(4); // AI Generating
        await new Promise(r => setTimeout(r, 2000));

        if (!mounted) break;
        setPhase(5); // Content Reveal
        await new Promise(r => setTimeout(r, 5000));
      }
    };
    loop();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full h-full bg-white flex overflow-hidden rounded-xl border border-white/10 shadow-2xl font-sans select-none text-zinc-800 relative">
      
      {/* Floating AI Assistant Avatar (Top Right) */}
      <div className="absolute top-6 right-6 z-20">
         <motion.div
           animate={phase === 4 ? { y: [0, -8, 0] } : {}}
           transition={{ 
             duration: 0.6, 
             repeat: phase === 4 ? Infinity : 0, 
             repeatDelay: 0.2,
             ease: "easeInOut"
           }}
         >
            <AiAssistantAvatar className="w-12 h-12 shadow-md border-zinc-100 hover:scale-105 transition-transform cursor-pointer" />
         </motion.div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col relative bg-white">
         
         {/* Simple Toolbar (Top Left) */}
         <div className="absolute top-6 left-6 flex items-center gap-4 z-10">
            <div className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-400 cursor-pointer transition-colors">
               <Layout size={18} />
            </div>
         </div>
         
         {/* Window Controls (Top Right - Simulated) */}
         <div className="absolute top-6 right-24 flex items-center gap-2 z-10">
            <MoreHorizontal size={20} className="text-zinc-300" />
            <X size={20} className="text-zinc-300 ml-2" />
         </div>

         {/* Editor Canvas */}
         <div className="flex-1 px-12 sm:px-20 py-24 overflow-hidden flex flex-col relative">
            
            {/* Title Area */}
            <div className="mb-8 relative">
               <h1 className={`text-4xl sm:text-5xl font-bold text-zinc-200 transition-colors duration-500 ${phase > 0 ? 'text-zinc-900' : ''}`}>
                  {phase === 0 && "无标题"}
                  {phase >= 1 && "Project Nebula"}
                  {phase === 1 && <TypingCursor />}
               </h1>
               
               {/* Meta Info */}
               <div className="mt-4 space-y-1 text-zinc-400 text-sm font-medium">
                  <p>添加描述...</p>
                  <div className="flex items-center gap-1 hover:text-zinc-600 cursor-pointer transition-colors w-fit">
                     <Plus size={14} />
                     <span>添加前置信息</span>
                  </div>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
               
               {/* Initial State: Placeholder */}
               {phase < 2 && (
                  <div className="text-zinc-300 text-lg">
                     点击右上角 AI 助手生成文档
                     {phase === 1 && <span className="opacity-0">|</span>} 
                     {/* Cursor moved to title in phase 1 */}
                  </div>
               )}

               {/* Phase 2: User Types "/" (REMOVED as per instruction) -> Replaced with direct AI trigger simulation */}
               
               {/* Phase 2 & 3: AI Activation via Avatar Click Simulation */}
               {phase === 2 && (
                  <div className="absolute top-6 right-6 z-30">
                      {/* Simulate Mouse Click on Avatar */}
                      <motion.div 
                        initial={{ scale: 1 }}
                        animate={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="w-12 h-12 rounded-full border-2 border-blue-400/50 animate-ping absolute inset-0"
                      />
                  </div>
               )}

               {/* Phase 3: AI Generating Indicator (Now triggered directly) */}
               <AnimatePresence>
                  {phase === 3 && (
                     <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-20 right-6 z-30 bg-white shadow-xl border border-zinc-100 rounded-xl p-4 w-64"
                     >
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                           <span className="text-xs font-bold text-zinc-700">AI Assistant</span>
                        </div>
                        <div className="text-xs text-zinc-500">
                           Drafting content for "Project Nebula"...
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* Phase 4: AI Generating Inline Indicator */}
               <AnimatePresence>
                  {phase === 4 && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 text-zinc-400 bg-zinc-50 px-4 py-3 rounded-lg border border-zinc-100 w-fit"
                     >
                        <div className="w-4 h-4 border-2 border-zinc-300 border-t-purple-500 rounded-full animate-spin" />
                        <span className="text-sm">Generating structure...</span>
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* Phase 5: Content Reveal */}
               {phase >= 5 && (
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="space-y-6 max-w-2xl"
                  >
                     <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                     >
                        <h2 className="text-2xl font-bold text-zinc-800 mb-2">1. Mission Statement</h2>
                        <p className="text-zinc-600 leading-relaxed">
                           Project Nebula aims to revolutionize the way teams collaborate by integrating intelligent context awareness directly into the workflow. Our goal is to reduce friction in information retrieval and synthesis.
                        </p>
                     </motion.div>

                     <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                     >
                        <h2 className="text-2xl font-bold text-zinc-800 mb-2">2. Key Objectives (Q4)</h2>
                        <ul className="space-y-2 text-zinc-600">
                           <li className="flex gap-2 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-2 shrink-0" />
                              <span>Launch the new neural search engine beta.</span>
                           </li>
                           <li className="flex gap-2 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-2 shrink-0" />
                              <span>Onboard 50 enterprise pilot partners.</span>
                           </li>
                           <li className="flex gap-2 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-2 shrink-0" />
                              <span>Achieve 99.9% system uptime during high-load testing.</span>
                           </li>
                        </ul>
                     </motion.div>
                     
                     {/* Action Button for User */}
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }} 
                        className="pt-4 flex gap-2"
                     >
                         <button className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-medium transition-colors">
                            Accept
                         </button>
                         <button className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 text-xs font-medium transition-colors">
                            Retry
                         </button>
                     </motion.div>
                  </motion.div>
               )}

            </div>
         
         </div>
         
         {/* Floating Toolbar (Bottom Center) - Contextual */}
         <AnimatePresence>
           {phase >= 5 && (
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-zinc-200 rounded-full px-4 py-2 flex items-center gap-4 z-20"
             >
                <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 cursor-pointer transition-colors border-r border-zinc-100 pr-4">
                   <span className="text-xs font-bold">B</span>
                   <span className="text-xs italic font-serif">I</span>
                   <span className="text-xs underline">U</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                   <Heading size={14} className="hover:text-zinc-800 cursor-pointer" />
                   <List size={14} className="hover:text-zinc-800 cursor-pointer" />
                   <Quote size={14} className="hover:text-zinc-800 cursor-pointer" />
                   <ImageIcon size={14} className="hover:text-zinc-800 cursor-pointer" />
                </div>
             </motion.div>
           )}
         </AnimatePresence>

      </div>

      {/* Mobile Overlay */}
      <div className="md:hidden absolute inset-0 pointer-events-none z-50 flex items-end justify-center pb-8 bg-gradient-to-t from-black/5 to-transparent">
         <span className="text-xs text-zinc-400 font-medium bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-white/20">Desktop View Recommended</span>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
   <div className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'hover:bg-zinc-50 text-zinc-600'}`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {active && <div className="ml-auto text-[10px] text-blue-400 font-mono">↵</div>}
   </div>
);

