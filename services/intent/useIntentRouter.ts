import { useCallback, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import type { IntentResult, IntentRouteInput, IntentType, IntentHandlers } from "./types";


/**
 * 意图识别超时时间（毫秒）
 * 如果超过此时间仍未返回结果，将降级到 chat 模式
 */
const INTENT_DETECTION_TIMEOUT = 5000; // 5秒

/**
 * 路由状态类型
 */
export type RoutingStatus = "idle" | "detecting" | "routing" | "success" | "error";

/**
 * 意图识别和路由 Hook
 * 
 * 职责：
 * 1. 调用后端意图识别服务（使用服务端默认模型）
 * 2. 解析 AI 返回的结构化结果
 * 3. 根据识别结果路由到对应模块
 * 4. 提供保底策略（默认 chat 模式）
 * 5. 提供详细的状态管理供 UI 展示
 * 
 * 设计说明：
 * - 意图识别是轻量级任务，使用服务端默认模型即可（快速、稳定、成本低）
 * - 路由后的实际业务逻辑（如文档生成）使用用户选择的模型配置
 */
export const useIntentRouter = () => {
  const router = useRouter();
  const executeTask = useAction(api.chat.action.executeTask);
  
  // 状态管理
  const [status, setStatus] = useState<RoutingStatus>("idle");
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);

  /**
   * 解析 AI 返回的意图识别结果
   * 提供健壮的错误处理和保底策略
   */
  const parseIntentResult = useCallback((rawResponse: string): IntentResult | null => {
    try {
      // 尝试清理可能的 Markdown 代码块标记
      let cleaned = rawResponse.trim();
      
      // 移除可能的 ```json 或 ``` 包裹
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
      }

      const parsed = JSON.parse(cleaned);

      // 验证必需字段
      if (
        !parsed.intent ||
        !["chat", "document", "app"].includes(parsed.intent) ||
        typeof parsed.confidence !== "number" ||
        !parsed.reason ||
        !parsed.summary
      ) {
        console.warn("[IntentRouter] 解析结果缺少必需字段或字段类型不正确", parsed);
        return null;
      }

      return {
        intent: parsed.intent as IntentType,
        confidence: parsed.confidence,
        reason: parsed.reason,
        summary: parsed.summary,
      };
    } catch (error) {
      console.error("[IntentRouter] 解析 JSON 失败", error, "原始响应:", rawResponse);
      return null;
    }
  }, []);

  /**
   * 执行意图识别
   * 使用服务端默认模型，不传递模型配置信息
   */
  const detectIntent = useCallback(
    async (input: IntentRouteInput): Promise<IntentResult> => {
      const startTime = Date.now();
      
      try {
        console.log("[IntentRouter] 开始意图识别（使用默认模型）", {
          promptLength: input.userPrompt.length,
          timeout: INTENT_DETECTION_TIMEOUT,
        });

        // 创建超时 Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error("意图识别超时"));
          }, INTENT_DETECTION_TIMEOUT);
        });

        // 竞争：要么意图识别完成，要么超时
        // 不传递 modelId 和 userApiKey，让服务端使用默认模型
        const result = await Promise.race([
          executeTask({
            taskIdentifier: "DETECT_INTENT",
            inputText: input.userPrompt,
          }),
          timeoutPromise,
        ]);

        const duration = Date.now() - startTime;

        if (!result.success || !result.data) {
          console.warn("[IntentRouter] 意图识别失败，降级到 chat", {
            error: result.error,
            duration,
          });
          return {
            intent: "chat",
            confidence: 0,
            reason: "识别失败，使用默认模式",
            summary: input.userPrompt.slice(0, 50),
          };
        }

        // 尝试解析结构化结果
        const parsed = parseIntentResult(result.data);
        
        if (!parsed) {
          console.warn("[IntentRouter] 无法解析意图结果，降级到 chat", {
            rawData: result.data,
            duration,
          });
          return {
            intent: "chat",
            confidence: 0,
            reason: "解析失败，使用默认模式",
            summary: input.userPrompt.slice(0, 50),
          };
        }

        console.log("[IntentRouter] 意图识别成功", {
          intent: parsed.intent,
          confidence: parsed.confidence,
          reason: parsed.reason,
          duration,
        });

        return parsed;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error("[IntentRouter] 意图识别异常", {
          error,
          duration,
        });
        return {
          intent: "chat",
          confidence: 0,
          reason: "发生异常，使用默认模式",
          summary: input.userPrompt.slice(0, 50),
        };
      }
    },
    [executeTask, parseIntentResult]
  );

  /**
   * 根据意图路由到对应模块
   */
  const routeToModule = useCallback(
    async (intent: IntentResult, input: IntentRouteInput, handlers?: IntentHandlers): Promise<{ success: boolean }> => {
      try {
        // 优先使用自定义处理器
        if (handlers && handlers[intent.intent]) {
          const success = await handlers[intent.intent]!(intent, input);
          return { success };
        }

        switch (intent.intent) {
          case "chat":
            // TODO: 创建新的聊天对话
            // 1. 调用 createConversation mutation 创建新对话
            // 2. 使用 input.userPrompt 作为第一条用户消息
            // 3. 跳转到 /home/chat?id={conversationId}
            console.log("[IntentRouter] 路由到 chat 模块", {
              summary: intent.summary,
              confidence: intent.confidence,
            });
            // router.push(`/home/chat?id=${conversationId}`);
            return { success: true };
          case "app":
            // TODO: 创建新的应用/网页
            // 1. 调用 createApp 相关的 mutation 创建新应用
            // 2. 使用 intent.summary 作为应用标题
            // 3. 使用 input.userPrompt 触发应用代码生成
            // 4. 跳转到应用预览/编辑页面
            console.log("[IntentRouter] 路由到 app 模块", {
              summary: intent.summary,
              confidence: intent.confidence,
            });
            return { success: true };

          default:
            console.warn("[IntentRouter] 未知的意图类型，降级到 chat", intent.intent);
            // 降级到 chat 模式
            return { success: true };
        }
      } catch (error) {
        console.error("[IntentRouter] 路由执行失败", error);
        return { success: false };
      }
    },
    [router]
  );

  /**
   * 执行完整的意图识别和路由流程
   * 
   * 注意：
   * - 意图识别阶段使用服务端默认模型（快速、稳定）
   * - 路由后的业务逻辑使用用户选择的模型配置（input.modelId, input.userApiKey 等）
   */
  const executeIntentRouting = useCallback(
    async (input: IntentRouteInput, handlers?: IntentHandlers): Promise<{ success: boolean }> => {
      // 重置状态
      setStatus("detecting");
      setIntentResult(null);

      try {
        // 1. 识别意图（只使用 userPrompt，服务端默认模型）
        const intent = await detectIntent(input);
        setIntentResult(intent);
        
        // 如果识别失败（降级到 chat 且 reason 包含失败信息），设置状态为 error 但不中断
        // 注意：detectIntent 即使失败也会返回一个 chat 意图，所以这里主要看 reason 或 confidence
        if (intent.intent === 'chat' && intent.reason.includes('失败')) {
            setStatus("error");
            // 延迟一下让用户看到错误提示，然后继续执行路由（保底）
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setStatus("routing");
        console.log("[IntentRouter] 意图识别结果", intent);

        // 2. 路由到对应模块（传递完整配置，供后续业务逻辑使用）
        const routeResult = await routeToModule(intent, input, handlers);

        if (routeResult.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }

        return routeResult;
      } catch (error) {
        console.error("[IntentRouter] 流程异常", error);
        setStatus("error");
        return { success: false };
      }
    },
    [detectIntent, routeToModule]
  );

  // 提供重置状态的方法，供 UI 关闭 Overlay 时使用
  const resetStatus = useCallback(() => {
    setStatus("idle");
    setIntentResult(null);
  }, []);

  return {
    executeIntentRouting,
    detectIntent,
    routeToModule,
    // 暴露状态
    status,
    intentResult,
    resetStatus
  };
};
