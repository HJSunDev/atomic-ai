import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

/**
 * HTML 模式的 AI 生成系统提示词（增强版）
 * 
 * 设计理念：
 * 1. 生成自包含的 HTML 文件，可直接在浏览器中运行
 * 2. 使用现代化技术栈（Tailwind, React, Framer Motion 等）
 * 3. 输出格式包含分隔符，便于提取纯净代码
 */
export const HTML_GENERATION_SYSTEM_PROMPT = `You are an expert Frontend Developer tasked with generating a high-quality, self-contained HTML micro-application.

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

### 7. Images (Hybrid Strategy)
Choose the best image source based on the context:

**Option A: Semantic Images (Preferred for design/beauty)**
Use LoremFlickr when you need a specific real-world photo (e.g., "city", "food", "tech").
Format: \`https://loremflickr.com/{width}/{height}/{keyword}\`
- **keyword**: Simple English keyword (e.g., "cat", "sunset").

**Option B: Placeholder Images (Use for wireframes/layouts)**
Use Placehold.co when you just need a box with text (e.g., "Ad Space", "Logo").
Format: \`https://placehold.co/{width}x{height}?text={text}\`
- **text**: URL-encoded text (e.g., "Product+A").

**Example:**
Design: <img src="https://loremflickr.com/800/400/nature" alt="Banner">
Wireframe: <img src="https://placehold.co/300x200?text=Ad+Space" alt="Ad">

### 8. Response Structure & Separation (CRITICAL)
To enable the system to separate your conversational response from the executable code, you MUST follow this exact format:

1.  **Conversational Text (IN CHINESE)**: Start with a brief, friendly message explaining what you created or how to use it.
    - **You MUST use Chinese for this part.**
    - **DO NOT** mention technical details like Tailwind, Flowbite, AOS, Import Maps, or LoremFlickr. These are internal details.
    - **Focus ONLY on features**: Tell the user what the app does (e.g., "这是一个为您生成的简历页面，包含联系表单和项目展示...").
2.  **The Separator**: Output the exact delimiter string: \`:::artifact:::\`
3.  **The Code**: Output the raw HTML/JS code.
    - **DO NOT** wrap the code in markdown blocks (like \`\`\`html).
    - Ensure all JavaScript is properly enclosed in <script> tags.
    - Handle potential errors using try-catch blocks.
4.  **The Separator**: End with the exact delimiter string: \`:::artifact:::\`

**Example Output:**
这是一个为您生成的房贷计算器。我使用了 React 来管理状态，并用 Chart.js 实现了可视化效果。
:::artifact:::
<div class="p-4 bg-white">...</div>
<script type="module">...</script>
:::artifact:::`;

/**
 * React 模式的 AI 生成系统提示词（预留）
 */
export const REACT_GENERATION_SYSTEM_PROMPT = `You are an expert React Developer...
(此处为预留，React 模式的完整提示词待后续补充)`;

/**
 * 代码分隔符
 */
const ARTIFACT_DELIMITER = ":::artifact:::";

/**
 * 从 AI 响应中提取纯净代码
 * 
 * AI 的响应格式：
 * ```
 * 这是一个说明文字...
 * :::artifact:::
 * <div>实际代码</div>
 * :::artifact:::
 * ```
 * 
 * @param rawResponse AI 的完整响应文本
 * @returns 提取出的纯净代码，如果没有找到分隔符则返回原始响应
 */
export function extractCodeFromResponse(rawResponse: string): string {
  const parts = rawResponse.split(ARTIFACT_DELIMITER);
  
  if (parts.length >= 3) {
    // 标准格式：[说明文字, 代码, 空字符串或其他]
    return parts[1].trim();
  } else if (parts.length === 2) {
    // 只有一个分隔符的情况（可能 AI 忘记闭合）
    return parts[1].trim();
  } else {
    // 没有分隔符，可能 AI 直接输出了代码
    // 尝试检测是否是纯 HTML/代码
    const trimmed = rawResponse.trim();
    if (trimmed.startsWith("<") || trimmed.startsWith("import ")) {
      return trimmed;
    }
    // 否则返回原始响应
    return rawResponse;
  }
}

/**
 * 从 AI 响应中提取说明文字（去除代码部分）
 * 
 * 用于存储到 app_messages 表，避免历史消息中包含大量代码导致 Token 膨胀
 * 
 * AI 的响应格式：
 * ```
 * 这是一个说明文字...
 * :::artifact:::
 * <div>实际代码</div>
 * :::artifact:::
 * ```
 * 
 * @param rawResponse AI 的完整响应文本
 * @returns 提取出的纯说明文字，如果没有找到分隔符则返回原始响应
 */
export function extractExplanationFromResponse(rawResponse: string): string {
  const parts = rawResponse.split(ARTIFACT_DELIMITER);
  
  if (parts.length >= 1 && parts[0].trim()) {
    // 返回第一个分隔符之前的内容（说明文字）
    return parts[0].trim();
  }
  
  // 如果没有分隔符，但内容看起来是纯代码，返回默认说明
  const trimmed = rawResponse.trim();
  if (trimmed.startsWith("<") || trimmed.startsWith("import ")) {
    return "已为您生成代码";
  }
  
  // 否则返回原始响应
  return rawResponse.trim();
}

/**
 * 流式更新 app_messages 消息内容
 * 
 * 类似于 chatUtils 的 runMutationWithRetry，但针对 factory 模块
 */
export async function updateAppMessageContent(
  ctx: ActionCtx,
  messageId: Id<"app_messages">,
  content: string
): Promise<void> {
  await ctx.runMutation(internal.factory.mutations.updateMessageContent, {
    messageId,
    content,
  });
}

/**
 * 创建代码版本快照
 * 
 * 在 AI 生成完成后，将代码保存为一个版本快照
 */
export async function createCodeVersion(
  ctx: ActionCtx,
  appId: Id<"apps">,
  messageId: Id<"app_messages">,
  code: string,
  version: number
): Promise<Id<"app_versions">> {
  return await ctx.runMutation(internal.factory.mutations.createAppVersion, {
    appId,
    messageId,
    code,
    version,
  });
}

/**
 * 更新应用的最新代码（冗余字段，用于快速加载）
 */
export async function updateAppLatestCode(
  ctx: ActionCtx,
  appId: Id<"apps">,
  latestCode: string,
  version: number
): Promise<void> {
  await ctx.runMutation(internal.factory.mutations.updateAppLatestCode, {
    appId,
    latestCode,
    version,
  });
}

/**
 * 获取应用的当前版本号
 */
export async function getAppCurrentVersion(
  ctx: ActionCtx,
  appId: Id<"apps">
): Promise<number> {
  const app = await ctx.runQuery(internal.factory.queries.getAppById, {
    appId,
  });
  return app?.v ?? 0;
}

/**
 * 标记消息流式传输完成
 */
export async function markMessageStreamingComplete(
  ctx: ActionCtx,
  messageId: Id<"app_messages">
): Promise<void> {
  await ctx.runMutation(internal.factory.mutations.updateMessageStreamingStatus, {
    messageId,
    isStreaming: false,
  });
}

/**
 * 处理 Factory 模块的流式响应并持久化
 * 
 * 这是核心的流式处理函数，负责：
 * 1. 接收 LangChain 的流式输出
 * 2. 实时更新到 app_messages 表
 * 3. 返回完整响应和 token 统计
 * 
 * @param ctx Action 上下文
 * @param chatModel LangChain 聊天模型
 * @param messages LangChain 消息数组
 * @param messageId 要更新的消息 ID
 * @returns 完整响应文本和 token 数量
 */
export async function handleFactoryStreamAndPersist(
  ctx: ActionCtx,
  chatModel: any,
  messages: any[],
  messageId: Id<"app_messages">
): Promise<{ fullResponse: string; tokenCount: number }> {
  let fullResponse = "";
  let tokenCount = 0;

  // 启动 LangChain 的流式输出；stream 是异步可迭代对象，可逐块消费模型生成内容
  const stream = await chatModel.stream(messages);

  let lastUpdateTime = 0;
  const MIN_UPDATE_INTERVAL = 200; // 最小内容更新间隔（毫秒），避免数据库写入过于频繁

  for await (const chunk of stream) {
    // LangChain chunk.content 通常为字符串
    const content = typeof chunk.content === "string" ? chunk.content : "";
    fullResponse += content;

    const now = Date.now();
    const shouldUpdate = now - lastUpdateTime >= MIN_UPDATE_INTERVAL;

    // 定期把累计输出同步到 app_messages，提升流式体验，避免频繁写入影响性能
    if (shouldUpdate) {
      await updateAppMessageContent(ctx, messageId, fullResponse);
      lastUpdateTime = now;
    }

    // 跟踪 token 消耗信息，出现在每个 chunk 的 usage_metadata
    if (chunk.usage_metadata) {
      tokenCount = chunk.usage_metadata.total_tokens || 0;
    }
  }

  // 流式结束时确保完整内容落库（防止最后一块数据遗漏）
  await updateAppMessageContent(ctx, messageId, fullResponse);

  // 返回完整结果及 token 统计，供后续展示与计费
  return { fullResponse, tokenCount };
}

