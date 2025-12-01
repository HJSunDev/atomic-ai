import { v } from "convex/values";

/**
 * 定义支持的任务标识符类型
 * 使用联合类型来确保传递的 taskIdentifier 是有效的
 */
export type TaskIdentifier = 
  | "OPTIMIZE_TITLE" 
  | "OPTIMIZE_PROMPT" 
  | "DETECT_INTENT";

/**
 * Convex 验证器，用于验证任务标识符参数
 * 集中管理所有支持的任务类型，方便未来扩展
 */
export const taskIdentifierValidator = v.union(
  v.literal("OPTIMIZE_TITLE"),
  v.literal("OPTIMIZE_PROMPT"),
  v.literal("DETECT_INTENT")
);

// 使用 Record<TaskIdentifier, string> 来存储提示词模板
// key是任务标识符，value是提示词模板字符串
const promptTemplates: Record<TaskIdentifier, string> = {
  /**
   * 生成对话标题的任务提示
   * 当用户在 chat 模块开启新对话时，根据用户的第一条消息内容生成简洁的对话标题
   * 标题将用于对话列表展示，需要简洁明了地概括对话主题
   */
  OPTIMIZE_TITLE:
    "你是一个对话标题生成助手。" +
    "请根据用户的第一条消息内容，生成一个简洁、准确的对话标题。" +
    "标题要求：\n" +
    "1. 长度不超过15个汉字或字符。\n" +
    "2. 准确概括对话的核心主题或用户的主要需求。\n" +
    "3. 简洁明了，适合在对话列表中快速识别。\n" +
    "4. 只返回标题本身，不要包含任何引号、解释或其他内容。\n" +
    "用户消息：\n\n" +
    "'{inputText}'",

  /**
   * 优化提示词的任务提示
   * 指示AI扮演提示词工程师，利用结构化技巧提升提示词质量
   * 核心在于明确意图、增加细节和结构化表达
   */
  OPTIMIZE_PROMPT:
    "你是一位精通大语言模型（LLM）交互的资深提示词工程师。" +
    "请优化用户的原始提示词，使其能够引导模型生成更高质量、更精准的回复。" +
    "优化原则：\n" +
    "1. 结构化：使用清晰的结构（如角色设定、背景、任务、约束）。\n" +
    "2. 具体化：消除模糊表达，明确具体的输出要求。\n" +
    "3. 完整性：补充必要的上下文信息。\n" +
    "请直接返回优化后的提示词内容，不要包含任何解释、分析或Markdown代码块标记（如 ```）。" +
    "原始提示词如下：\n\n" +
    "'{inputText}'",

  /**
   * 意图识别任务
   * 用于统一入口，分析用户输入并路由到 chat/document/app 模块
   * 返回结构化的 JSON 数据
   */
  DETECT_INTENT:
    "你是一个智能应用路由助手。请分析用户输入，判断其意图属于以下三个模块之一：\n" +
    "1. chat: (默认) 通用对话、问答、咨询、闲聊，或无法明确归类的情况。\n" +
    "2. document: 文档生成、文章写作、报告撰写、润色、大纲生成、内容扩写。\n" +
    "3. app: 生成应用、网页制作、UI设计、小游戏开发、工具生成。\n\n" +
    "请返回严格的 JSON 格式（不要包含 Markdown 代码块标记），包含以下字段：\n" +
    "- intent: 必须是 'chat', 'document', 'app' 其中之一。\n" +
    "- confidence: 0-1 之间的置信度数值。\n" +
    "- reason: 简短的判断理由（15字以内）。\n" +
    "- summary: 对用户需求的简短概括（方便前端展示）。\n\n" +
    "示例输出：\n" +
    `{ "intent": "app", "confidence": 0.95, "reason": "用户请求生成游戏", "summary": "生成贪吃蛇游戏" }\n\n` +
    "用户输入：\n" +
    "'{inputText}'",
};

/**
 * 根据任务标识符获取对应的提示词模板
 * @param identifier - 任务的唯一标识符
 * @returns 返回查找到的提示词模板字符串
 * @throws 如果传入的标识符无效，则抛出错误
 */
export const getPromptTemplate = (identifier: TaskIdentifier): string => {
  const template = promptTemplates[identifier];
  if (!template) {
    throw new Error(`未找到任务标识符 '${identifier}' 对应的提示词模板。`);
  }
  return template;
};

/**
 * 构建最终发送给AI的完整提示信息
 * @param identifier - 任务标识符
 * @param inputText - 用户输入的文本
 * @returns 替换了占位符后的完整提示信息
 */
export const buildFinalPrompt = (
  identifier: TaskIdentifier,
  inputText: string
): string => {
  const template = getPromptTemplate(identifier);
  // 将模板中的 '{inputText}' 占位符替换为实际的用户输入
  return template.replace("{inputText}", inputText);
};
