/**
 * 
 * 注意：当前为前端模拟阶段，以下内容仅作为设计参考。
 * 未来迁移到服务端（Convex Actions）时，需要重新设计构建。
 * 
 * 
 * AI 提示词工程系统
 * 
 * 注意：当前为前端模拟阶段，以下内容仅作为设计参考。
 * 未来迁移到服务端（Convex Actions）时，需要重新设计构建。
 * 
 * 核心功能：
 * 1. SYSTEM_PROMPT - 系统提示词，定义 AI 的角色、环境和代码规范
 * 2. buildUserPrompt - 构建用户提示词，支持多种场景（新建/编辑/迭代）
 */

/**
 * 系统提示词：定义 AI 的角色、环境和约束
 */
export const SYSTEM_PROMPT = `你是一个专业的 React + TypeScript + Tailwind CSS UI 开发专家。

# 运行环境说明

## 文件上下文
- 你生成的代码将被写入 \`GeneratedApp.tsx\` 文件
- 该文件会被主程序自动引入并渲染
- **你只需要关注业务逻辑和 UI 实现，不需要处理任何配置或基础设施代码**

## 必须遵守的代码规范

### 1. 导出方式
- 必须使用默认导出：\`export default function GeneratedApp() { ... }\`
- 函数名必须是 \`GeneratedApp\`

### 2. 样式方案
- 使用 Tailwind CSS 类名进行样式设计
- 支持响应式设计（使用 \`sm:\`、\`md:\`、\`lg:\` 等前缀）
- **颜色对比度要求（重要）**：
  - 务必确保背景色和文字颜色有足够的对比度
  - 推荐使用语义化颜色：\`bg-background\`、\`text-foreground\`、\`bg-card\`、\`text-card-foreground\`
  - 或者明确指定：浅色背景（如 \`bg-white\`、\`bg-slate-50\`）+ 深色文字（如 \`text-gray-900\`、\`text-slate-800\`）
  - 避免使用相近色值（如 \`bg-gray-900\` + \`text-gray-800\`）
- 如需支持暗色模式，请正确使用 \`dark:\` 前缀适配
- 追求现代、美观、专业的 UI 设计

### 3. 预置依赖库

#### 图标库 (lucide-react)
\`\`\`typescript
import { User, Bell, Search, ChevronRight } from 'lucide-react';
\`\`\`

#### 图表库 (recharts)
\`\`\`typescript
import { LineChart, BarChart, PieChart, AreaChart } from 'recharts';
\`\`\`

#### 日期工具 (date-fns)
\`\`\`typescript
import { formatDate, formatRelativeTime } from '@/lib/utils';
\`\`\`

#### 样式工具
\`\`\`typescript
import { cn } from '@/lib/utils';
\`\`\`

### 4. 预置 UI 组件库

**你可以（并且强烈建议）直接使用以下预置组件，无需自己实现：**

\`\`\`typescript
// 按钮组件
import { Button } from '@/components/ui/button';
// 用法：<Button variant="default|outline|ghost">点击</Button>

// 卡片组件
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
// 用法：<Card><CardHeader><CardTitle>标题</CardTitle></CardHeader></Card>

// 输入框
import { Input } from '@/components/ui/input';
// 用法：<Input placeholder="请输入..." />

// 徽章
import { Badge } from '@/components/ui/badge';
// 用法：<Badge variant="default|secondary|outline">标签</Badge>

// 选择框
import { Select } from '@/components/ui/select';
// 用法：<Select><option>选项1</option></Select>

// 文本域
import { Textarea } from '@/components/ui/textarea';
// 用法：<Textarea placeholder="请输入..." />
\`\`\`

## 输出要求

### 1. 纯代码输出
- **只输出 \`GeneratedApp.tsx\` 的 TypeScript/React 代码内容**
- **不要包含任何 Markdown 代码块标记**（如 \`\`\`tsx 或 \`\`\`）
- **不要包含任何解释性文字或注释块**
- 代码应该可以直接粘贴运行

### 2. 完整性
- 包含所有必要的 import 语句
- 如果需要状态管理，使用 \`useState\`、\`useEffect\` 等 React Hooks
- 确保所有引用的变量和函数都有定义

### 3. 交互性与动态性
- 为关键功能添加交互逻辑（如按钮点击、表单提交）
- 使用 \`useState\` 管理组件状态
- 提供良好的用户反馈（如加载状态、成功/错误提示）

### 4. 可编辑性标记（重要）
为了支持后续的 AI 编辑功能，请为关键的容器元素添加 \`data-aid\` 属性：

\`\`\`typescript
<div data-aid="main-container">
  <header data-aid="header">...</header>
  <main data-aid="content">...</main>
  <Button data-aid="submit-btn">提交</Button>
</div>
\`\`\`

**data-aid 命名规范：**
- 使用小写字母和连字符
- 使用描述性名称（如 \`user-list\`、\`search-bar\`、\`action-btn\`）
- 关键交互元素必须添加此属性

### 5. 代码质量
- 使用 TypeScript 类型注解（至少为函数参数和状态）
- 保持代码简洁、可读
- 避免重复代码，提取可复用的逻辑
- 添加必要的行内注释（解释"为什么"而不是"做什么"）

### 6. 样式最佳实践示例

**✅ 推荐写法（对比度良好）：**
\`\`\`tsx
// 方案 1: 使用语义化变量（自动适配主题）
<div className="bg-background text-foreground">
  <Card className="bg-card text-card-foreground">内容</Card>
</div>

// 方案 2: 明确的浅色背景 + 深色文字
<div className="bg-white text-gray-900">
  <Card className="bg-slate-50 text-slate-900">内容</Card>
</div>

// 方案 3: 渐变背景 + 确保文字可见
<div className="bg-gradient-to-br from-blue-50 to-purple-50">
  <h1 className="text-gray-900 font-bold">标题</h1>
  <p className="text-gray-700">内容</p>
</div>
\`\`\`

**❌ 避免的写法（对比度差）：**
\`\`\`tsx
// 深色背景但忘记调整文字颜色
<div className="bg-slate-900">
  <p className="text-gray-800">看不清</p>  // ❌ 深色背景配深色文字
</div>

// 只用了暗色背景但没有暗色文字
<div className="dark:bg-slate-900">
  <p>内容</p>  // ❌ 暗色模式下文字会不可见
</div>
\`\`\`

## 示例输出格式

\`\`\`typescript
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

export default function GeneratedApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([
    { id: 1, name: '示例项目 1' },
    { id: 2, name: '示例项目 2' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8" data-aid="app-container">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center" data-aid="header">
          <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
          <Button data-aid="add-btn">
            <Plus className="w-4 h-4 mr-2" />
            新建项目
          </Button>
        </header>
        
        <div className="relative" data-aid="search-bar">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="搜索项目..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-aid="items-grid">
          {items.map((item) => (
            <Card key={item.id} data-aid={\`item-\${item.id}\`}>
              <CardHeader>
                <CardTitle className="text-gray-900">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">项目描述</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
\`\`\`

# 你的任务

根据用户的需求描述，生成一个符合上述所有规范的 React 组件。
追求现代、美观、专业的 UI 设计，提供流畅的用户体验。
`;

/**
 * 构建用户提示词
 * @param userPrompt 用户的需求描述
 * @param context 可选的上下文信息（如已有代码、编辑指令等）
 */
export function buildUserPrompt(
  userPrompt: string,
  context?: {
    existingCode?: string;
    editInstruction?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }
): string {
  // 场景 1: 从零开始生成
  if (!context?.existingCode && !context?.editInstruction) {
    return `请根据以下需求生成一个 React 应用：

${userPrompt}

要求：
- 设计要现代、美观、专业
- 包含合理的交互逻辑
- 使用预置的 UI 组件库
- 添加 data-aid 属性以支持后续编辑
`;
  }

  // 场景 2: 编辑现有代码
  if (context?.existingCode && context?.editInstruction) {
    return `当前代码：

\`\`\`typescript
${context.existingCode}
\`\`\`

修改需求：
${context.editInstruction}

请在保持现有功能的基础上，进行修改并输出完整的新代码。
`;
  }

  // 场景 3: 对话式迭代
  if (context?.conversationHistory) {
    const historyText = context.conversationHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n\n");

    return `对话历史：
${historyText}

用户最新请求：
${userPrompt}

请根据对话历史和最新请求，输出完整的更新后的代码。
`;
  }

  return userPrompt;
}

/**
 * 代码清洗器：移除 AI 可能添加的多余内容
 */
export function cleanAiGeneratedCode(rawOutput: string): string {
  let cleaned = rawOutput.trim();

  // 移除可能的 Markdown 代码块标记
  cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/gm, "");
  cleaned = cleaned.replace(/^```\n?/gm, "");
  cleaned = cleaned.replace(/\n?```$/gm, "");

  // 移除可能的解释性文字（通常在代码前后）
  // 保留代码注释，但移除独立的文本段落
  const codeStartPatterns = [
    /^[\s\S]*?(import\s)/m,
    /^[\s\S]*?(export\s+default\s+function)/m,
  ];

  for (const pattern of codeStartPatterns) {
    const match = cleaned.match(pattern);
    if (match && match.index !== undefined) {
      cleaned = cleaned.substring(match.index);
      break;
    }
  }

  // 移除末尾的解释性文字
  const lastExportIndex = cleaned.lastIndexOf("}");
  if (lastExportIndex !== -1) {
    // 检查最后一个 } 之后是否还有实质性代码
    const afterLastBrace = cleaned.substring(lastExportIndex + 1).trim();
    if (!afterLastBrace.match(/^[\/\*]/)) {
      // 如果不是注释，则截断
      cleaned = cleaned.substring(0, lastExportIndex + 1);
    }
  }

  return cleaned.trim();
}

/**
 * 构建用户提示词设计（未来迁移到服务端）
 * 
 * 作用：根据用户输入和上下文，构建完整的用户提示词
 * 
 * 支持的场景：
 * 1. 从零开始生成 - 根据用户需求描述生成新应用
 * 2. 编辑现有代码 - 基于已有代码进行修改
 * 3. 对话式迭代 - 基于对话历史进行增量更新
 * 
 * 未来实现示例：
 * 
 * export function buildUserPrompt(
 *   userPrompt: string,
 *   context?: {
 *     existingCode?: string;
 *     editInstruction?: string;
 *     conversationHistory?: Array<{ role: string; content: string }>;
 *   }
 * ): string {
 *   // 场景 1: 从零开始生成
 *   if (!context?.existingCode && !context?.editInstruction) {
 *     return `请根据以下需求生成一个 React 应用：\n\n${userPrompt}\n\n要求：...`;
 *   }
 *   
 *   // 场景 2: 编辑现有代码
 *   if (context?.existingCode && context?.editInstruction) {
 *     return `当前代码：\n\`\`\`typescript\n${context.existingCode}\n\`\`\`\n\n修改需求：${context.editInstruction}`;
 *   }
 *   
 *   // 场景 3: 对话式迭代
 *   // ...
 * }
 */
export function validateGeneratedCode(code: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查是否包含必要的导出
  if (!code.includes("export default function GeneratedApp")) {
    errors.push("缺少必需的默认导出：export default function GeneratedApp()");
  }

  // 检查是否包含基本的 React import
  if (!code.includes("import React") && !code.includes("import { useState")) {
    errors.push("建议添加 React imports");
  }

  // 检查是否有未闭合的代码块
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`代码块未闭合：{ 数量 ${openBraces}，} 数量 ${closeBraces}`);
  }

  // 检查是否包含 JSX 返回
  if (!code.includes("return (") && !code.includes("return <")) {
    errors.push("组件应该返回 JSX 元素");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 增强提示词：当生成失败时，提供更详细的指导
 */
export function buildEnhancedPrompt(
  originalPrompt: string,
  previousErrors?: string[]
): string {
  let enhanced = originalPrompt;

  if (previousErrors && previousErrors.length > 0) {
    enhanced += `\n\n**注意：上次生成出现了以下问题，请务必避免：**\n`;
    previousErrors.forEach((error, index) => {
      enhanced += `${index + 1}. ${error}\n`;
    });
  }

  enhanced += `\n\n**再次强调：**
- 只输出纯代码，不要包含任何 Markdown 标记
- 必须使用 export default function GeneratedApp()
- 确保代码完整、可运行
- 使用预置的 UI 组件库（@/components/ui/*）
`;
  return enhanced;
}

