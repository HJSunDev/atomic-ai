import { useCallback } from "react";
import { useGenerationOrchestrator } from "@/services/prompt/generationOrchestrator";
import type { IntentHandler } from "@/services/intent/types";

/**
 * Document 模块意图处理器 Hook
 * 
 * 职责：
 * 1. 处理路由到 Document 模块的逻辑
 * 2. 调用生成编排器开始生成文档
 */
export const useDocumentIntentHandler = () => {
  // 引入文档生成编排器
  const { startGeneration } = useGenerationOrchestrator();

  const handleDocumentIntent: IntentHandler = useCallback(async (intent, input) => {
    console.log("[DocumentIntentHandler] 路由到 document 模块，开始生成...");
    
    try {
      const genResult = await startGeneration({
        userPrompt: input.userPrompt,
        modelId: input.modelId,
        webSearchEnabled: input.webSearchEnabled,
        userApiKey: input.userApiKey,
        context: input.context,
      });
      
      return genResult.success ?? false;
    } catch (error) {
      console.error("[DocumentIntentHandler] 处理失败:", error);
      return false;
    }
  }, [startGeneration]);

  return { 
    handleDocumentIntent,
    // 暴露 startGeneration 供保底策略使用
    startGeneration 
  };
};

