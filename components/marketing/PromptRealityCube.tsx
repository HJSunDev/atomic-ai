"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Terminal, Layers, FileText, Zap, MessageSquare } from "lucide-react";

/**
 * PromptRealityCube (原 AtomicBlock)
 * 
 * 核心隐喻组件：展示 Prompt（提示词）与 Reality（现实/应用模块）之间的双向关系。
 * 
 * 视觉表现：
 * 一个 3D 立方体，随着滚动和鼠标移动进行交互。
 * - 正面：代码/Prompt
 * - 背面：生成的 UI/Reality
 * - 侧面：连接两者的结构
 */
export const PromptRealityCube = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // 滚动时的基础变换
  const rotateX = useTransform(scrollY, [0, 600], [20, 0]);
  const rotateY = useTransform(scrollY, [0, 600], [-20, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 0.8]);
  // Removed y transform that was causing vertical offset

  // 鼠标交互状态
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // 限制最大旋转角度为 ±35 度，避免完全侧面
      // 降低灵敏度：除以 20 而不是 10
      const limit = 35;
      const xAngle = x / 20;
      const yAngle = y / 20;
      
      mouseX.set(Math.max(-limit, Math.min(limit, xAngle)));
      mouseY.set(Math.max(-limit, Math.min(limit, yAngle)));
    }
  };

  // 组合滚动和鼠标的旋转效果
  const springConfig = { stiffness: 100, damping: 20 };
  const combinedRotateX = useSpring(
    useTransform([mouseY, rotateX], ([m, r]: any[]) => m * -1 + r),
    springConfig
  );
  const combinedRotateY = useSpring(
    useTransform([mouseX, rotateY], ([m, r]: any[]) => m + r),
    springConfig
  );

  return (
    <div className="perspective-1000 w-full h-full flex items-center justify-center relative " onMouseMove={handleMouseMove}>
      <motion.div
        ref={ref}
        style={{
          rotateX: combinedRotateX,
          rotateY: combinedRotateY,
          scale,
          transformStyle: "preserve-3d"
        }}
        className="relative w-64 h-64 md:w-80 md:h-80"
      >
        {/* Front Face - Code/Prompt */}
        <div 
            style={{ transform: "translateZ(12px)" }}
            className="absolute inset-0 bg-white border border-gray-200 shadow-xl flex flex-col p-6 backface-hidden z-30"
        >
            <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Terminal size={16} />
                <span className="text-xs font-mono">PROMPT</span>
            </div>
            <p className="font-mono text-sm text-gray-600 leading-relaxed">
                "Generate a knowledge system that evolves with my thoughts."
            </p>
            <div className="mt-auto h-1 w-4 bg-black animate-pulse" />
        </div>

        {/* Stack Layer 1 - Rotated & Shifted */}
        <div 
            style={{ transform: "translateZ(4px) rotateZ(-3deg) translateX(-6px)", opacity: 0.9 }}
            className="absolute inset-0 bg-gray-50 border border-gray-200 shadow-md backface-hidden z-20"
        />
        
        {/* Stack Layer 2 - Rotated & Shifted */}
        <div 
            style={{ transform: "translateZ(-4px) rotateZ(2deg) translateY(6px)", opacity: 0.8 }}
            className="absolute inset-0 bg-gray-100 border border-gray-200 shadow-md backface-hidden z-10"
        />

        {/* Back Face - Reality/App */}
        <div 
            style={{ transform: "translateZ(-12px) rotateY(180deg)" }}
            className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-xl flex flex-col p-6 backface-hidden z-30"
        >
             <div className="flex items-center gap-2 mb-4 text-blue-500">
                <Layers size={16} />
                <span className="text-xs font-mono uppercase">Reality</span>
            </div>
            <div className="flex-1 bg-white border border-gray-100 rounded-md shadow-sm p-3">
                <div className="h-2 w-1/2 bg-gray-100 rounded mb-2" />
                <div className="h-2 w-3/4 bg-gray-100 rounded mb-4" />
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-blue-50/50 rounded border border-blue-100" />
                    <div className="h-12 bg-purple-50/50 rounded border border-purple-100" />
                </div>
            </div>
        </div>

        {/* Floating Elements */}
        <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-12 -top-12 w-24 h-24 bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex flex-col items-center justify-center transform translate-z-60"
        >
            <FileText strokeWidth={1.5} size={32} className="text-[#37352F] mb-2" />
            <span className="text-[10px] font-mono text-gray-400 tracking-widest">DOCS</span>
        </motion.div>
        
         <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-8 bottom-12 w-20 h-20 bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex flex-col items-center justify-center transform translate-z-80"
         >
             <Zap strokeWidth={1.5} size={28} className="text-[#37352F] mb-2" />
             <span className="text-[10px] font-mono text-gray-400 tracking-widest">APPS</span>
         </motion.div>

         <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -left-12 -top-8 w-20 h-20 bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex flex-col items-center justify-center transform translate-z-50"
         >
             <MessageSquare strokeWidth={1.5} size={28} className="text-[#37352F] mb-2" />
             <span className="text-[10px] font-mono text-gray-400 tracking-widest">CHAT</span>
         </motion.div>

      </motion.div>
    </div>
  );
};

