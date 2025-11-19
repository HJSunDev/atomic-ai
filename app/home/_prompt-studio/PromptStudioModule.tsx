"use client";

import { useCallback } from "react";
import { AiCreationInput, type CreationInputPayload } from "./_components/AiCreationInput";
import { DocumentCreationView } from "./_components/DocumentCreationView";

import { useGenerationOrchestrator } from "@/services/prompt/generationOrchestrator";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";

/**
 * 智创模块主入口 (PromptStudioModule)
 * 
 * 职责：
 * 1. 作为 AI 创作场景的统一入口容器 (Shell)
 * 2. 提供统一的输入区域 (AiCreationInput)
 * 3. 管理和分发业务逻辑 (Orchestrator Dispatch)
 * 4. 动态渲染下方的业务视图 (DocumentCreationView / WebCreationView 等)
 */
export const PromptStudioModule = () => {
  // 引入文档生成编排器
  // TODO: 未来这里可以引入网页生成、图片生成等其他编排器
  const { startGeneration } = useGenerationOrchestrator();

  // 处理 AI 创作输入的提交
  // 这里是"中枢神经"，负责将用户的输入分发给正确的业务引擎
  const handleCreationSubmit = useCallback(
    async (payload: CreationInputPayload) => {
      // TODO: 这里未来可以接入 AI 意图识别，或者根据当前 Tab 状态
      // 自动判断是调用 startDocumentGeneration 还是 startWebPageGeneration
      
      // 目前默认全部走文档生成逻辑
      const result = await startGeneration({
        userPrompt: payload.userPrompt,
        modelId: payload.modelId,
        webSearchEnabled: payload.webSearchEnabled,
        userApiKey: payload.userApiKey,
      });

      return { success: result.success ?? false };
    },
    [startGeneration]
  );

  return (
    // 采用可退化的垂直居中：当空间充足时居中，内容超出时自动顶对齐，避免顶部内容不可见
    <main className="relative w-full min-h-[100svh] overflow-y-auto bg-background flex flex-col">
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
