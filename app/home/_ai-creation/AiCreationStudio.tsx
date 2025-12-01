"use client";

import { useCallback } from "react";
import { AiCreationInput, type CreationInputPayload } from "./platform/AiCreationInput";
// 文档模块视图：从 documents 目录引入
import { DocumentCreationView } from "./documents/DocumentCreationView";

import { useGenerationOrchestrator } from "@/services/prompt/generationOrchestrator";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";
import { useIntentRouter } from "@/services/intent";
import { IntentRoutingOverlay } from "./components/IntentRoutingOverlay";

/**
 * 智创模块主入口 (AiCreationStudio)
 * 
 * 职责：
 * 1. 作为 AI 创作场景的统一入口容器 (Shell)
 * 2. 提供统一的输入区域 (AiCreationInput)
 * 3. 管理和分发业务逻辑 (Orchestrator Dispatch)
 * 4. 动态渲染下方的业务视图 (DocumentCreationView / WebCreationView 等)
 * 5. 执行意图识别，自动路由到 chat/document/app 模块
 */
export const AiCreationStudio = () => {
  // 引入文档生成编排器
  // TODO: 未来这里可以引入网页生成、图片生成等其他编排器
  const { startGeneration } = useGenerationOrchestrator();
  
  // 引入意图识别和路由器
  const { 
    executeIntentRouting, 
    status: routingStatus, 
    intentResult, 
    resetStatus 
  } = useIntentRouter();

  /**
   * 处理 AI 创作输入的提交
   * 
   * 流程：
   * 1. 调用意图识别服务，分析用户输入
   * 2. 根据识别结果路由到对应模块（chat/document/app）
   * 3. 保底策略：识别失败时默认走 chat 模式
   */
  const handleCreationSubmit = useCallback(
    async (payload: CreationInputPayload) => {
      try {
        // 执行意图识别和路由
        const result = await executeIntentRouting(
          {
            userPrompt: payload.userPrompt,
            modelId: payload.modelId,
            webSearchEnabled: payload.webSearchEnabled,
            userApiKey: payload.userApiKey,
          },
          // 自定义处理器
          {
            // Document 模块：直接在当前页面执行文档生成逻辑
            document: async (intent, input) => {
              console.log("[AiCreationStudio] 路由到 document 模块，开始生成...");
              
              const genResult = await startGeneration({
                userPrompt: input.userPrompt,
                modelId: input.modelId,
                webSearchEnabled: input.webSearchEnabled,
                userApiKey: input.userApiKey,
                // 可以把意图识别的 summary 作为文档标题的参考（如果需要）
              });
              
              return genResult.success ?? false;
            }
          }
        );

        return { success: result.success };
      } catch (error) {
        console.error("[AiCreationStudio] 意图路由失败", error);
        
        // 降级策略：如果意图识别整体失败，走文档生成逻辑作为保底
        // 因为当前页面主要展示的是 DocumentCreationView
        const fallbackResult = await startGeneration({
          userPrompt: payload.userPrompt,
          modelId: payload.modelId,
          webSearchEnabled: payload.webSearchEnabled,
          userApiKey: payload.userApiKey,
        });

        return { success: fallbackResult.success ?? false };
      }
    },
    [executeIntentRouting, startGeneration]
  );

  return (
    // 采用可退化的垂直居中：当空间充足时居中，内容超出时自动顶对齐，避免顶部内容不可见
    <main className="relative w-full min-h-[100svh] overflow-y-auto bg-background flex flex-col">
      {/* 意图识别状态遮罩 */}
      <IntentRoutingOverlay 
        status={routingStatus} 
        intentResult={intentResult}
        onClose={resetStatus}
      />

      {/* 使用 my-auto 在可用空间内垂直居中；当内容高度超过视口时，自动变为顶部对齐 */}
      <div className="my-auto">

        {/* 欢迎区*/}
        <section>
          <div className="max-w-[43rem] w-full mx-auto py-8 flex flex-col items-center">
            {/* 使用自有头像组件以保持风格统一 */}
            <AiAssistantAvatar />

            {/* 标题采用简洁问句，引导用户输入意图 */}
            <h1 className="mt-6 text-2xl md:text-3xl font-semibold text-center text-foreground">
              How can I help you today?
            </h1>
          </div>
        </section>

        
        {/* 输入区 - 使用统一的 AI 创作输入组件 */}
        <AiCreationInput onSubmit={handleCreationSubmit} />

        {/* 3. 动态业务视图区 (Dynamic View Area) */}
        {/* 下方的组件是完全隔离的，只负责展示对应模块的内容（如列表、看板、预览等） */}
        {/* TODO: 未来可以使用 Switch/Tab 切换 <WebCreationView /> */}
        <DocumentCreationView />
      </div>
    </main>
  );
};
