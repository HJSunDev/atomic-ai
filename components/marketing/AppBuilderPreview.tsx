"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Play, Zap, Layout, MousePointer2, 
  Sparkles, Send, FileCode, Search, 
  Menu, X, Command, Hash, ChevronRight,
  Code2
} from "lucide-react";

// -----------------------------------------------------------------------------
// Mock Data & Components
// -----------------------------------------------------------------------------

const MOCK_CODE = [
  `export default function Hero() {`,
  `  return (`,
  `    <div className="relative h-screen flex items-center">`,
  `      <div className="absolute inset-0 z-0">`,
  `        <BackgroundGradient />`,
  `      </div>`,
  `      <div className="relative z-10 container mx-auto px-4">`,
  `        <h1 className="text-6xl font-bold text-white mb-6">`,
  `          Build the Future`,
  `        </h1>`,
  `        <p className="text-xl text-neutral-400 max-w-lg mb-8">`,
  `          Experience the next generation of AI tools.`,
  `        </p>`,
  `        <Button variant="primary">Get Started</Button>`,
  `      </div>`,
  `    </div>`,
  `  );`,
  `}`
];

const CodeLine = ({ text, delay }: { text: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex gap-4 text-[10px] leading-5 font-mono whitespace-pre"
  >
    <span className="text-neutral-700 select-none w-4 text-right shrink-0 opacity-50"></span>
    <span className="text-neutral-300">
      {/* Simple syntax highlighting simulation */}
      {text.split(/([<>"{}= ])/).map((part, i) => {
        if (part.match(/^<.+>$/)) return <span key={i} className="text-blue-400">{part}</span>;
        if (part.trim() === "import" || part.trim() === "export" || part.trim() === "function" || part.trim() === "return") return <span key={i} className="text-purple-400">{part}</span>;
        if (part.startsWith('"')) return <span key={i} className="text-green-400">{part}</span>;
        if (part.match(/^[A-Z][a-zA-Z]+$/)) return <span key={i} className="text-yellow-300">{part}</span>;
        return <span key={i}>{part}</span>;
      })}
    </span>
  </motion.div>
);

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export const AppBuilderPreview = () => {
  const [phase, setPhase] = useState(0);
  
  // Animation Sequence Definition
  // 0: Initial State (Empty)
  // 1: Typing Input
  // 2: User Message Sent
  // 3: AI Thinking / Reply
  // 4: Code Generating
  // 5: UI Reveal
  
  useEffect(() => {
    let mounted = true;

    const sequence = async () => {
      while (mounted) {
        if (!mounted) break;
        setPhase(0);
        await new Promise(r => setTimeout(r, 1500)); 
        
        if (!mounted) break;
        setPhase(1); // Typing
        await new Promise(r => setTimeout(r, 1500));
        
        if (!mounted) break;
        setPhase(2); // Sent
        await new Promise(r => setTimeout(r, 600));
        
        if (!mounted) break;
        setPhase(3); // AI Thinking
        await new Promise(r => setTimeout(r, 1200));
        
        if (!mounted) break;
        setPhase(4); // Code Gen
        await new Promise(r => setTimeout(r, 2000)); 
        
        if (!mounted) break;
        setPhase(5); // UI Reveal
        await new Promise(r => setTimeout(r, 5000)); 
      }
    };

    sequence();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full h-full bg-[#0A0A0A] flex flex-col overflow-hidden relative font-sans select-none">
      
      {/* Top Navigation / Window Controls */}
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#0A0A0A] shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
             <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-2" />
          <div className="flex items-center gap-2 text-neutral-500 text-xs">
            <Menu size={12} />
            <span className="font-mono">Atomic Builder</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 rounded border border-white/5 text-[10px] text-neutral-400">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span>v2.4.0-beta</span>
           </div>
           <Play size={12} className="text-green-400 fill-current opacity-80" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: AI Chat (25%) */}
        <div className="w-[25%] border-r border-white/5 bg-[#0A0A0A] flex flex-col relative z-10">
           {/* Chat Header */}
           <div className="h-9 border-b border-white/5 flex items-center px-3 gap-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
             <Bot size={12} />
             <span>Assistant</span>
           </div>

           {/* Chat History */}
           <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
              <AnimatePresence>
                 {phase >= 2 && (
                   <motion.div 
                     key="user-msg"
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     className="self-end bg-neutral-800 text-white text-xs p-3 rounded-2xl rounded-tr-sm max-w-[90%] shadow-sm border border-white/5"
                   >
                     Create a high-converting landing page hero section.
                   </motion.div>
                 )}

                 {phase >= 3 && (
                   <motion.div 
                     key="ai-msg"
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     className="self-start flex gap-3 max-w-[90%]"
                   >
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                         <Sparkles size={12} className="text-blue-400" />
                      </div>
                      <div className="bg-blue-950/30 text-blue-100 text-xs p-3 rounded-2xl rounded-tl-sm border border-blue-500/10">
                         {phase === 3 ? (
                           <div className="flex gap-1 h-4 items-center">
                             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-blue-400 rounded-full" />
                           </div>
                         ) : (
                           <span className="leading-relaxed">
                             Sure! Generating a responsive hero component with modern aesthetics...
                           </span>
                         )}
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Input Area */}
           <div className="p-3 border-t border-white/5 bg-neutral-900/30">
              <div className="relative h-9 bg-black border border-white/10 rounded-lg flex items-center px-3 overflow-hidden">
                 {phase === 1 && (
                   <motion.span 
                     initial={{ width: "0%" }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1, ease: "linear" }}
                     className="absolute left-0 top-0 h-full bg-blue-500/5"
                   />
                 )}
                 <div className="flex-1 text-[10px] text-neutral-300 font-mono truncate flex items-center">
                    {phase === 0 && <span className="text-neutral-600">Describe your app...</span>}
                    {phase === 1 && (
                      <span className="text-white">Create a high-converting landing page hero...|</span>
                    )}
                 </div>
                 <div className={`p-1 rounded hover:bg-white/10 transition-colors ${phase === 1 ? 'text-blue-400' : 'text-neutral-600'}`}>
                    <Send size={12} />
                 </div>
              </div>
           </div>
        </div>

        {/* CENTER PANEL: Preview (45%) - The Star of the Show */}
        <div className="w-[45%] bg-[#111] flex flex-col relative z-0">
           {/* Browser Toolbar */}
           <div className="h-9 bg-[#1A1A1A] border-b border-white/5 flex items-center px-3 gap-3 justify-between">
              <div className="flex items-center gap-2 text-neutral-500 bg-black/40 rounded px-2 py-1 border border-white/5 w-full max-w-[200px]">
                <Search size={10} />
                <span className="text-[9px] font-mono">localhost:3000</span>
              </div>
              <div className="flex gap-2 text-neutral-600">
                <Layout size={12} />
              </div>
           </div>

           {/* Preview Canvas */}
           <div className="flex-1 relative overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

              <AnimatePresence mode="wait">
                {phase < 5 ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-neutral-500"
                  >
                     {phase >= 4 && (
                       <motion.div 
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className="flex flex-col items-center gap-3"
                       >
                         <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                         <span className="text-[10px] font-mono tracking-wider animate-pulse">RENDERING...</span>
                       </motion.div>
                     )}
                     {phase < 4 && (
                       <div className="text-neutral-700 flex flex-col items-center gap-2">
                          <Layout size={32} strokeWidth={1} />
                          <span className="text-[10px] font-mono">PREVIEW AREA</span>
                       </div>
                     )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 bg-white overflow-hidden"
                  >
                     {/* Generated UI: Hero Section - Light Theme */}
                     <div className="w-full h-full bg-gradient-to-br from-slate-50 to-white flex flex-col">
                        
                        {/* Hero Content */}
                        <div className="flex-1 p-8 flex flex-col justify-center items-start">
                           <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: "40px" }} 
                             className="h-1 bg-slate-900 rounded-full mb-6 opacity-20" 
                           />
                           
                           <motion.h1 
                             initial={{ y: 10, opacity: 0 }} 
                             animate={{ y: 0, opacity: 1 }}
                             transition={{ delay: 0.2 }}
                             className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight leading-[1.1]"
                           >
                             Design at the<br/>speed of thought.
                           </motion.h1>
                           
                           <motion.p 
                             initial={{ y: 10, opacity: 0 }} 
                             animate={{ y: 0, opacity: 1 }} 
                             transition={{ delay: 0.3 }}
                             className="text-xs text-slate-500 mb-8 max-w-[220px] leading-relaxed"
                           >
                             Describe your idea, leave the rest to us. From concept to product in seconds.
                           </motion.p>
                           
                           <motion.div 
                             initial={{ y: 10, opacity: 0 }} 
                             animate={{ y: 0, opacity: 1 }}
                             transition={{ delay: 0.4 }}
                             className="flex gap-3"
                           >
                              <div className="h-8 px-4 bg-slate-900 text-white text-[10px] rounded-md flex items-center font-medium shadow-lg shadow-slate-900/10 cursor-pointer hover:scale-105 transition-transform">
                                Start Here
                              </div>
                              <div className="h-8 px-4 bg-white border border-slate-200 text-slate-600 text-[10px] rounded-md flex items-center font-medium shadow-sm hover:bg-slate-50 transition-colors">
                                Documentation
                              </div>
                           </motion.div>
                        </div>

                        {/* Feature Cards (Bottom) */}
                        <div className="h-1/3 border-t border-slate-100 grid grid-cols-2 divide-x divide-slate-100">
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.5 }}
                             className="p-5 bg-slate-50/50 flex flex-col justify-center"
                           >
                              <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center mb-2 shadow-sm shadow-blue-500/20">
                                <Code2 size={12} />
                              </div>
                              <div className="font-bold text-slate-800 text-xs mb-1">Clean Code</div>
                              <div className="text-[8px] text-slate-400 leading-tight">Native HTML + React + Tailwind.</div>
                           </motion.div>
                           
                           <motion.div 
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.6 }}
                             className="p-5 bg-white flex flex-col justify-center"
                           >
                              <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center mb-2 shadow-sm shadow-amber-500/20">
                                <Zap size={12} />
                              </div>
                              <div className="font-bold text-slate-800 text-xs mb-1">Instant UI</div>
                              <div className="text-[8px] text-slate-400 leading-tight">Real-time rendering engine.</div>
                           </motion.div>
                        </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* RIGHT PANEL: Code Editor (30%) */}
        <div className="w-[30%] border-l border-white/5 bg-[#0D0D0D] flex flex-col relative z-10">
           {/* File Tabs */}
           <div className="h-9 flex bg-[#0A0A0A]">
              <div className="px-3 py-2 bg-[#0D0D0D] border-r border-white/5 text-[10px] text-neutral-300 flex items-center gap-2 min-w-[100px] border-t-2 border-t-blue-500">
                 <FileCode size={12} className="text-blue-400" />
                 <span>Hero.tsx</span>
                 <X size={10} className="ml-auto text-neutral-600" />
              </div>
              <div className="px-3 py-2 text-[10px] text-neutral-600 flex items-center gap-2">
                 <span>page.tsx</span>
              </div>
           </div>
           
           {/* Breadcrumbs / Info */}
           <div className="h-6 border-b border-white/5 flex items-center px-3 gap-2 text-[9px] text-neutral-600 font-mono">
              <span>src</span>
              <ChevronRight size={8} />
              <span>components</span>
              <ChevronRight size={8} />
              <span>Hero.tsx</span>
           </div>

           {/* Editor Content */}
           <div className="flex-1 p-4 overflow-hidden font-mono text-[10px]">
              {phase < 4 ? (
                 // Empty State or Loading
                 <div className="h-full flex flex-col items-center justify-center text-neutral-700 gap-2 opacity-50">
                    <Command size={24} />
                    <span className="text-[10px]">Ready to code</span>
                 </div>
              ) : (
                 // Code Streaming
                 <div className="flex flex-col gap-0.5">
                    {MOCK_CODE.map((line, i) => (
                       <CodeLine 
                         key={i} 
                         text={line} 
                         delay={(i * 0.1) + 0.5} // Stagger effect
                       />
                    ))}
                 </div>
              )}
           </div>
           
           {/* Footer Status Bar */}
           <div className="h-6 border-t border-white/5 bg-[#0A0A0A] flex items-center px-3 justify-between text-[9px] text-neutral-600">
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>TypeScript</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Hash size={8} />
                    <span>UTF-8</span>
                 </div>
              </div>
              {phase >= 5 && <span className="text-green-500">Ln 17, Col 2</span>}
           </div>
        </div>
        
        {/* Cursor Simulation */}
        <AnimatePresence>
           {phase === 1 && (
              <motion.div 
                key="cursor"
                initial={{ x: "10%", y: "110%" }}
                animate={{ x: "15%", y: "85%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute z-50 text-white pointer-events-none drop-shadow-xl"
              >
                 <MousePointer2 size={24} fill="black" className="text-white" />
              </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
};
