import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getTools } from "./agentTools";

/**
 * 创建支持工具调用的 Agent 执行器
 * 
 * 设计原则：
 * - 只有在明确启用联网搜索且工具可用时才返回 Agent
 * - 若条件不满足则返回 null，调用方应降级为普通 ChatModel
 * - Agent 会自主决策是否调用工具，而非强制搜索
 * 
 * @param chatModel - 已配置的 ChatOpenAI 模型实例
 * @param enableWebSearch - 是否启用联网搜索功能
 * @returns Agent 执行器实例，若不满足条件则返回 null
 */
export async function createAgentExecutor(
  chatModel: ChatOpenAI,
  enableWebSearch: boolean
): Promise<AgentExecutor | null> {
  
  // 条件1: 用户未启用联网搜索
  if (!enableWebSearch) {
    return null;
  }
  
  // 条件2: 尝试获取工具列表
  const tools = getTools();
  if (tools.length === 0) {
    // Tavily API Key 不存在或工具初始化失败
    console.warn("Agent工具列表为空，将使用普通对话模式");
    return null;
  }

  // 构建 Agent 的提示词模板
  // 使用 ChatPromptTemplate 确保与 LangChain 工具调用协议兼容
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system", 
      `你是一个智能助手，拥有联网搜索能力。

工具使用指南：
1. **优先使用已有知识**：对于通用知识、概念解释、代码编写等，直接回答即可
2. **需要搜索的场景**：
   - 最新新闻、事件（如"今天的头条"、"最近发生了什么"）
   - 实时数据（如股票价格、天气、比赛结果）
   - 你不确定或知识截止日期后的信息
   - 用户明确要求搜索的内容
3. **搜索策略**：
   - 提炼清晰、具体的搜索关键词
   - 综合多个搜索结果给出答案
   - 引用来源链接以增强可信度

记住：不是每个问题都需要搜索，根据实际需要智能判断。`
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  // 创建工具调用 Agent
  const agent = await createToolCallingAgent({
    llm: chatModel,
    tools,
    prompt,
  });

  // 创建并返回 Agent 执行器
  return new AgentExecutor({
    agent,
    tools,
    // 开发环境建议打开详细日志
    verbose: process.env.NODE_ENV === "development",
    // 最大迭代次数，防止 Agent 陷入无限循环
    maxIterations: 3,
    // 允许早停：如果 Agent 已完成任务则提前结束
    earlyStoppingMethod: "generate",
    // 处理解析错误，提升稳健性
    handleParsingErrors: true,
  });
}

