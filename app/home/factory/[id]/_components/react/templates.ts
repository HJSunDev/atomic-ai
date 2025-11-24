/**
 * Shell & Slot 模式的静态模板系统
 * 
 * 设计理念：
 * 1. Shell (壳层)：由我们预先定义的稳定基础设施，AI 不会触碰
 * 2. Slot (插槽)：AI 只需要生成 GeneratedApp.tsx 这一个文件
 * 3. 预置依赖：常用组件和工具库已经准备好，AI 直接引用即可
 */

// ==================== 0. 默认依赖 ====================

export const DEFAULT_DEPENDENCIES = {
  "lucide-react": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "date-fns": "latest",
  "recharts": "latest",
  "framer-motion": "latest",
};

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
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code2, Zap, ArrowRight, Check, Terminal, Copy, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

// ------------------------------------------
// 设计系统组件 - Bento Grid 风格
// ------------------------------------------

function BentoCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-500",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

function PromptChip({ text, index, onCopy, copiedIndex }: { text: string; index: number; onCopy: (t: string, i: number) => void; copiedIndex: number | null }) {
  const isCopied = copiedIndex === index;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: "rgba(241, 245, 249, 1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onCopy(text, index)}
      className={cn(
        "group flex items-center justify-between w-full p-4 text-left rounded-xl border transition-all duration-200",
        isCopied 
          ? "bg-slate-900 border-slate-900 text-slate-50" 
          : "bg-slate-50/50 border-slate-100 text-slate-600 hover:border-slate-300"
      )}
    >
      <span className={cn("text-sm font-medium truncate pr-4", "text-slate-700")}>
        {text}
      </span>
      <div className={cn(
        "flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200",
        isCopied ? "bg-slate-800 text-slate-50" : "bg-white text-slate-400 opacity-0 group-hover:opacity-100 shadow-sm"
      )}>
        {isCopied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
      </div>
    </motion.button>
  );
}

// ------------------------------------------
// 主页面
// ------------------------------------------
export default function GeneratedApp() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    try {
      // 尝试使用现代 Clipboard API
      navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }).catch(() => {
        // 降级方案：使用传统的 execCommand
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        
        document.body.removeChild(textArea);
      });
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const suggestions = [
    "设计一个 SaaS 仪表盘，包含数据概览和侧边栏",
    "创建一个个人博客主页，极简风格",
    "制作一个电商产品详情页，包含图片轮播",
    "构建一个待办事项看板，支持拖拽"
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex items-center justify-center p-6 font-sans text-slate-900 relative overflow-hidden">
      {/* 响应式设置 */}
      <style>{\`
        html { font-size: 14px; }
        @media screen and (min-width: 375px) {
          html { font-size: clamp(14px, calc(16 * (100vw / 1440)), 18px); }
        }
      \`}</style>

      {/* 极简背景纹理 - 噪点 + 细微网格 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* 区域 1: 核心标题 (占 8 列) */}
          <BentoCard className="lg:col-span-8 flex flex-col justify-between min-h-[320px] lg:min-h-[400px] bg-gradient-to-br from-white to-slate-50/50">
            <div className="space-y-6 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>AI Native</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-slate-900 leading-[1.1]">
                Design at the <br/>
                <span className="text-slate-400">speed of thought.</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md font-medium">
                描述你的创意，剩下的交给我们。<br/>
                从概念到产品，只需一瞬。
              </p>
            </div>
            
            {/* 装饰性图形 - 抽象的构建过程 */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
               <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="300" cy="300" r="150" stroke="currentColor" strokeWidth="40" />
                <circle cx="300" cy="300" r="100" stroke="currentColor" strokeWidth="40" opacity="0.5"/>
              </svg>
            </div>
          </BentoCard>

          {/* 区域 2: 特性展示 (占 4 列，垂直排列) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <BentoCard delay={0.1} className="flex-1 flex flex-col justify-center items-start space-y-4 bg-slate-900 text-white border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-2">
                <Code2 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Clean Code</h3>
                <p className="text-slate-400 text-sm mt-1">Tailwind + Motion + React</p>
              </div>
            </BentoCard>

            <BentoCard delay={0.2} className="flex-1 flex flex-col justify-center items-start space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-amber-500" fill="currentColor" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Instant UI</h3>
                <p className="text-slate-500 text-sm mt-1">毫秒级实时预览渲染</p>
              </div>
            </BentoCard>
          </div>

          {/* 区域 3: 指令交互区 (占 12 列) */}
          <BentoCard delay={0.3} className="lg:col-span-12 bg-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="shrink-0 space-y-2 md:w-64">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Start Here</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">尝试一下</h3>
              </div>

              <div className="flex-1 w-full grid sm:grid-cols-2 gap-4">
                {suggestions.map((text, i) => (
                  <PromptChip 
                    key={i} 
                    text={text} 
                    index={i} 
                    onCopy={handleCopy} 
                    copiedIndex={copiedIndex} 
                  />
                ))}
              </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </div>
  );
}
`;
