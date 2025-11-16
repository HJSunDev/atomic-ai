import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getTools } from "./agentTools";

/**
 * 生成包含当前时间信息的 Agent 系统提示词
 * 
 * 设计目的：
 * - 解决 LLM 知识截止日期陷阱：模型不知道"现在"是什么时候
 * - 确保时间敏感查询（如"今天的新闻"）使用真实日期而非训练截止日期
 * - 遵循 OpenAI/Anthropic 最佳实践：在系统提示词中注入时间
 * 
 * @returns 包含当前时间信息的系统提示词字符串
 */
function generateSystemPromptWithTime(): string {
  const now = new Date();
  
  const dateStr = now.toISOString().split('T')[0];
  
  const weekDay = now.toLocaleDateString('zh-CN', { 
    weekday: 'long',
    timeZone: 'Asia/Shanghai' 
  });
  
  const timeStr = now.toLocaleTimeString('zh-CN', { 
    hour12: false, 
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `你是一个智能助手，拥有联网搜索能力。

【当前时间信息】
- 今天的日期：${dateStr}（${weekDay}）
- 当前时间：${timeStr}（北京时间 UTC+8）

重要提示：
- 当用户询问"今天"、"最新"、"现在"等时间相关问题时，请使用上述真实日期
- 你的知识截止日期已过时，对于时间敏感信息（如新闻、股价、天气），必须使用联网搜索
- 搜索时请使用正确的日期，例如：用户问"今天的新闻"应搜索"${dateStr} 新闻"

工具使用指南：
1. **优先使用已有知识**：对于通用知识、概念解释、代码编写等，直接回答即可
2. **需要搜索的场景**：
   - 最新新闻、事件（如"今天的头条"、"最近发生了什么"）
   - 实时数据（如股票价格、天气、比赛结果）
   - 你不确定或知识截止日期后的信息
   - 用户明确要求搜索的内容
3. **搜索策略**：
   - 提炼清晰、具体的搜索关键词
   - 对于时间敏感查询，明确包含日期（如"${dateStr} 新闻"）
   - 综合多个搜索结果给出答案
   - 引用来源链接以增强可信度

记住：不是每个问题都需要搜索，根据实际需要智能判断。`;
}

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

  // 构建 Agent 的提示词模板（动态注入当前时间）
  // 使用 ChatPromptTemplate 确保与 LangChain 工具调用协议兼容
  const systemPromptWithTime = generateSystemPromptWithTime();
  
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptWithTime],
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

