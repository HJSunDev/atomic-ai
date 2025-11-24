import { useEffect } from "react";
import { useAiContextStore, AiContext } from "@/store/home/use-ai-context-store";

/**
 * 一个用于自动化管理AI上下文生命周期的React Hook。
 * 当组件挂载时，它会将提供的上下文推入全局上下文堆栈；
 * 当组件卸载时，它会自动将该上下文从堆栈中弹出。
 * 
 * @param context - 要管理的AI上下文对象。为保证useEffect的稳定性，
 *                  强烈建议在调用此Hook的组件中使用 `useMemo` 来创建此对象，
 *                  以避免因对象在每次渲染时重新创建而导致的useEffect不必要地重复执行。
 *                  如果传入 null，则此Hook不执行任何操作。
 */
export function useManageAiContext(context: AiContext | null) {
  const { pushContext, popContext } = useAiContextStore();

  useEffect(() => {
    // 仅当提供了有效的上下文时才执行操作
    if (context) {
      // 组件挂载或上下文更新时，推入上下文
      pushContext(context);

      // 返回一个清理函数，在组件卸载时执行
      return () => {
        popContext(context.id);
      };
    }
  // 依赖项数组包含了上下文对象和store的方法。
  // 当上下文对象（通过 useMemo 保证其稳定性）或 store 的方法（通常是稳定的）改变时，
  // effect 会重新执行。
  }, [context, pushContext, popContext]);
}
