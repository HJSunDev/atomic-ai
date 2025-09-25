"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { DocumentContent } from "@/components/document/DocumentContent";
import { useDocumentStore } from "@/store/home/documentStore";
import { useManageAiContext } from "@/hooks/use-manage-ai-context";
import { AiContext } from "@/store/home/use-ai-context-store";

// 全屏文档页面
export default function DocumentPage() {
  
  const router = useRouter();
  const { isOpen } = useDocumentStore();

  // 为全屏文档页面定义并管理AI上下文
  const documentPageContext = useMemo<AiContext>(() => ({
    id: "document-fullscreen-module",
    type: "document",
    showAiAssistant: true, // 在文档页面，AI助手是核心功能
    catalystPlacement: 'global', // 全屏模式下，使用全局唤醒器
  }), []);

  useManageAiContext(documentPageContext);


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
