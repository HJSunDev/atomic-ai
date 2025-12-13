"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { DocumentContent, type DocumentContentHandle } from "@/components/document/DocumentContent";
import { useManageAiContext } from "@/hooks/useAiContext";
import { AiContext, AiMessage } from "@/store/home/use-ai-context-store";
import { useAiPanelStore } from "@/store";
import { ArrowLeft } from "lucide-react";

// 全屏文档页面（动态路由）
export default function DocumentDynamicPage() {
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { setAiPanelVisibility } = useAiPanelStore();
  
  // 从路由参数获取文档ID（URL即状态）
  const documentId = params.id as string;

  // 引用文档内容组件句柄，用于执行内部操作
  const contentRef = useRef<DocumentContentHandle>(null);

  // 为全屏文档页面定义并管理AI上下文（每个文档独立上下文）
  const documentPageContext = useMemo<AiContext>(() => ({
    id: `document-fullscreen-${documentId}`,
    type: "document",
    showCatalyst: true,
    catalystPlacement: 'global',
    
    // 注入场景动作：将 AI 输出添加到文档结尾
    // 通过 ref 调用子组件暴露的方法，既保持了 Context 定义在父级，又复用了子组件逻辑
    sceneActions: [
      {
        id: 'append-to-end',
        tooltip: '插入到文档',
        icon: ArrowLeft,
        // 只有当消息非空时才显示
        shouldShow: (msg: AiMessage) => !!msg.content,
        handler: (msg: AiMessage) => {
          contentRef.current?.appendContent(msg.content);
        }
      }
    ]
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
        ref={contentRef}
        documentId={documentId}
        onRequestClose={() => {
          // 关闭全屏模式：返回首页
          router.push('/home');
        }} 
      />
    </div>
  );
}

