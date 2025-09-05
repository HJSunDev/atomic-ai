"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DocumentContent } from "@/components/document/DocumentContent";
import { useDocumentStore } from "@/store/home/documentStore";

// 全屏文档页面
export default function DocumentPage() {
  
  const router = useRouter();
  const { isOpen } = useDocumentStore();


  // 检查访问合法性：全屏页面只能在文档已打开时访问
  useEffect(() => {
    if (!isOpen) {
      // 异常访问场景（直接访问URL、刷新等）：重定向到主页
      console.warn('全屏文档页面需要先打开文档，重定向到主页');
      router.replace('/home');
    }
  }, [isOpen, router]);

  return (
    <div className="h-screen flex flex-col bg-green-100">
      <DocumentContent onRequestClose={() => {
        useDocumentStore.getState().close();
        router.push('/home');
      }} />
    </div>
  );
}
