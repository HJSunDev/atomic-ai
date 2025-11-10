import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { getTavilyApiKey } from "./envUtils";

/**
 * 创建并返回可供 LangChain Agent 使用的工具列表。
 * 
 * 工具配置说明：
 * - 返回结构化的 JSON 数据，包含 title, url, content, score, favicon 等字段
 * - maxResults: 控制返回结果数量，平衡信息完整性和 token 消耗
 * 
 * @returns 工具实例数组
 */
export const getTools = () => {


  let tavilyApiKey: string;
  
  try {
    tavilyApiKey = getTavilyApiKey();
  } catch (error) {
    // 如果 API 密钥不存在，返回空数组，不抛出错误
    // 这样 Agent 可以在没有联网搜索功能的情况下继续工作
    console.warn("Tavily API key not found. Web search will be disabled.");
    return [];
  }

  const tavilyTool = new TavilySearchResults({
    apiKey: tavilyApiKey,
    maxResults: 5, // 限制返回结果的数量
  });

  // 自定义工具名称和描述，使其更符合 Agent 的使用场景
  tavilyTool.name = "web_search";
  tavilyTool.description = 
    "Search the web for current information. Use this tool when you need recent events, news, or topics you are not certain about. " +
    "Input should be a clear and specific search query. " +
    "Returns structured results with titles, URLs, content snippets, and relevance scores.";

  return [tavilyTool];
};

