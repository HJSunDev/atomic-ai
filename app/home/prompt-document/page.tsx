"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DocumentForm } from "../_prompt-studio/_components/DocumentForm";
import { useDocumentStore } from "@/store/home/documentStore";

// 全屏文档页面
export default function DocumentPage() {
  const router = useRouter();
  const { isOpen, open, setDisplayMode } = useDocumentStore();

  useEffect(() => {
    // 全屏页强制设置为 fullscreen 显示
    setDisplayMode("fullscreen");
    // 若未打开，则打开（使用全局默认展示草稿）
    if (!isOpen) {
      open();
    }
  }, [isOpen, open, setDisplayMode]);

  // 返回按钮处理
  const handleBack = () => {
    router.push('/home'); // 返回到主页面
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="h-8 w-8 rounded border flex items-center justify-center text-sm text-gray-500 bg-white hover:bg-gray-50"
            title="返回"
          >
            ←
          </button>
          <span className="text-sm text-gray-500">全屏文档</span>
        </div>
        <div className="text-xs text-gray-400">
          按 ESC 或点击返回按钮退出全屏
        </div>
      </div>

      {/* 文档内容 */}
      <div className="flex-1 overflow-hidden">
        <DocumentForm />
      </div>
    </div>
  );
}
