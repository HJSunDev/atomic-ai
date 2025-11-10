declare module "@langchain/community/tools/tavily_search" {
  import { StructuredTool } from "@langchain/core/tools";
  import { z } from "zod";

  export class TavilySearchResults extends StructuredTool {
    constructor(args?: { apiKey?: string; maxResults?: number });
    name: string;
    description: string;
    schema: z.ZodObject<any>;
  }
}


