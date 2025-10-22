"use client";

import { useDocumentStore } from "@/store/home/documentStore";
import { TiptapEditor } from "./TiptapEditor";
import type React from "react";
import { useAutoSaveDocument } from "@/hooks/useAutoSaveDocument";

// 文档表单属性
interface DocumentFormProps {
  // 文档ID：全屏模式通过 prop 传入，drawer/modal 从 Store 读取
  documentId?: string;
}

// 文档表单：Notion 风格的可视化编辑器，支持自动保存
export const DocumentForm = ({ documentId: propDocumentId }: DocumentFormProps) => {
  
  const storeDocumentId = useDocumentStore((s) => s.documentId);
  
  // 优先使用 prop documentId（全屏模式），否则从 Store 读取（drawer/modal）
  const documentId = propDocumentId ?? storeDocumentId;

  // 使用自动保存 Hook，处理数据加载、本地状态管理和防抖保存
  const {
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    isLoading,
    isSaving,
  } = useAutoSaveDocument(documentId ?? null);

  // 标题变更
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // 描述变更
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  // 富文本内容变更
  const handleContentChange = (nextContent: string) => {
    setContent(nextContent);
  };

  return (
    <article className="max-w-[42rem] mx-auto pt-4 bg-blue-100">
      {/* 保存状态指示器：Notion 风格的简洁提示 */}
      {isSaving && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
          <span>保存中...</span>
        </div>
      )}

      {/* 标题输入：Notion风格的大标题 */}
      <section className="">
        <input
          className="w-full text-4xl font-bold outline-none placeholder:text-gray-300 leading-tight"
          placeholder="无标题"
          value={title}
          onChange={handleTitleChange}
          autoFocus
        />
      </section>

      {/* 描述输入：更加简洁的描述区域 */}
      <section className="">
        <textarea
          className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 leading-relaxed"
          rows={2}
          placeholder="添加描述..."
          value={description}
          onChange={handleDescriptionChange}
        />
      </section>

      {/* 富文本编辑器：Notion风格的富文本编辑 */}
      <section>
        <TiptapEditor
          content={content}
          onContentChange={handleContentChange}
          placeholder="开始写作..."
        />
      </section>
    </article>
  );
}
