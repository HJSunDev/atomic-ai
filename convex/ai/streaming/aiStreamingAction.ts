"use node";

import { v } from "convex/values";
import { action } from "../../_generated/server";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

/**
 * AI流式内容生成Action
 * 专门用于生成AI回复内容，供流式传输使用
 * 模型信息和消息都内置在服务端，简化调用复杂度
 */
export const generateAIStreamContent = action({
  args: {
    // 可选的用户输入，如果不提供则使用内置消息
    userInput: v.optional(v.string()),
    // 可选的配置参数
    chunkSize: v.optional(v.number()),
    delay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // 内置的模型配置 - 使用免费的DeepSeek模型
      const modelConfig = {
        modelName: "deepseek/deepseek-chat-v3-0324:free",
        baseURL: "https://openrouter.ai/api/v1",
        temperature: 0.7,
        maxTokens: 4000,
      };

      // 获取API密钥
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("缺少OPENAI_API_KEY环境变量配置");
      }

      // 内置的用户消息和聊天上下文
      const defaultUserMessage = args.userInput || "请为我详细介绍一下人工智能的发展历史，包括主要的里程碑事件、关键技术突破，以及对社会的影响。请用通俗易懂的语言讲解，让普通人也能理解。";
      
      // 内置的聊天历史上下文
      const chatHistory = [
        {
          role: "system",
          content: "你是一个知识渊博、耐心细致的AI助手。你擅长用通俗易懂的语言解释复杂概念，并能够提供详细、准确的信息。在回答时，请保持友好、专业的语调，并确保内容具有教育价值。"
        },
        {
          role: "user", 
          content: "你好！我对人工智能很感兴趣，但是作为初学者，很多概念都不太懂。"
        },
      ];

      // 创建提示模板
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", "{system_prompt}"],
        ["human", "{chat_history}"],
        ["human", "{user_message}"]
      ]);

      // 创建AI模型实例
      const model = new ChatOpenAI({
        configuration: { baseURL: modelConfig.baseURL },
        openAIApiKey: apiKey,
        modelName: modelConfig.modelName,
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
        streaming: false, // 我们会在后续的httpaction中处理流式传输
      });

      // 格式化聊天历史
      const formattedHistory = chatHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join("\n\n");

      // 系统提示
      const systemPrompt = "你是一个专业的AI助手，专注于提供详细、准确、有教育价值的回答。请确保你的回答内容丰富、逻辑清晰，并且容易理解。在介绍复杂概念时，请使用类比和实例来帮助用户理解。";

      // 格式化完整提示
      const prompt = await promptTemplate.format({
        system_prompt: systemPrompt,
        chat_history: formattedHistory,
        user_message: defaultUserMessage
      });

      // 调用AI模型生成回复
      const response = await model.invoke(prompt);

      // 解析响应内容
      const outputParser = new StringOutputParser();
      const content = await outputParser.invoke(response);

      // 返回生成的内容和相关信息
      return {
        success: true,
        content: content,
        metadata: {
          modelUsed: modelConfig.modelName,
          timestamp: new Date().toISOString(),
          userInput: defaultUserMessage,
          estimatedTokens: Math.ceil(content.length / 4), // 粗略估算token数量
          chunkSize: args.chunkSize || 2,
          delay: args.delay || 100,
        }
      };

    } catch (error) {
      console.error("AI内容生成失败:", error);
      
      // 返回错误信息
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "未知错误",
          type: "AI_GENERATION_ERROR",
          timestamp: new Date().toISOString(),
        },
        // 提供降级内容
        content: "抱歉，AI服务暂时不可用。这是一个模拟的回复内容：人工智能（Artificial Intelligence，简称AI）是一门致力于创造能够模拟、延伸和扩展人类智能的理论、方法、技术及应用系统的技术科学。从1956年达特茅斯会议首次提出AI概念开始，人工智能经历了多个发展阶段，包括符号主义、连接主义和行为主义等不同学派的兴起。近年来，深度学习技术的突破带来了AI的新一轮繁荣，在图像识别、自然语言处理、游戏对弈等领域取得了显著成果，正在深刻改变着我们的生活和工作方式。",
        metadata: {
          modelUsed: "fallback",
          timestamp: new Date().toISOString(),
          isFallback: true,
        }
      };
    }
  }
}); 