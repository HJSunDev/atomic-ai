import { v } from "convex/values";

/**
 * 定义支持的任务标识符类型
 * 使用联合类型来确保传递的 taskIdentifier 是有效的
 */
export type TaskIdentifier = "OPTIMIZE_TITLE" | "REFINE_TEXT";

/**
 * Convex 验证器，用于验证任务标识符参数
 * 集中管理所有支持的任务类型，方便未来扩展
 */
export const taskIdentifierValidator = v.union(
  v.literal("OPTIMIZE_TITLE"),
  v.literal("REFINE_TEXT")
);

// 使用 Record<TaskIdentifier, string> 来存储提示词模板
// key是任务标识符，value是提示词模板字符串
const promptTemplates: Record<TaskIdentifier, string> = {
  /**
   * 优化标题的任务提示
   * 指示AI扮演一个SEO专家，根据输入文本生成一个不超过30个汉字的吸引人的标题
   * 并要求它只返回标题内容
   */
  OPTIMIZE_TITLE:
    "你是一位擅长撰写吸引人且对SEO友好的标题的专家。" +
    "请分析以下文本，并为其生成一个简洁且引人-注目的标题。" +
    "标题长度不应超过30个汉字或60个英文字符。" +
    "请只返回标题本身，不要包含任何介绍性短语或解释。" +
    "原始文本如下：\n\n" +
    "'{inputText}'",

  /**
   * 润色文本的任务提示
   * 指示AI扮演一个专业的文案编辑
   * 要求它使文本更清晰、简洁、吸引人，并修正语法错误
   */
  REFINE_TEXT:
    "你是一位专业的文案编辑。" +
    "请润色以下文本，使其更加清晰、简洁、引人入胜。" +
    "修正其中所有的语法错误或不通顺的表达。" +
    "原始文本如下：\n\n" +
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