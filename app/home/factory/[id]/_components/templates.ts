/**
 * Shell & Slot 模式的静态模板系统
 * 
 * 设计理念：
 * 1. Shell (壳层)：由我们预先定义的稳定基础设施，AI 不会触碰
 * 2. Slot (插槽)：AI 只需要生成 GeneratedApp.tsx 这一个文件
 * 3. 预置依赖：常用组件和工具库已经准备好，AI 直接引用即可
 */

// ==================== 1. 工具函数层 ====================

export const UTILS_CODE = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number, format = 'PPP'): string {
  const { format: formatFn } = require('date-fns');
  return formatFn(new Date(date), format);
}

export function formatRelativeTime(date: Date | string | number): string {
  const { formatDistanceToNow } = require('date-fns');
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
`;

// ==================== 2. 预置 UI 组件库 (Shadcn 简化版) ====================

export const BUTTON_COMPONENT = `import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    };
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
`;

export const CARD_COMPONENT = `import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
`;

export const INPUT_COMPONENT = `import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
`;

export const BADGE_COMPONENT = `import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
`;

export const SELECT_COMPONENT = `import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
`;

export const TEXTAREA_COMPONENT = `import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
`;

// ==================== 3. 入口文件 (Shell) ====================

export const ENTRY_APP_CODE = `import React from 'react';
import GeneratedApp from './GeneratedApp';
import './styles.css';

export default function App() {
  return (
    <div className="w-full h-full min-h-screen bg-background text-foreground antialiased">
      <GeneratedApp />
    </div>
  );
}
`;

// ==================== 3.5 index.tsx 入口 ====================

export const INDEX_CODE = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

// ==================== 4. 全局样式 ====================

export const GLOBAL_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;

// ==================== 5. 文件系统构建器 ====================

export interface SandpackFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

export interface SandpackFiles {
  [path: string]: SandpackFile;
}

/**
 * 构建完整的 Sandpack 文件系统
 * @param generatedCode AI 生成的 GeneratedApp.tsx 代码
 * @returns 完整的文件映射对象
 */
export function buildSandpackFiles(generatedCode: string): SandpackFiles {
  return {
    // 入口文件
    "/index.tsx": {
      code: INDEX_CODE,
      hidden: true,
    },

    "/App.tsx": {
      code: ENTRY_APP_CODE,
      hidden: true,
      readOnly: true,
    },

    // AI 生成区（唯一可见可编辑的文件）
    "/GeneratedApp.tsx": {
      code: generatedCode,
      active: true,
      hidden: false,
    },

    // 工具函数库（隐藏）
    "/lib/utils.ts": {
      code: UTILS_CODE,
      hidden: true,
      readOnly: true,
    },

    // UI 组件库（隐藏）
    "/components/ui/button.tsx": {
      code: BUTTON_COMPONENT,
      hidden: true,
      readOnly: true,
    },
    "/components/ui/card.tsx": {
      code: CARD_COMPONENT,
      hidden: true,
      readOnly: true,
    },
    "/components/ui/input.tsx": {
      code: INPUT_COMPONENT,
      hidden: true,
      readOnly: true,
    },
    "/components/ui/badge.tsx": {
      code: BADGE_COMPONENT,
      hidden: true,
      readOnly: true,
    },
    "/components/ui/select.tsx": {
      code: SELECT_COMPONENT,
      hidden: true,
      readOnly: true,
    },
    "/components/ui/textarea.tsx": {
      code: TEXTAREA_COMPONENT,
      hidden: true,
      readOnly: true,
    },

    // 全局样式（隐藏）
    "/styles.css": {
      code: GLOBAL_CSS,
      hidden: true,
      readOnly: true,
    },

    // TypeScript 配置（支持路径别名）
    "/tsconfig.json": {
      code: JSON.stringify({
        compilerOptions: {
          strict: true,
          module: "ESNext",
          jsx: "react",
          esModuleInterop: true,
          sourceMap: true,
          allowJs: true,
          lib: ["es6", "dom"],
          rootDir: "/",
          moduleResolution: "node",
          resolveJsonModule: true,
          baseUrl: ".",
          paths: {
            "@/*": ["./*"]
          }
        }
      }, null, 2),
      hidden: true,
    },
  };
}

/**
 * 默认的空白模板（当还没有生成任何代码时使用）
 */
export const EMPTY_TEMPLATE = `import React, { useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Sparkles, Code2, Palette, Zap, Terminal, LayoutTemplate, MousePointer2, Command, Box, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ------------------------------------------
// 鼠标跟随聚光灯卡片组件
// ------------------------------------------
function SpotlightCard({ children, className = "", spotlightColor = "rgba(124, 58, 237, 0.15)" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative border border-slate-200 bg-white overflow-hidden rounded-xl",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionValue(
            \`radial-gradient(600px circle at \${mouseX}px \${mouseY}px, \${spotlightColor}, transparent 80%)\`
          )
        }}
      />
      <div className="relative h-full">
        {children}
      </div>
    </div>
  );
}

// ------------------------------------------
// 动态背景组件
// ------------------------------------------
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 极简网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* 柔和光晕 */}
      <div className="absolute -left-[10%] top-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-200/30 blur-[120px] mix-blend-multiply animate-blob" />
      <div className="absolute -right-[10%] top-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-200/30 blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
      
      {/* 漂浮图标 */}
      {[
        { Icon: Code2, color: "text-blue-400", left: "10%", top: "20%", delay: 0 },
        { Icon: Palette, color: "text-purple-400", left: "85%", top: "15%", delay: 1.5 },
        { Icon: Box, color: "text-pink-400", left: "15%", top: "80%", delay: 3 },
        { Icon: Zap, color: "text-yellow-400", left: "80%", top: "75%", delay: 4.5 },
      ].map((item, i) => (
        <motion.div
          key={i}
          className={\`absolute \${item.color} opacity-20\`}
          style={{ left: item.left, top: item.top }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          <item.Icon size={48} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

// ------------------------------------------
// 主页面
// ------------------------------------------
export default function GeneratedApp() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const features = [
    { 
      title: "智能生成", 
      desc: "自然语言转 UI", 
      icon: Sparkles, 
      color: "text-purple-600", 
      bg: "bg-purple-100" 
    },
    { 
      title: "优雅代码", 
      desc: "生产级 React 组件", 
      icon: Code2, 
      color: "text-blue-600", 
      bg: "bg-blue-100" 
    },
    { 
      title: "即时预览", 
      desc: "毫秒级实时渲染", 
      icon: Zap, 
      color: "text-amber-600", 
      bg: "bg-amber-100" 
    }
  ];

  const suggestions = [
    "设计一个 SaaS 仪表盘，包含数据概览和侧边栏",
    "创建一个个人博客主页，极简风格",
    "制作一个电商产品详情页，包含图片轮播",
    "构建一个待办事项看板，支持拖拽"
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex items-center justify-center relative font-sans text-slate-900 overflow-hidden p-6">
      <style>{\`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      \`}</style>
      <AnimatedBackground />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 relative z-10 items-center">
        
        {/* 左侧：文案与引导 */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>AI 引擎就绪</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
              构建未来，<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                只需一句话
              </span>
            </h1>
            
            <p className="text-xl text-slate-500 leading-relaxed max-w-xl">
              告别繁琐的样板代码。描述你的想法，AI 将为你生成包含完整设计、逻辑和交互的 React 应用。
            </p>
          </div>

          {/* 推荐指令区 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>尝试输入</span>
            </div>
            <div className="flex flex-col gap-3">
              {suggestions.map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  onClick={() => handleCopy(text, i)}
                >
                  <div className="group flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10 w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                      {copiedIndex === i ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Command className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
                      )}
                    </div>
                    
                    <span className="relative z-10 text-sm group-hover:text-slate-900">{text}</span>
                    
                    <div className="relative z-10 ml-auto transition-all duration-300">
                      {copiedIndex === i ? (
                        <span className="text-xs text-green-600 font-medium px-2 py-1 rounded-full bg-green-50">已复制</span>
                      ) : (
                        <span className="text-xs text-purple-600 font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all inline-block">点击复制</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 右侧：视觉展示 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl" />
          
          <div className="grid gap-5 relative">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                onHoverStart={() => setActiveCard(i)}
                onHoverEnd={() => setActiveCard(null)}
                style={{ 
                  zIndex: activeCard === i ? 20 : 10 - i,
                }}
                className="relative"
              >
                <SpotlightCard className={cn(
                  "p-6 transition-all duration-500 ease-out",
                  activeCard !== null && activeCard !== i ? "scale-95 opacity-60 blur-[1px]" : "hover:scale-105 hover:shadow-xl"
                )}>
                  <div className="flex items-start gap-5">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", feature.bg)}>
                      <feature.icon className={cn("w-7 h-7", feature.color)} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                      <p className="text-slate-500">{feature.desc}</p>
                    </div>
                    <div className="ml-auto self-center w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}

            {/* 底部代码装饰 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-12 -right-8 bg-slate-900 rounded-xl p-4 shadow-2xl border border-slate-800 w-64 rotate-[-5deg] z-30 hidden xl:block"
            >
              <div className="flex gap-1.5 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <div className="space-y-1.5">
                <div className="h-2 w-3/4 bg-slate-700 rounded opacity-50" />
                <div className="h-2 w-1/2 bg-slate-700 rounded opacity-50" />
                <div className="h-2 w-full bg-purple-500/50 rounded" />
                <div className="h-2 w-5/6 bg-slate-700 rounded opacity-50" />
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
`;

