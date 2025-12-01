import { useCallback } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { IntentHandler } from "@/services/intent/types";

/**
 * App/Factory 模块意图处理器 Hook
 * 
 * 职责：
 * 1. 处理路由到 Factory 模块的逻辑
 * 2. 创建新应用并跳转到应用编辑页面
 * 3. 使用意图识别的 summary 作为应用名称
 * 
 * 路由方式：
 * Factory 模块使用 URL 路由（而非菜单状态），通过 router.push 跳转
 */
export const useAppIntentHandler = () => {
  const router = useRouter();
  const createApp = useMutation(api.factory.mutations.createApp);

  const handleAppIntent: IntentHandler = useCallback(async (intent, input) => {
    console.log("[AppIntentHandler] 路由到 app/factory 模块，开始创建应用...");
    
    try {
      // 1. 创建新应用
      // 使用意图识别的 summary 作为应用名称，用户输入的 prompt 作为初始 prompt
      const appId = await createApp({
        prompt: input.userPrompt,
        name: intent.summary || "未命名应用",
      });
      
      // 2. 跳转到应用编辑页面（URL 路由）
      router.push(`/home/factory/${appId}`);
      
      // 注意：代码生成将在应用页面内由用户手动触发
      // 这样更符合现有流程，用户可以在应用页面内看到空状态提示并输入需求
      
      return true;
    } catch (error) {
      console.error("[AppIntentHandler] 处理失败:", error);
      return false;
    }
  }, [createApp, router]);

  return { handleAppIntent };
};

