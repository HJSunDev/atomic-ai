"use client";

import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import { api, internal } from "@/convex/_generated/api";
import { useDocumentStore } from "@/store/home/documentStore";
import { useGenerationJobStore } from "@/store/prompt/generationJobStore";
import { AVAILABLE_MODELS } from "@/convex/_lib/models";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * AI 生成编排器
 * 
 * 职责：
 * - 统一管理"创建文档 → 打开组件 → 调用 action → 维护状态"的完整流程
 * - 为所有入口（输入区、工具栏等）提供一致的生成 API
 * - 处理三种文档展示模式（dialog/sheet/fullscreen）的差异
 * - 集中处理错误、取消、完成等边界情况
 * 
 * 核心设计：
 * - "先创建 → 先打开 → 再调用 action"：确保用户立即看到文档，流式内容实时可见
 * - 通过 generationJobStore 统一管理生成状态，各模式的文档组件订阅即可
 * - 为未来扩展预留接口：上下文文档、打开模式配置等
 */

// 生成参数配置
export interface GenerationParams {
  // 必填：用户输入的提示词
  userPrompt: string;
  
  // 必填：模型 ID（与 chat 模块一致，直接使用 selectedModel）
  modelId: string;
  
  // 可选：系统提示词
  systemPrompt?: string;
  
  // 可选：打开模式（默认使用 documentStore 当前模式）
  openMode?: "drawer" | "modal" | "fullscreen";
  
  // 可选：上下文文档 (替代 contextDocIds)
  context?: {
    documents: Array<{
      id: string;
      type: string;
      title?: string;
    }>;
  };
  
  // 可选：用户自己的 API Key
  userApiKey?: string;
  
  // 可选：是否启用联网搜索
  webSearchEnabled?: boolean;
}

// 生成结果
export interface GenerationResult {
  success: boolean;
  docId?: string;
  jobId?: string;
  error?: string;
}

/**
 * Hook: AI 生成编排器
 * 
 * 提供统一的 startGeneration API，封装完整生成流程
 */
export function useGenerationOrchestrator() {
  const router = useRouter();
  const { displayMode, openDocument } = useDocumentStore();
  const { registerJob, updateJobStatus, completeJob } = useGenerationJobStore();
  
  // Convex mutations & actions
  const createDocumentMutation = useMutation(api.prompt.mutations.createDocument);
  const streamGenerateAction = useAction(api.chat.action.streamGeneratePromptContent);

  /**
   * 启动 AI 生成流程
   * 
   * 流程：
   * 1. 创建文档 + 内容块
   * 2. 注册生成任务到 Store
   * 3. 根据模式打开文档组件（此时编辑器已锁定）
   * 4. 调用 action 流式写入内容
   * 5. 监听完成/错误，更新任务状态
   */
  const startGeneration = async (params: GenerationParams): Promise<GenerationResult> => {
    const {
      userPrompt,
      modelId,
      systemPrompt,
      openMode,
      context,
      userApiKey,
      webSearchEnabled = false,
    } = params;

    // 参数校验
    if (!userPrompt.trim()) {
      toast.error("请输入提示词", { position: "top-center" });
      return { success: false, error: "用户提示词为空" };
    }

    // 验证模型 ID
    const modelConfig = AVAILABLE_MODELS[modelId];
    if (!modelConfig) {
      toast.error(`不支持的模型: ${modelId}`, { position: "top-center" });
      return { success: false, error: `不支持的模型ID: ${modelId}` };
    }

    try {
      // ============================================
      // 步骤 1: 创建文档 + 内容块
      // ============================================
      const createResult = await createDocumentMutation();
      const docId = createResult.documentId;
      
      // createDocument 只返回 documentId，需要查询内容块 ID
      // 因为每个文档有且只有一个内容块，action 会自动查找
      // 这里为了注册任务，我们使用一个临时的 blockId（实际由 action 内部查询）
      const blockId = "pending" as any; // action 内部会查询真实的 blockId

      // ============================================
      // 步骤 2: 注册生成任务
      // ============================================
      const jobId = registerJob({
        docId,
        blockId,
        userPrompt,
        modelConfig,
        systemPrompt,
        contextDocIds: context?.documents.map(d => d.id) ?? [],
      });

      // ============================================
      // 步骤 3: 打开文档组件（编辑器锁定）
      // ============================================
      const targetMode = openMode || displayMode;
      
      if (targetMode === "fullscreen") {
        // 全屏模式：路由跳转
        router.push(`/home/prompt-document/${docId}`);
      } else {
        // drawer/modal 模式：通过 Store 打开
        openDocument({ documentId: docId });
      }

      // ============================================
      // 步骤 4: 调用 action 流式生成（异步，不阻塞）
      // ============================================
      // 使用 Promise 包装，避免阻塞返回
      (async () => {
        try {
          // 更新状态为 streaming
          updateJobStatus(docId, "streaming");

          // 为诊断首包与整体耗时，记录开始时间
          // 目的：当上游服务异常或被限流时，能在浏览器控制台看到完整原始错误与耗时分布
          const startedAtMs = Date.now();

          // 调用 action（流式写入由 action 内部处理）
          const actionResult = await streamGenerateAction({
            documentId: docId as Id<"documents">,
            userPrompt,
            // systemPrompt, 不再使用 systemPrompt, 改为通过 context 传递结构化指令
            modelId, // 直接使用 modelId，与 chat 模块一致
            userApiKey,
            agentFlags: {
              webSearch: webSearchEnabled,
            },
            // 使用上下文构建器，为本次生成提供结构化的任务与规范说明
            context: {
              // 告诉 AI：这是一个“文档生成”任务
              coreTask:
                "根据用户的需求，生成一篇文档。",
              // 告诉 AI：必须以 Markdown 形式输出
              specification: [
                "请使用 Markdown 格式输出最终结果（支持 GFM）。",
                "不要添加与文档内容无关的额外解释性文字或前后缀说明。",
              ].join("\n"),
              // 将 context 映射为 action 接受的格式
              documents: context?.documents.map(doc => ({
                id: doc.id as Id<"documents">,
                type: doc.type as "core_task" | "specification" | "background_info",
              })),
            },
          });

          // ============================================
          // 步骤 5: 处理结果
          // ============================================
          if (actionResult.success) {
            // 成功：标记完成
            completeJob(docId);
            toast.success("生成完成", { position: "top-center", duration: 3000 });
          } else {
            // 失败：更新状态并显示友好的错误信息
            const friendlyError = getFriendlyErrorMessage(actionResult.error || "未知错误");
            updateJobStatus(docId, "error", friendlyError);
            toast.error(friendlyError, { 
              position: "top-center",
              duration: 6000,
            });

            // 在浏览器控制台输出结构化、完整的原始错误信息，便于排查
            // 说明：保留用户端友好提示，同时把原始错误、上下文与耗时写入 console
            console.error("[PromptGenerationError] Action returned failure", {
              docId,
              jobId,
              modelId,
              modelName: modelConfig.modelName,
              provider: modelConfig.provider,
              baseURL: modelConfig.baseURL,
              userPromptLength: userPrompt.length,
              systemPromptProvided: Boolean(systemPrompt),
              elapsedMs: Date.now() - startedAtMs,
              rawError: actionResult.error,
            });
          }
        } catch (error) {
          // 异常：更新状态并显示错误
          const errorMessage = error instanceof Error ? error.message : "未知错误";
          const friendlyError = getFriendlyErrorMessage(errorMessage);
          updateJobStatus(docId, "error", friendlyError);
          toast.error(friendlyError, { 
            position: "top-center",
            duration: 6000,
          });

          // 在浏览器控制台输出异常对象与上下文，保留堆栈与原始信息
          console.error("[PromptGenerationException] Action threw", {
            docId,
            jobId,
            modelId,
            modelName: modelConfig.modelName,
            provider: modelConfig.provider,
            baseURL: modelConfig.baseURL,
            userPromptLength: userPrompt.length,
            systemPromptProvided: Boolean(systemPrompt),
            error,
          });
        }
      })();

      // 立即返回，不等待生成完成
      return {
        success: true,
        docId,
        jobId,
      };

    } catch (error) {
      // 创建文档或注册任务失败
      const errorMessage = error instanceof Error ? error.message : "启动生成失败";
      toast.error(errorMessage, { position: "top-center" });
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    startGeneration,
  };
}

/**
 * 将技术错误信息转换为用户友好的提示
 */
function getFriendlyErrorMessage(error: string): string {
  // 速率限制错误
  if (error.includes("rate-limited") || error.includes("429") || error.includes("MODEL_RATE_LIMIT")) {
    return "当前模型请求过于频繁，请稍后重试或切换其他模型";
  }
  
  // API 密钥错误
  if (error.includes("API") && error.includes("密钥")) {
    return "API 密钥无效或缺失，请检查配置";
  }
  
  // 网络错误
  if (error.includes("network") || error.includes("timeout")) {
    return "网络连接失败，请检查网络后重试";
  }
  
  // 权限错误
  if (error.includes("未授权") || error.includes("无权")) {
    return "权限不足，请重新登录";
  }
  
  // 文档不存在
  if (error.includes("文档不存在") || error.includes("内容块不存在")) {
    return "文档数据异常，请刷新页面重试";
  }
  
  // 其他错误：保留原始信息但限制长度
  return error.length > 100 ? error.substring(0, 100) + "..." : error;
}

