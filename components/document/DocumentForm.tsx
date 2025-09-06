"use client";

import { useDocumentStore } from "@/store/home/documentStore";
import type React from "react";

// 文档表单属性：目前无需外部关闭回调
interface DocumentFormProps {}

// 文档表单：默认可编辑，像 Notion 一样可视即编辑；不包含保存逻辑
export const DocumentForm = ({}: DocumentFormProps) => {
  
  const { draft, setDraft } = useDocumentStore();

  // 标题变更
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft({ title: e.target.value });
  };

  // 描述变更
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDraft({ description: e.target.value });
  };

  // 内容变更
  const handleContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDraft({ content: e.target.value });
  };

  return (
    <div className="max-w-[42rem] mx-auto pt-4 bg-blue-100">
      {/* 标题输入：Notion风格的大标题 */}
      <div className="mb-8">
        <input
          className="w-full text-4xl font-bold outline-none placeholder:text-gray-300 leading-tight"
          placeholder="无标题"
          value={draft.title}
          onChange={handleTitleChange}
          autoFocus
        />
      </div>

      {/* 描述输入：更加简洁的描述区域 */}
      <div className="mb-8">
        <textarea
          className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 leading-relaxed"
          rows={2}
          placeholder="添加描述..."
          value={draft.description}
          onChange={handleDescriptionChange}
        />
      </div>

      {/* 内容输入：更加现代的编辑区域 */}
      <div>
        <textarea
          className="w-full min-h-[400px] outline-none placeholder:text-gray-300 text-gray-800 leading-relaxed resize-none"
          placeholder="开始写作..."
          value={draft.content}
          onChange={handleContentChange}
        />
      </div>


    </div>
  );
}
