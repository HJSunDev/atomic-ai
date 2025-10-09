"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { DocumentContent } from "@/components/document/DocumentContent";
import { useDocumentStore } from "@/store/home/documentStore";
import { useManageAiContext } from "@/hooks/use-manage-ai-context";
import { AiContext } from "@/store/home/use-ai-context-store";
import { useAiPanelStore } from "@/store";

// 全屏文档页面
export default function DocumentPage() {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen } = useDocumentStore();
  const { setAiPanelVisibility } = useAiPanelStore();

  // 为全屏文档页面定义并管理AI上下文
  const documentPageContext = useMemo<AiContext>(() => ({
    id: "document-fullscreen-module",
    type: "document",
    showCatalyst: true, // 在文档页面，显示全局唤醒器
    catalystPlacement: 'global', // 全屏模式下，使用全局唤醒器
  }), []);

  useManageAiContext(documentPageContext);

  // 根据URL参数打开AI面板，并处理与布局组件的竞态条件
  useEffect(() => {
    if (searchParams.get('openAi') === 'true') {
      // 由于 layout.tsx 中的 useEffect 会在上下文切换时自动关闭AI面板，
      // 我们需要延迟执行打开操作，确保在 layout 的关闭逻辑之后执行
      const openTimer = setTimeout(() => {
        setAiPanelVisibility(true);
      }, 100);
      
      // 清理URL参数
      const cleanupTimer = setTimeout(() => {
        router.replace('/home/prompt-document', { scroll: false });
      }, 150);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [searchParams, router, setAiPanelVisibility]);


  // 检查访问合法性：全屏页面只能在文档已打开时访问
  useEffect(() => {
    if (!isOpen) {
      // 异常访问场景（直接访问URL、刷新等）：重定向到主页
      console.warn('全屏文档未打开，重定向到主页');
      router.replace('/home');
    }
  }, [isOpen, router]);

  return (
    <div className="h-screen flex flex-col bg-green-100">
      <DocumentContent onRequestClose={() => {
        useDocumentStore.getState().close();
      }} />
    </div>
  );
}
