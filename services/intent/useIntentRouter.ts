import { useCallback, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { IntentResult, IntentRouteInput, IntentType, IntentHandlers } from "./types";
import { useChatIntentHandler, useDocumentIntentHandler, useAppIntentHandler } from "./handlers";

/**
 * 意图识别超时时间（毫秒）
 * 如果超过此时间仍未返回结果，将降级到默认模式
 */
const INTENT_DETECTION_TIMEOUT = 5000; // 5秒

/**
 * 路由状态类型
 */
export type RoutingStatus = "idle" | "detecting" | "routing" | "success" | "error";

/**
 * 路由配置选项
 */
export interface RouterOptions {
  /**
   * 识别失败时的默认意图
   * @default "chat"
   */
  defaultIntent?: IntentType;

  /**
   * 强制指定意图（手动模式）
   * 如果提供此参数且不为 "auto"，将跳过 AI 识别，直接使用此意图
   */
  manualIntent?: IntentType | "auto";
}

/**
 * 意图识别和路由 Hook
 * 
 * 职责：
 * 1. 调用后端意图识别服务（使用服务端默认模型）
 * 2. 解析 AI 返回的结构化结果
 * 3. 根据识别结果分发给对应的处理器 (Handlers)
 * 4. 提供保底策略（可配置默认意图）
 * 5. 提供详细的状态管理供 UI 展示
 * 
 * 特性：
 * - 内置所有业务模块的默认处理器 (Chat, Document, App)
 * - 支持通过参数覆盖默认处理器
 */
export const useIntentRouter = () => {
  const executeTask = useAction(api.chat.action.executeTask);
  
  // 状态管理
  const [status, setStatus] = useState<RoutingStatus>("idle");
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);

  // 预装配所有业务处理器
  const { handleChatIntent } = useChatIntentHandler();
  const { handleDocumentIntent } = useDocumentIntentHandler();
  const { handleAppIntent } = useAppIntentHandler();

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
    async (input: IntentRouteInput, options?: RouterOptions): Promise<IntentResult> => {
      const startTime = Date.now();
      const defaultIntent = options?.defaultIntent || "chat";
      
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
          console.warn(`[IntentRouter] 意图识别失败，降级到 ${defaultIntent}`, {
            error: result.error,
            duration,
          });
          return {
            intent: defaultIntent,
            confidence: 0,
            reason: "识别失败，使用默认模式",
            summary: input.userPrompt.slice(0, 50),
          };
        }

        // 尝试解析结构化结果
        const parsed = parseIntentResult(result.data);
        
        if (!parsed) {
          console.warn(`[IntentRouter] 无法解析意图结果，降级到 ${defaultIntent}`, {
            rawData: result.data,
            duration,
          });
          return {
            intent: defaultIntent,
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
          intent: defaultIntent,
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
    async (intent: IntentResult, input: IntentRouteInput, handlers: IntentHandlers): Promise<{ success: boolean }> => {
      try {
        const handler = handlers[intent.intent];
        
        if (handler) {
            console.log(`[IntentRouter] 路由匹配成功: ${intent.intent}`);
            const success = await handler(intent, input);
            return { success };
        }

        console.warn(`[IntentRouter] 未找到意图 ${intent.intent} 的处理器`);
        return { success: false };
      } catch (error) {
        console.error("[IntentRouter] 路由执行失败", error);
        return { success: false };
      }
    },
    []
  );

  /**
   * 执行完整的意图识别和路由流程
   * 
   * @param input 用户输入
   * @param options 配置项（可选）
   * @param customHandlers 自定义处理器（可选，将与默认处理器合并）
   */
  const executeIntentRouting = useCallback(
    async (input: IntentRouteInput, options: RouterOptions = { defaultIntent: "chat" }, customHandlers?: Partial<IntentHandlers>): Promise<{ success: boolean }> => {
      // 重置状态
      setStatus("detecting");
      setIntentResult(null);

      // 合并处理器：优先使用传入的 customHandlers，否则使用内置默认处理器
      const finalHandlers: IntentHandlers = {
        chat: customHandlers?.chat || handleChatIntent,
        document: customHandlers?.document || handleDocumentIntent,
        app: customHandlers?.app || handleAppIntent,
      };

      try {
        let intent: IntentResult;

        // 检查是否开启手动模式 (且不是 auto)
        if (options.manualIntent && options.manualIntent !== "auto") {
          console.log(`[IntentRouter] 手动模式激活: ${options.manualIntent}`);
          // 构造一个"伪造"的意图结果
          intent = {
            intent: options.manualIntent,
            confidence: 1,
            reason: "User manual selection",
            summary: input.userPrompt.slice(0, 50),
          };
          // 为了体验连贯性，稍微给一点点延迟（可选，模拟处理感）
          await new Promise(r => setTimeout(r, 300));
        } else {
          // 1. 识别意图（只使用 userPrompt，服务端默认模型）
          intent = await detectIntent(input, options);
        }

        setIntentResult(intent);
        
        // 如果是保底情况（confidence 0），可能需要短暂展示错误状态
        if (intent.confidence === 0 && intent.reason.includes('失败')) {
            setStatus("error");
            // 延迟一下让用户看到错误提示，然后继续执行路由（保底）
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setStatus("routing");
        
        // 2. 路由到对应模块
        const routeResult = await routeToModule(intent, input, finalHandlers);

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
    [detectIntent, routeToModule, handleChatIntent, handleDocumentIntent, handleAppIntent]
  );

  // 提供重置状态的方法，供 UI 关闭 Overlay 时使用
  const resetStatus = useCallback(() => {
    setStatus("idle");
    setIntentResult(null);
  }, []);

  return {
    // 核心执行方法
    executeIntentRouting,
    
    // 状态
    status,
    intentResult,
    resetStatus,
    
    // 暴露底层方法（高级用法）
    detectIntent,
  };
};
