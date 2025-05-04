"use node";

import { PromptTemplate } from "@langchain/core/prompts";

/**
 * 聊天提示模板
 * 用于生成基础聊天对话的提示
 */
export const chatPromptTemplate = PromptTemplate.fromTemplate(`
你是一个智能AI助手，专注于提供有帮助、有礼貌和准确的回答。
你善于用清晰、自然的语言回答问题，并会根据上下文调整回复的语气和详细程度。

当前对话历史：
{chat_history}

用户的最新消息：
{user_message}

请提供一个有帮助、准确和友好的回答。如果不确定，请坦诚地表明，而不是提供不准确的信息。
回答应直接针对用户的问题，避免不必要的介绍或总结。
`);

/**
 * 结构化输出提示模板
 * 用于生成需要结构化输出的提示
 */
export const structuredOutputPromptTemplate = PromptTemplate.fromTemplate(`
你是一个智能AI助手，专注于提供结构化的回答。
你需要按照指定的格式输出你的回答，以便系统可以正确解析。

当前对话历史：
{chat_history}

用户的最新消息：
{user_message}

请按照以下格式提供你的回答：
{format_instructions}

确保你的回答严格遵循上述格式，不要添加额外的前缀或后缀说明。
`);

/**
 * 摘要生成提示模板
 * 用于生成文本摘要的提示
 */
export const summaryPromptTemplate = PromptTemplate.fromTemplate(`
你是一个专业的摘要生成器，擅长从长文本中提取关键信息并生成简洁的摘要。
你需要理解内容的核心意思，识别最重要的观点，并以精炼的语言呈现。

请为以下文本生成一个简洁的摘要：
{text}

摘要应当：
1. 包含原文的主要观点和关键信息
2. 保持逻辑清晰，层次分明
3. 使用简洁、精准的语言
4. 长度控制在150字以内

请直接输出摘要内容，不需要添加额外的说明或标题。
`);

/**
 * 创建自定义提示模板
 * 用于根据特定需求创建提示模板
 */
export function createCustomPromptTemplate(templateText: string): PromptTemplate {
  return PromptTemplate.fromTemplate(templateText);
} 