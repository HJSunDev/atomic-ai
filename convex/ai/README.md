# AI 服务模块

这个模块提供基于 LangChain 和 OpenRouter 的 AI 能力，支持多轮对话和结构化输出。

## 目录结构

```
convex/ai/
├── chat/              # 聊天服务相关功能
│   └── actions.ts     # 聊天相关的 action 函数
├── utils/             # 工具函数
│   ├── aiClient.ts    # AI 客户端工具
│   ├── errorHandler.ts # 错误处理工具
│   ├── promptTemplates.ts # 提示模板
│   └── types.ts       # 类型定义
├── index.ts           # 模块导出
└── README.md          # 说明文档
```

## 环境配置

使用本模块需要配置以下环境变量：

- `OPENAI_API_KEY`：用于访问 OpenRouter API 的密钥

## 功能概览

### 1. 基础聊天能力

提供基础的多轮对话能力，支持上下文理解。

```typescript
import { chatCompletion } from "../ai";

// 在前端调用
const response = await convex.action({
  name: "ai/chat/actions:chatCompletion",
  args: {
    userMessage: "你好，请介绍一下自己",
    chatHistory: [
      { role: "user", content: "你是谁？" },
      { role: "assistant", content: "我是一个AI助手" }
    ],
    modelId: "deepseek-v3-0324-free" // 可选，默认使用配置的默认模型
  }
});

console.log(response.content); // AI的回复内容
```

### 2. 结构化输出能力

提供基于 schema 的结构化输出能力，支持将 AI 回复解析为指定格式。

```typescript
import { structuredOutput } from "../ai";

// Schema 示例
const schema = JSON.stringify({
  name: "string",
  age: "number",
  interests: ["string"],
  profile: {
    education: "string",
    experience: "number"
  }
});

// 在前端调用
const response = await convex.action({
  name: "ai/chat/actions:structuredOutput",
  args: {
    userMessage: "生成一个用户信息，名字叫张三，年龄30岁，...",
    schema: schema,
    modelId: "claude-3-7-sonnet" // 可选，默认使用配置的默认模型
  }
});

if (response.isStructured) {
  // 成功解析为结构化输出
  const userData = response.content;
  console.log(userData.name); // "张三"
} else {
  // 未能解析为结构化输出，content 为原始文本
  console.log(response.content);
}
```

## 错误处理

所有 AI 服务都提供统一的错误处理机制，返回标准格式的错误信息：

```typescript
{
  content: "抱歉，处理您的请求时遇到了问题：...",
  error: "具体错误信息",
  status: "error",
  timestamp: "2023-05-01T12:34:56.789Z",
  isStructured: false
}
```

## 扩展指南

### 添加新的模型

在 `convex/config/models.ts` 文件中的 `MODELS_BY_PROVIDER` 对象中添加新的模型配置。

### 添加新的 AI 服务

1. 在适当的目录下创建新的服务文件
2. 使用 `aiClient.ts` 中的工具函数创建 AI 客户端
3. 使用 `promptTemplates.ts` 中的模板或创建新的提示模板
4. 在 `index.ts` 中导出新服务 