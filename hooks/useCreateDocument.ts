"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDocumentStore } from "@/store/home/documentStore";
import { toast } from "sonner";

/**
 * 自定义 Hook：创建文档并根据显示模式打开
 * 
 * 封装了创建文档的完整流程：
 * 1. 调用后端 mutation 创建文档
 * 2. 根据当前显示模式决定打开方式（Store 或路由）
 * 3. 统一的加载状态和错误处理
 * 
 * 使用场景：
 * - "Add new document" 按钮点击
 * - 工具栏快捷创建
 * - 任何需要创建并打开文档的场景
 */
export const useCreateDocument = () => {
  const router = useRouter();
  const { displayMode, openDocument } = useDocumentStore();
  const createMutation = useMutation(api.prompt.mutations.createDocument);
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 创建文档并根据显示模式打开
   * 
   * @returns 创建的文档ID，如果失败返回 null
   */
  const createAndOpen = async (): Promise<string | null> => {
    try {
      setIsCreating(true);
      setError(null);

      const result = await createMutation();
      const documentId = result.documentId;

      if (displayMode === 'fullscreen') {
        router.push(`/home/prompt-document/${documentId}`);
      } else {
        openDocument({ documentId });
      }

      return documentId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建文档失败';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-center',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createAndOpen,
    isCreating,
    error,
  };
};

