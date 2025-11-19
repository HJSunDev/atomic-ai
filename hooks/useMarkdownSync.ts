import { useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { jsonToMarkdownV2 } from "@/lib/markdown";

/**
 * 自定义 Hook：惰性同步 Markdown 缓存
 * 
 * 目的：
 * 将编辑器内容转换为 Markdown 并缓存到数据库，用于 AI 上下文构建。
 * 
 * 策略：
 * - 仅在用户停止输入 5 秒后触发（防抖）
 * - 或在组件卸载/切换文档时强制触发（收尾）
 * - 与实时 JSON 保存解耦，避免阻塞主编辑流程
 */
export function useMarkdownSync(
  documentId: string | undefined,
  editor: Editor | null
) {
  const updateDocumentMarkdown = useMutation(api.prompt.mutations.updateDocumentContentMarkdown);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  const syncMarkdown = async () => {
    if (!editor || !documentId) return;
    
    try {
      // 1. 前端计算 (但在空闲时执行)
      const json = editor.getJSON();
      const markdown = jsonToMarkdownV2(json);
      
      // 2. 发送请求
      await updateDocumentMarkdown({
        documentId: documentId as Id<"documents">,
        contentMarkdown: markdown,
      });
      
      isDirtyRef.current = false;
    } catch (error) {
      console.error("Failed to sync markdown:", error);
    }
  };

  useEffect(() => {
    if (!editor || !documentId) return;

    const handleUpdate = () => {
      isDirtyRef.current = true;
      
      // 清除上一次的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 开启新的"慢"定时器
      timerRef.current = setTimeout(() => {
        syncMarkdown();
      }, 3000);
    };

    editor.on("update", handleUpdate);

    // 【新增】挂载时触发一次惰性同步，修复“上次意外关闭导致 MD 落后”的问题
    // 如果用户在 5 秒内开始输入，handleUpdate 会清除这个 timer 并接管同步逻辑
    timerRef.current = setTimeout(() => {
      syncMarkdown();
    }, 1000);

    // 清理函数：组件卸载或文档切换时，如果还有未保存的变更，强制同步一次
    return () => {
      editor.off("update", handleUpdate);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // 如果有脏数据，尝试最后一次同步
      if (isDirtyRef.current) {
        // 这里的调用 "fire and forget"，虽然无法保证在页面关闭时一定成功，
        // 但在路由切换场景下是有效的。
        syncMarkdown(); 
      }
    };
  }, [editor, documentId]);
}

