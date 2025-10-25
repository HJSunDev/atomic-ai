"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { DocumentContent } from "@/components/document/DocumentContent";
import { useManageAiContext } from "@/hooks/use-manage-ai-context";
import { AiContext } from "@/store/home/use-ai-context-store";
import { useAiPanelStore } from "@/store";

// 全屏文档页面（动态路由）
export default function DocumentDynamicPage() {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { setAiPanelVisibility } = useAiPanelStore();
  
  // 从路由参数获取文档ID（URL即状态）
  const documentId = params.id as string;

  // 为全屏文档页面定义并管理AI上下文（每个文档独立上下文）
  const documentPageContext = useMemo<AiContext>(() => ({
    id: `document-fullscreen-${documentId}`,
    type: "document",
    showCatalyst: true,
    catalystPlacement: 'global',
  }), [documentId]);

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
        router.replace(`/home/prompt-document/${documentId}`, { scroll: false });
      }, 150);

      return () => {
        clearTimeout(openTimer);
        clearTimeout(cleanupTimer);
      };
    }
  }, [searchParams, router, setAiPanelVisibility, documentId]);

  return (
    <div className="h-screen flex flex-col">
      <DocumentContent 
        documentId={documentId}
        onRequestClose={() => {
          // 关闭全屏模式：返回首页
          router.push('/home');
        }} 
      />
    </div>
  );
}

