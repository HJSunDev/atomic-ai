/**
 * HTML 单文件模板系统
 * 
 * 设计理念：
 * 1. 单文件：所有内容（HTML/CSS/JS）在一个文件中，双击即可运行
 * 2. 现代化：使用 ES6+、Flexbox/Grid、CSS Variables
 * 3. 零依赖：不依赖任何外部库，纯原生实现
 * 4. 响应式：移动优先设计，自适应各种屏幕
 * 5. 主题支持：自动适配明暗模式
 */

/**
 * HTML 模式的空白模板
 * 用户创建新 HTML 项目时的默认页面
 */
export const HTML_EMPTY_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI 生成应用</title>
  <style>
    /* 1. 响应式字体缩放 (关键还原点) */
    html { 
      font-size: 14px; 
    }
    @media screen and (min-width: 375px) {
      html { font-size: clamp(14px, calc(16 * (100vw / 1440)), 18px); }
    }

    /* 2. 变量定义 (对应 Tailwind Slate) */
    :root {
      --bg-color: #FAFAFA; /* bg-[#FAFAFA] */
      --text-primary: #0f172a; /* slate-900 */
      --text-secondary: #64748b; /* slate-500 */
      --text-muted: #94a3b8; /* slate-400 */
      --card-bg: #ffffff;
      --border-color: #f1f5f9; /* slate-100 */
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --blue-400: #60a5fa;
      --amber-50: #fffbeb;
      --amber-500: #f59e0b;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem; /* p-6 */
      overflow-x: hidden;
    }

    /* Background effects */
    .bg-noise {
      position: fixed;
      inset: 0;
      background-image: url('https://grainy-gradients.vercel.app/noise.svg');
      opacity: 0.2;
      filter: brightness(100%) contrast(150%);
      mix-blend-mode: multiply;
      pointer-events: none;
      z-index: 0;
    }
    
    .bg-grid {
      position: fixed;
      inset: 0;
      background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
      background-size: 4rem 4rem;
      mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%);
      -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%);
      pointer-events: none;
      z-index: 0;
    }

    /* Layout */
    .container {
      width: 100%;
      max-width: 72rem; /* max-w-6xl */
      position: relative;
      z-index: 10;
    }

    .bento-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem; /* gap-6 */
      height: 100%;
    }

    @media (min-width: 1024px) {
      .bento-grid {
        grid-template-columns: repeat(12, 1fr);
      }
      .col-span-8 { grid-column: span 8; }
      .col-span-4 { grid-column: span 4; }
      .col-span-12 { grid-column: span 12; }
    }

    /* Components */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 1.5rem; /* rounded-3xl */
      padding: 2rem; /* p-8 */
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
      transition: box-shadow 0.5s ease;
      position: relative;
      overflow: hidden;
      animation: fadeUp 0.5s ease-out backwards;
    }

    .card:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }

    /* Hero Card Specifics */
    .card-hero {
      background: linear-gradient(to bottom right, #ffffff, rgba(248, 250, 252, 0.5));
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 320px;
    }
    @media (min-width: 1024px) {
      .card-hero { min-height: 400px; }
    }

    /* Dark Card Specifics */
    .card-dark {
      background: var(--slate-900);
      color: white;
      border-color: var(--slate-800);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      background: var(--slate-900);
      color: white;
      border-radius: 9999px; /* rounded-full */
      font-size: 0.75rem; /* text-xs */
      font-weight: 700; /* font-bold */
      text-transform: uppercase;
      letter-spacing: 0.025em; /* tracking-wide */
      margin-bottom: 1.5rem;
    }

    .title {
      font-size: clamp(3rem, 6vw, 3.75rem); /* text-5xl sm:text-6xl */
      font-weight: 700;
      letter-spacing: -0.05em; /* tracking-tighter */
      color: var(--text-primary);
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }

    .hero-desc {
      font-size: 1.125rem; /* text-lg */
      color: var(--text-secondary);
      line-height: 1.625; /* leading-relaxed */
      font-weight: 500;
      max-width: 28rem; /* max-w-md */
    }

    .icon-box {
      width: 3rem; /* w-12 */
      height: 3rem; /* h-12 */
      border-radius: 1rem; /* rounded-2xl */
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .suggestions-header {
      display: flex; 
      flex-direction: column; 
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    @media (min-width: 768px) {
      .suggestions-wrapper {
        display: flex;
        align-items: center;
        gap: 2rem;
      }
      .suggestions-header {
        width: 16rem; /* w-64 */
        flex-shrink: 0;
        margin-bottom: 0;
      }
    }

    .suggestions-grid {
      flex: 1;
      display: grid;
      gap: 1rem;
      min-width: 0; /* 关键修复：允许 grid item 收缩，防止 overflow */
    }
    @media (min-width: 640px) {
      .suggestions-grid { grid-template-columns: repeat(2, 1fr); }
    }

    /* Suggestion Chips */
    .chip {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 1rem; /* p-4 */
      background: rgba(248, 250, 252, 0.5); /* bg-slate-50/50 */
      border: 1px solid var(--slate-100);
      border-radius: 0.75rem; /* rounded-xl */
      color: #334155; /* text-slate-600 */
      font-size: 0.875rem; /* text-sm */
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      font-family: inherit;
      min-width: 0; /* 关键修复：允许 flex item 收缩 */
    }

    .chip:hover {
      background: rgba(241, 245, 249, 1);
      border-color: #cbd5e1; /* hover:border-slate-300 */
      transform: scale(1.02);
    }

    .chip.copied {
      background: var(--slate-900);
      border-color: var(--slate-900);
      color: var(--slate-50);
    }

    .chip-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 1rem;
      color: #334155; /* text-slate-700 */
      flex: 1; /* 关键修复：占据剩余空间 */
      min-width: 0; /* 关键修复：允许文本截断生效 */
    }
    .chip.copied .chip-text { color: var(--slate-50); }

    .copy-icon-wrapper {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      opacity: 0;
      transition: all 0.2s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      flex-shrink: 0; /* 关键修复：防止图标被挤压 */
    }
    
    .chip:hover .copy-icon-wrapper { opacity: 1; }
    
    .chip.copied .copy-icon-wrapper { 
      background: var(--slate-800); 
      color: var(--slate-50); 
      opacity: 1; 
    }

    /* Icons */
    svg { width: 1.5em; height: 1.5em; stroke-width: 2; stroke: currentColor; fill: none; stroke-linecap: round; stroke-linejoin: round; }

    /* Animation */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

  </style>
</head>
<body>
  <div class="bg-noise"></div>
  <div class="bg-grid"></div>

  <div class="container">
    <div class="bento-grid">
      
      <!-- 1. Hero Card (Title) -->
      <div class="card card-hero col-span-8">
        <div style="position: relative; z-index: 10;">
          <div class="badge">
            <svg viewBox="0 0 24 24" style="width: 0.75rem; height: 0.75rem; color: #fde047; margin-right: 4px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 5h4"/><path d="M3 9h4"/></svg>
            <span>AI Native</span>
          </div>
          <h1 class="title">
            Design at the <br/>
            <span style="color: var(--text-muted);">speed of thought.</span>
          </h1>
          <p class="hero-desc">
            描述你的创意，剩下的交给我们。<br/>
            从概念到产品，只需一瞬。
          </p>
        </div>
        
        <!-- 装饰性圆圈 (修正版) -->
        <div style="position: absolute; right: 0; bottom: 0; opacity: 0.1; pointer-events: none; line-height: 0;">
           <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: auto; height: auto;">
            <circle cx="300" cy="300" r="150" stroke="currentColor" stroke-width="40" />
            <circle cx="300" cy="300" r="100" stroke="currentColor" stroke-width="40" opacity="0.5"/>
          </svg>
        </div>
      </div>

      <!-- 2. Feature Column -->
      <div class="col-span-4" style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Clean Code Card -->
        <div class="card card-dark" style="flex: 1; display: flex; flex-direction: column; justify-content: center; animation-delay: 0.1s;">
          <div class="icon-box" style="background: var(--slate-800);">
            <svg viewBox="0 0 24 24" style="color: var(--blue-400); width: 1.5rem; height: 1.5rem;"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">Clean Code</h3>
            <p style="color: var(--text-muted); font-size: 0.875rem;">Native HTML + CSS + JS</p>
          </div>
        </div>

        <!-- Instant UI Card -->
        <div class="card" style="flex: 1; display: flex; flex-direction: column; justify-content: center; animation-delay: 0.2s;">
          <div class="icon-box" style="background: var(--amber-50);">
            <svg viewBox="0 0 24 24" style="color: var(--amber-500); fill: currentColor; width: 1.5rem; height: 1.5rem;"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14H4Z"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">Instant UI</h3>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">毫秒级实时预览渲染</p>
          </div>
        </div>
      </div>

      <!-- 3. Suggestions Area -->
      <div class="card col-span-12" style="animation-delay: 0.3s;">
        <div class="suggestions-wrapper">
          <!-- Left Info -->
          <div class="suggestions-header">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted);">
              <svg viewBox="0 0 24 24" style="width: 1.25rem; height: 1.25rem;"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
              <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Start Here</span>
            </div>
            <h3 style="font-size: 1.5rem; font-weight: 700;">尝试一下</h3>
          </div>

          <!-- Right Grid -->
          <div class="suggestions-grid">
             <button class="chip" onclick="copyText(this, '设计一个响应式着陆页，包含 Hero 区域和特性列表')">
               <span class="chip-text">设计一个响应式着陆页，包含 Hero 区域和特性列表</span>
               <div class="copy-icon-wrapper"><svg viewBox="0 0 24 24" width="12" height="12" style="width: 12px; height: 12px;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></div>
             </button>
             <button class="chip" onclick="copyText(this, '制作一个个人简历页面，包含经历时间轴和技能展示')">
               <span class="chip-text">制作一个个人简历页面，包含经历时间轴和技能展示</span>
               <div class="copy-icon-wrapper"><svg viewBox="0 0 24 24" width="12" height="12" style="width: 12px; height: 12px;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></div>
             </button>
             <button class="chip" onclick="copyText(this, '构建一个计算器应用，支持基本运算和历史记录')">
               <span class="chip-text">构建一个计算器应用，支持基本运算和历史记录</span>
               <div class="copy-icon-wrapper"><svg viewBox="0 0 24 24" width="12" height="12" style="width: 12px; height: 12px;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></div>
             </button>
             <button class="chip" onclick="copyText(this, '创建一个图片画廊，支持网格布局和点击查看大图')">
               <span class="chip-text">创建一个图片画廊，支持网格布局和点击查看大图</span>
               <div class="copy-icon-wrapper"><svg viewBox="0 0 24 24" width="12" height="12" style="width: 12px; height: 12px;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></div>
             </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <script>
    function copyText(btn, text) {
      navigator.clipboard.writeText(text).then(() => {
        // 添加 copied 类
        btn.classList.add('copied');
        
        const iconWrapper = btn.querySelector('.copy-icon-wrapper');
        const originalIcon = iconWrapper.innerHTML;
        
        // 切换图标为对号
        iconWrapper.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" style="width: 12px; height: 12px; stroke-width: 3;"><polyline points="20 6 9 17 4 12"/></svg>';
        
        setTimeout(() => {
          btn.classList.remove('copied');
          iconWrapper.innerHTML = originalIcon;
        }, 2000);
      });
    }
  </script>
</body>
</html>`;

/**
 * HTML 模式的完整模板框架
 * 包含基础设施代码，AI 只需填充内容部分
 */
export const HTML_TEMPLATE_FRAMEWORK = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{DESCRIPTION}}">
  <title>{{TITLE}}</title>
  
  <style>
    /* ==================== 基础重置 ==================== */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* ==================== CSS 变量（设计系统） ==================== */
    :root {
      /* 颜色系统 */
      --color-primary: #3b82f6;
      --color-primary-dark: #2563eb;
      --color-primary-light: #60a5fa;
      --color-secondary: #8b5cf6;
      --color-success: #10b981;
      --color-warning: #f59e0b;
      --color-danger: #ef4444;
      
      /* 中性色 */
      --color-background: #ffffff;
      --color-surface: #f9fafb;
      --color-border: #e5e7eb;
      --color-text: #1f2937;
      --color-text-muted: #6b7280;
      
      /* 间距 */
      --spacing-xs: 0.25rem;
      --spacing-sm: 0.5rem;
      --spacing-md: 1rem;
      --spacing-lg: 1.5rem;
      --spacing-xl: 2rem;
      --spacing-2xl: 3rem;
      
      /* 圆角 */
      --radius-sm: 0.25rem;
      --radius-md: 0.5rem;
      --radius-lg: 0.75rem;
      --radius-xl: 1rem;
      --radius-full: 9999px;
      
      /* 阴影 */
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
      --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
      
      /* 过渡 */
      --transition-fast: 150ms ease-in-out;
      --transition-base: 200ms ease-in-out;
      --transition-slow: 300ms ease-in-out;
    }

    /* 暗色模式 */
    @media (prefers-color-scheme: dark) {
      :root {
        --color-background: #0f172a;
        --color-surface: #1e293b;
        --color-border: #334155;
        --color-text: #f1f5f9;
        --color-text-muted: #94a3b8;
      }
    }

    /* ==================== 基础样式 ==================== */
    html {
      font-size: 16px;
      scroll-behavior: smooth;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--color-background);
      color: var(--color-text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ==================== 工具类 ==================== */
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-md);
    }

    .section {
      padding: var(--spacing-2xl) 0;
    }

    /* 按钮 */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--spacing-lg);
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-base);
      text-decoration: none;
      user-select: none;
    }

    .btn:hover {
      background: var(--color-primary-dark);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .btn-secondary:hover {
      background: var(--color-border);
      border-color: var(--color-text-muted);
    }

    /* 卡片 */
    .card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      transition: box-shadow var(--transition-base);
    }

    .card:hover {
      box-shadow: var(--shadow-md);
    }

    /* 输入框 */
    .input {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 1rem;
      color: var(--color-text);
      transition: border-color var(--transition-fast);
    }

    .input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* 网格布局 */
    .grid {
      display: grid;
      gap: var(--spacing-lg);
    }

    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }

    @media (max-width: 768px) {
      .grid-2, .grid-3, .grid-4 {
        grid-template-columns: 1fr;
      }
    }

    /* Flex 布局 */
    .flex {
      display: flex;
      gap: var(--spacing-md);
    }

    .flex-center {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .flex-between {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* 文本工具类 */
    .text-center { text-align: center; }
    .text-muted { color: var(--color-text-muted); }
    .font-bold { font-weight: 700; }
    
    /* AI 生成的自定义样式 */
    {{GENERATED_STYLES}}
  </style>
</head>
<body>
  <!-- AI 生成的 HTML 内容 -->
  {{GENERATED_HTML}}

  <script>
    // ==================== 工具函数库 ====================
    const $ = {
      // DOM 选择器
      get: (selector) => document.querySelector(selector),
      getAll: (selector) => document.querySelectorAll(selector),
      
      // 事件监听
      on: (element, event, handler) => {
        if (typeof element === 'string') {
          element = document.querySelector(element);
        }
        element?.addEventListener(event, handler);
      },
      
      // 创建元素
      create: (tag, props = {}, children = []) => {
        const el = document.createElement(tag);
        Object.entries(props).forEach(([key, value]) => {
          if (key === 'className') el.className = value;
          else if (key === 'textContent') el.textContent = value;
          else el.setAttribute(key, value);
        });
        children.forEach(child => {
          if (typeof child === 'string') el.appendChild(document.createTextNode(child));
          else el.appendChild(child);
        });
        return el;
      },
      
      // 简单的状态管理
      state: new Proxy({}, {
        set(target, key, value) {
          const oldValue = target[key];
          target[key] = value;
          window.dispatchEvent(new CustomEvent('stateChange', {
            detail: { key, value, oldValue }
          }));
          return true;
        }
      }),
      
      // HTTP 请求
      async fetch(url, options = {}) {
        try {
          const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
          });
          if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
          return await response.json();
        } catch (error) {
          console.error('Fetch error:', error);
          throw error;
        }
      },
      
      // 本地存储
      storage: {
        get: (key) => {
          try {
            return JSON.parse(localStorage.getItem(key));
          } catch {
            return localStorage.getItem(key);
          }
        },
        set: (key, value) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        },
        remove: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
      }
    };

    // ==================== AI 生成的 JavaScript 代码 ====================
    {{GENERATED_SCRIPT}}
  </script>
</body>
</html>`;

/**
 * HTML AI 生成提示词
 */
export const HTML_GENERATION_PROMPT = `你是一个专业的 Web 开发专家，专门创建现代化、响应式的单页面 HTML 应用。

## 核心要求

### 1. 输出格式
- 必须输出完整的 HTML 文档（从 <!DOCTYPE html> 到 </html>）
- 所有代码必须在一个文件内，不能引用外部文件
- 直接输出代码，不要有任何解释文字或 markdown 标记

### 2. 结构规范
- 使用语义化 HTML5 标签（header, nav, main, section, article, footer 等）
- 必须包含必要的 meta 标签（charset, viewport）
- 标题和描述要准确反映页面内容

### 3. 样式规范
- 所有样式必须写在 <style> 标签内
- 使用 CSS Variables（已提供设计系统变量）
- 采用移动优先的响应式设计（mobile-first）
- 使用现代布局技术（Flexbox, Grid）
- 添加适当的过渡动画和悬停效果
- 支持暗色模式（使用 prefers-color-scheme）

### 4. JavaScript 规范
- 所有脚本必须写在 <script> 标签内
- 使用现代 ES6+ 语法
- 可以使用已提供的 $ 工具函数库
- 添加必要的交互功能
- 确保代码简洁、高效

### 5. 设计原则
- 简洁现代的 UI 风格
- 良好的视觉层次
- 合理的留白和间距
- 清晰的文字排版
- 流畅的交互体验

## 可用资源

### CSS 变量（已在模板中定义）
- 颜色：--color-primary, --color-secondary, --color-success 等
- 间距：--spacing-xs 到 --spacing-2xl
- 圆角：--radius-sm 到 --radius-full
- 阴影：--shadow-sm 到 --shadow-xl
- 过渡：--transition-fast, --transition-base, --transition-slow

### 工具类（已在模板中定义）
- 布局：.container, .section, .grid, .flex
- 组件：.btn, .card, .input
- 文本：.text-center, .text-muted, .font-bold

### JavaScript 工具（已在模板中定义）
- $.get(selector) - 选择元素
- $.on(element, event, handler) - 事件监听
- $.create(tag, props, children) - 创建元素
- $.state - 简单状态管理
- $.fetch(url, options) - HTTP 请求
- $.storage - 本地存储

## 禁止事项
❌ 不要使用任何外部 CDN 或库
❌ 不要使用 <link> 引入外部 CSS
❌ 不要使用 <script src> 引入外部 JS
❌ 不要使用外部图片（可用 SVG、emoji、CSS 渐变代替）
❌ 不要添加注释或解释文字

## 示例输出格式
直接输出完整的 HTML 代码：
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
  <style>
    /* 自定义样式 */
  </style>
</head>
<body>
  <!-- HTML 内容 -->
  <script>
    // JavaScript 代码
  </script>
</body>
</html>

现在，根据用户的需求生成对应的 HTML 页面。`;


/**
 * HTML AI 生成提示词（增强版 - 包含环境上下文）
 * 适用于需要调用 Tailwind/React 等高级能力的场景
 */
export const HTML_GENERATION_PROMPT_ADVANCED = `You are an expert Frontend Developer tasked with generating a high-quality, self-contained HTML micro-application.

### 1. The Environment (Strict Constraints)
You are running inside a pre-configured HTML shell.
- **DO NOT** output <html>, <head>, or <body> tags.
- **DO NOT** load external scripts via URL unless absolutely necessary. Use the provided Import Map.
- **DO NOT** use alert(), confirm(), or prompt(). Use custom UI instead.

### 2. Available Tools (Already Loaded)
- **Tailwind CSS**: Available globally. Use for all styling.
- **Flowbite**: Available globally. Use for interactive UI (modals, tooltips, navbars) via data attributes (e.g., data-dropdown-toggle).
- **Phosphor Icons**: Use <i class="ph ph-house"></i>. Do NOT use FontAwesome.
- **AOS Animation**: Add data-aos="fade-up" to elements for simple entrance animations.

### 3. Import Map (For React & Logic)
You have an ES Module Import Map set up. You can import these libraries directly by name:
- react, react-dom/client
- framer-motion (for complex React animations)
- canvas-confetti (for celebration effects)
- chart.js/auto (for charts)
- three (for 3D scenes)
- lucide-react (React icons)

### 4. Implementation Strategy
Choose the best approach based on the user's request:

**Option A: Vanilla JS (Preferred for static/simple interactive apps)**
- Use document.querySelector and addEventListener.
- Wrap your script in <script> tags.
- Use data-aos for animations.

**Option B: React (Preferred for complex state/calculators/games)**
- Structure:
  \`\`\`html
  <div id="root"></div>
  <script type="module">
    import React, { useState, useEffect } from 'react';
    import { createRoot } from 'react-dom/client';
    import confetti from 'canvas-confetti';

    function App() {
      return <div className="p-4 bg-white rounded-xl shadow-lg">Hello React</div>;
    }

    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
  </script>
  \`\`\`

### 5. Design System Rules
- **Modern UI**: Use rounded corners (rounded-xl), soft shadows (shadow-lg), and ample padding (p-6).
- **Colors**: Use the primary color scale (e.g., bg-primary-600, text-primary-500) to match the brand.
- **Typography**: Use prose prose-slate wrapper for long text content.

### 6. Output Format
- Return **ONLY** the raw HTML content (divs, styles, scripts) to be injected into the body.
- **DO NOT** wrap the output in markdown code blocks (like \`\`\`html).
- Ensure all JavaScript is properly enclosed in <script> tags.
- Handle potential errors in your code using try-catch blocks to prevent crashing the app.
`;

interface TemplateOptions {
  title?: string;
  code: string; // AI 返回的内容
  theme?: 'light' | 'dark';
}

/**
 * 生成包含现代化技术栈（Tailwind, React, Framer Motion 等）的微应用 HTML
 * 
 * @description
 * 这个函数将 AI 生成的代码片段（通常是 HTML/CSS/JS）包装成一个完整的、
 * 预配置了现代前端基础设施的 HTML 文档。这使得 AI 生成的代码可以立即拥有
 * 只有在复杂构建环境中才有的能力。
 */
export const generateMicroAppHtml = ({ title = "AI Micro App", code, theme = "light" }: TemplateOptions) => {
  // 1. 安全清洗：移除可能存在的 Markdown 代码块标记
  const cleanCode = code.replace(/```html/g, '').replace(/```/g, '').trim();

  return `
<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- === 1. 字体系统 === -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- === 2. 核心样式: Tailwind CSS v3.4 + Typography === -->
  <script src="https://cdn.tailwindcss.com?plugins=typography,forms"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
          colors: {
            primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a"}
          }
        }
      }
    }
  </script>

  <!-- === 3. Import Maps (按需加载的神器) === -->
  <!-- 只有当 AI 写了 import ... from 'react' 时，浏览器才会下载这些库 -->
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.2.0",
      "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
      "framer-motion": "https://esm.sh/framer-motion@10.16.4",
      "canvas-confetti": "https://esm.sh/canvas-confetti@1.6.0",
      "chart.js/auto": "https://esm.sh/chart.js@4.4.0/auto",
      "three": "https://esm.sh/three@0.160.0",
      "lucide-react": "https://esm.sh/lucide-react@0.294.0"
    }
  }
  </script>

  <!-- === 4. 全局工具库 (总是可用) === -->
  <!-- 图标库: Phosphor Icons -->
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <!-- 动画库: AOS -->
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <!-- UI组件库: Flowbite -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />

  <style>
    body { font-family: 'Inter', sans-serif; }
    /* 滚动条美化 */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .dark ::-webkit-scrollbar-thumb { background: #4b5563; }
    
    /* Loading 遮罩 */
    #global-loader {
      position: fixed; inset: 0; z-index: 9999;
      background: ${theme === 'dark' ? '#111827' : '#ffffff'};
      display: flex; justify-content: center; align-items: center;
      transition: opacity 0.5s ease;
    }
    .loader-spin {
      width: 40px; height: 40px; border: 3px solid rgba(59,130,246,0.3);
      border-radius: 50%; border-top-color: #3b82f6;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>

  <!-- 错误捕获 (防止白屏) -->
  <script>
    window.onerror = function(msg, url, line, col, error) {
      const errBox = document.getElementById('error-box');
      if(errBox) {
        errBox.style.display = 'block';
        errBox.textContent = 'Runtime Error: ' + msg;
      }
      // 移除 loading 以便用户看到错误
      const loader = document.getElementById('global-loader');
      if(loader) loader.style.display = 'none';
      return false;
    };
  </script>
</head>
<body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen relative">
  <!-- Loading -->
  <div id="global-loader"><div class="loader-spin"></div></div>

  <!-- 错误提示框 (默认隐藏) -->
  <div id="error-box" class="hidden fixed bottom-4 right-4 max-w-sm bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 text-sm font-mono shadow-lg"></div>

  <!-- === AI 内容注入区 === -->
  <div id="app-root" class="opacity-0 transition-opacity duration-700 p-4 md:p-6 lg:p-8">
    ${cleanCode}
  </div>

  <!-- === 底部依赖 === -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

  <!-- 初始化脚本 -->
  <script>
    window.addEventListener('load', () => {
      // 1. 移除 Loading
      const loader = document.getElementById('global-loader');
      const root = document.getElementById('app-root');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
      if (root) root.classList.remove('opacity-0');

      // 2. 初始化 AOS
      AOS.init({ duration: 800, once: true });
    });
  </script>
</body>
</html>
  `;
};
