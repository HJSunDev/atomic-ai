declare module "@langchain/community/tools/tavily_search" {
  export class TavilySearchResults {
    constructor(args?: { apiKey?: string; maxResults?: number });
    name: string;
    description: string;
  }
}


