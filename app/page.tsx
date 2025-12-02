
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs";
import { ArrowRight, Minus, FileText, Zap, MessageSquare } from "lucide-react";

/**
 * 沉浸式流体背景 (The Neural Field)
 * 使用 HTML5 Canvas 实现高性能粒子流场
 */
const NeuralField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    
    const particles: Particle[] = [];
    const particleCount = 100; // 粒子数量
    
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      
      draw() {
        if (!ctx) return;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Draw connections
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40 pointer-events-none" />;
};

/**
 * 磁力光标 (Magnetic Cursor)
 */
const CustomCursor = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed w-8 h-8 rounded-full border border-white/20 pointer-events-none z-[9999] hidden md:block mix-blend-difference"
      style={{
        x: mouseX,
        y: mouseY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
    </motion.div>
  );
};

/**
 * 极简导航 + 优雅登录交互
 */
const MinimalNav = () => {
  const { isSignedIn } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-start z-50 text-white">
      <div className="flex flex-col mix-blend-difference">
        <span className="font-mono text-xs tracking-[0.5em] uppercase opacity-50">Atomic AI</span>
        <span className="text-sm font-bold mt-1">Ver. 2.0</span>
      </div>
      
      <div className="flex items-center gap-6">
         {isSignedIn ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* UserButton 外层装饰效果 */}
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all"
                  }
                }}
              />
            </motion.div>
         ) : (
           <SignInButton mode="modal">
             <motion.button 
               onHoverStart={() => setIsHovered(true)}
               onHoverEnd={() => setIsHovered(false)}
               className="group relative flex items-center gap-3 overflow-hidden"
             >
               {/* 文字部分 */}
               <motion.span 
                 animate={{ 
                   x: isHovered ? -8 : 0,
                   opacity: isHovered ? 0.6 : 1 
                 }}
                 transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                 className="font-mono text-xs tracking-[0.3em] uppercase"
               >
                 Login
               </motion.span>
               
               {/* 动态下划线 */}
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: isHovered ? "3rem" : 0 }}
                 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                 className="h-[1px] bg-white absolute -bottom-1 right-0"
               />
               
               {/* 光晕点 */}
               <AnimatePresence>
                 {isHovered && (
                   <motion.div
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                   />
                 )}
               </AnimatePresence>
             </motion.button>
           </SignInButton>
         )}
      </div>
    </nav>
  );
};


/**
 * 全息系统按钮组件
 */
const SystemStartBtn = ({ text, onClick }: { text: string, onClick?: () => void }) => (
    <button onClick={onClick} className="group relative overflow-hidden bg-white/5 px-8 py-4 backdrop-blur-[2px] transition-all duration-300">
      {/* 扫描线背景 */}
      <div className="absolute inset-0 -translate-y-full bg-gradient-to-b from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-y-full" />
      
      {/* 边框动画 */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
  
      <div className="relative z-10 flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30 group-hover:text-blue-400 transition-colors">
            System_Ready
          </span>
          <span className="font-bold tracking-[0.15em] text-white text-base sm:text-lg">
            {text}
          </span>
        </div>
        <div className="h-8 w-[1px] bg-white/20 group-hover:bg-white/50 transition-colors" />
        <ArrowRight className="h-5 w-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
      </div>
  
      {/* 角标装饰 */}
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-white/20 transition-all duration-300 group-hover:border-white/80" />
      <div className="absolute right-0 top-0 h-2 w-2 border-r border-t border-white/20 transition-all duration-300 group-hover:border-white/80" />
      <div className="absolute left-0 bottom-0 h-2 w-2 border-l border-b border-white/20 transition-all duration-300 group-hover:border-white/80" />
      <div className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-white/20 transition-all duration-300 group-hover:border-white/80" />
    </button>
);

/**
 * 章节：起源 - 首屏
 */
const GenesisSection = () => {
  const { scrollY } = useScroll();
  const { isSignedIn } = useUser();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  
  // 延长首屏内容消失的时间，让小块运动时背景还可见
  const opacity = useTransform(scrollY, [200, 600], [1, 0]);

  // 定义三个块的滚动运动轨迹
  // 目标：运动到屏幕下方中间消失
  // 我们需要更长的滚动距离来完成这个动画
  
  // 水平位移：汇聚到中心
  const moveX_Docs = useTransform(scrollY, [0, 600], ["0%", "-28vw"]); 
  const moveX_Apps = useTransform(scrollY, [0, 600], ["0%", "35vw"]); 
  const moveX_Chat = useTransform(scrollY, [0, 600], ["0%", "30vw"]); 

  // 垂直位移：大幅向下，直到消失在视口下方
  // 这里的数值需要足够大以抵消 section 的上移并继续向下
  const moveY_Docs = useTransform(scrollY, [0, 600], ["0%", "120vh"]); 
  const moveY_Apps = useTransform(scrollY, [0, 600], ["0%", "80vh"]); 
  const moveY_Chat = useTransform(scrollY, [0, 600], ["0%", "100vh"]); 
  
  // 透明度：在接近目的地时才消失
  const itemOpacity = useTransform(scrollY, [400, 700], [1, 0]);
  
  // 缩放：逐渐变小，模拟远去
  const itemScale = useTransform(scrollY, [0, 600], [1, 0.2]);
  
  // 旋转：增加动感
  const itemRotate = useTransform(scrollY, [0, 600], [0, 120]); 

  return (
    <section className="h-screen relative flex items-center justify-center overflow-hidden px-4">
      <motion.div 
        style={{ opacity }}
        className="relative z-10 w-full max-w-[90vw]"
      >
        <div className="flex flex-col gap-0 leading-none">
          <motion.h1 
            style={{ y: y1 }}
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[12vw] sm:text-[15vw] font-black text-white tracking-tighter mix-blend-overlay"
          >
            THINK
          </motion.h1>
          
          <motion.div 
            style={{ y: y2 }}
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex flex-col items-end"
          >
            <div className="flex items-center gap-4 sm:gap-8">
               <div className="h-[2px] bg-white/50 w-[20vw]" />
               <h1 className="text-[12vw] sm:text-[15vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/0 tracking-tighter">
                REALITY
              </h1>
            </div>

            {/* 极简系统入口 CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="mt-8 mr-2"
            >
              {isSignedIn ? (
                <Link href="/home">
                  <SystemStartBtn text="ENTER_WORKSPACE" />
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <SystemStartBtn text="START_ENGINE" />
                </SignInButton>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* 三个功能小块 - 灵动浮动 + 倾斜 + 滚动汇聚效果 */}
      {/* DOCS: 右上角 */}
      <motion.div 
        style={{ 
          x: moveX_Docs, 
          y: moveY_Docs, 
          opacity: itemOpacity, 
          scale: itemScale,
          rotate: itemRotate
        }}
        className="absolute right-[12%] top-[18%] z-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -15, 0],
            rotate: [15, 12, 15]
          }}
          transition={{ 
            opacity: { delay: 1.5, duration: 0.8 },
            scale: { delay: 1.5, duration: 0.8 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 flex flex-col items-center justify-center"
        >
          <FileText strokeWidth={1.5} size={24} className="text-white mb-2" />
          <span className="text-[9px] font-mono text-white/60 tracking-widest">DOCS</span>
        </motion.div>
      </motion.div>

      {/* APPS: 左下偏上 */}
      <motion.div 
        style={{ 
          x: moveX_Apps, 
          y: moveY_Apps, 
          opacity: itemOpacity, 
          scale: itemScale, 
          rotate: itemRotate
        }}
        className="absolute left-[8%] bottom-[30%] z-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, 20, 0],
            rotate: [5, 2, 5]
          }}
          transition={{ 
            opacity: { delay: 1.7, duration: 0.8 },
            scale: { delay: 1.7, duration: 0.8 },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 flex flex-col items-center justify-center"
        >
          <Zap strokeWidth={1.5} size={20} className="text-white mb-2" />
          <span className="text-[9px] font-mono text-white/60 tracking-widest">APPS</span>
        </motion.div>
      </motion.div>

      {/* CHAT: 左上角 */}
      <motion.div 
        style={{ 
          x: moveX_Chat, 
          y: moveY_Chat, 
          opacity: itemOpacity, 
          scale: itemScale,
          rotate: itemRotate
        }}
        className="absolute left-[10%] top-[22%] z-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, -15, 0],
            rotate: [-10, -15, -10]
          }}
          transition={{ 
            opacity: { delay: 1.9, duration: 0.8 },
            scale: { delay: 1.9, duration: 0.8 },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
            rotate: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-3 flex flex-col items-center justify-center"
        >
          <MessageSquare strokeWidth={1.5} size={20} className="text-white mb-2" />
          <span className="text-[9px] font-mono text-white/60 tracking-widest">CHAT</span>
        </motion.div>
      </motion.div>
      
      <div className="absolute bottom-12 left-8 font-mono text-xs text-white/40 flex flex-col gap-2">
         <span>SCROLL TO EXPLORE</span>
         <span>///</span>
      </div>
    </section>
  );
};

/**
 * 章节：解构 - 表达产品理念
 */
const DeconstructionSection = () => {
  return (
    <section className="min-h-screen relative py-32 px-4 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-12">
            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ margin: "-20%" }}
            >
              <span className="font-mono text-blue-400 text-xs tracking-widest mb-4 block">01. THE PROBLEM</span>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Chaos in<br/>Creation.
              </h2>
              <p className="text-white/50 text-lg leading-relaxed">
                The modern workflow is broken. Fragments of intelligence scattered across isolated tools. We built a bridge over the void.
              </p>
            </motion.div>

             <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ margin: "-20%" }}
               transition={{ delay: 0.2 }}
            >
              <span className="font-mono text-purple-400 text-xs tracking-widest mb-4 block">02. THE SOLUTION</span>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Atomic<br/>Structure.
              </h2>
              <p className="text-white/50 text-lg leading-relaxed">
                Not just a generator. A synthesizer. Reality feeds the prompt. The prompt shapes reality. An infinite, self-improving loop of pure creation.
              </p>
            </motion.div>
          </div>

          {/* 抽象 3D 视觉展示 */}
          <div className="relative h-[60vh] md:h-auto flex items-center justify-center perspective-1000">
             <motion.div 
                style={{ rotateX: 15, rotateY: -15, transformStyle: "preserve-3d" }}
                animate={{ rotateY: [-15, 15, -15], rotateX: [15, 5, 15] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 sm:w-80 sm:h-80 border border-white/20 relative bg-white/5 backdrop-blur-sm"
             >
                <div className="absolute inset-0 border border-white/10 translate-z-10 scale-90" />
                <div className="absolute inset-0 border border-white/10 translate-z-20 scale-75" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-20 blur-xl translate-z-[-50px]" />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-mono text-xs tracking-widest mix-blend-difference">
                  ATOMIC_CORE
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * 章节：显化 - 水平滚动展示
 */
const ManifestationSection = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-neutral-950">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 sm:gap-16 px-8 sm:px-32">
          
          {/* Intro Card */}
          <div className="w-[80vw] sm:w-[60vw] shrink-0 flex flex-col justify-center">
             <h2 className="text-[8vw] font-bold text-white/20 leading-none mb-8">
               THE<br/>SUITE
             </h2>
             <p className="text-xl text-white max-w-md">
               Explore the tools designed to reshape your reality. Swipe to discover.
             </p>
             <div className="mt-12 flex items-center gap-4 text-white/40">
               <ArrowRight className="animate-pulse" />
               <span className="font-mono text-xs">SCROLL HORIZONTALLY</span>
             </div>
          </div>

          {/* Module 1: Chat */}
          <div className="w-[85vw] sm:w-[45vw] aspect-[4/5] bg-[#111] border border-white/10 p-8 relative group hover:bg-[#151515] transition-colors shrink-0">
             <div className="absolute top-8 right-8 font-mono text-xs text-white/30">01</div>
             <div className="h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-all" />
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Neural Chat</h3>
                  <p className="text-white/60">More than text. A command center for your digital existence. Execute code, analyze data, invoke agents.</p>
                </div>
             </div>
          </div>

          {/* Module 2: Docs */}
          <div className="w-[85vw] sm:w-[45vw] aspect-[4/5] bg-[#111] border border-white/10 p-8 relative group hover:bg-[#151515] transition-colors shrink-0">
             <div className="absolute top-8 right-8 font-mono text-xs text-white/30">02</div>
             <div className="h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full blur-xl group-hover:bg-purple-500/40 transition-all" />
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Living Docs</h3>
                  <p className="text-white/60">Documents that breathe. Auto-generating, self-updating knowledge bases that evolve with your project.</p>
                </div>
             </div>
          </div>

          {/* Module 3: Apps */}
          <div className="w-[85vw] sm:w-[45vw] aspect-[4/5] bg-[#111] border border-white/10 p-8 relative group hover:bg-[#151515] transition-colors shrink-0">
             <div className="absolute top-8 right-8 font-mono text-xs text-white/30">03</div>
             <div className="h-full flex flex-col justify-between">
                <div className="w-12 h-12 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/40 transition-all" />
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">App Forge</h3>
                  <p className="text-white/60">Idea to deployment in seconds. Describe the functionality, and watch the code construct itself before your eyes.</p>
                </div>
             </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

/**
 * 终章 - 呼唤 
 */
const FinalCall = () => {
  const { isSignedIn } = useUser();
  return (
    <section className="h-[60vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-white text-black">
      {/* 网格背景 - 使用更明显的网格图案 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      {/* 水平渐变：从左边的浅蓝灰色过渡到右边的浅桃橙色 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 via-transparent to-orange-50/60" />
      
      <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-zinc-900 relative z-10">
        Ready to build?
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 relative z-10">
        {isSignedIn ? (
            <Link href="/home">
               <button className="group relative px-8 py-4 bg-black text-white font-medium rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
                  <span className="relative z-10 flex items-center gap-2">
                    Enter Workspace <ArrowRight className="w-4 h-4" />
                  </span>
               </button>
            </Link>
        ) : (
            <SignInButton mode="modal">
               <button className="group relative px-8 py-4 bg-black text-white font-medium rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Workspace <ArrowRight className="w-4 h-4" />
                  </span>
               </button>
            </SignInButton>
        )}
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-white selection:text-black cursor-none">
      <CustomCursor />
      <NeuralField />
      <MinimalNav />
      
      <main>
        <GenesisSection />
        <DeconstructionSection />
        <ManifestationSection />
        <FinalCall />
      </main>
      
      <footer className="py-8 px-8 border-t border-white/10 flex justify-between items-end text-xs text-white/30 font-mono uppercase">
        <div>
          © {new Date().getFullYear()} Atomic AI Labs<br/>
          All Systems Nominal
        </div>
        <div className="text-right">
          Designed for<br/>The Future
        </div>
      </footer>
    </div>
  );
}
