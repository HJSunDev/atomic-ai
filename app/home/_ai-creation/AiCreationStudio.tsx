"use client";

import { useCallback } from "react";
import { AiCreationInput, type CreationInputPayload } from "./platform/AiCreationInput";
// 文档模块视图：从 documents 目录引入
import { DocumentCreationView } from "./documents/DocumentCreationView";

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
  // 使用统一的意图路由 Hook
  // 内置了所有业务逻辑，开箱即用
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
      const result = await executeIntentRouting(
        {
          userPrompt: payload.userPrompt,
          modelId: payload.modelId,
          webSearchEnabled: payload.webSearchEnabled,
          userApiKey: payload.userApiKey,
        },
        // 配置项：保底策略设为 chat
        { defaultIntent: "chat" }
      );

      return { success: result.success };
    },
    [executeIntentRouting]
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
