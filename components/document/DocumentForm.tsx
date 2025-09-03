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
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="max-w-[50rem] mx-auto">
        {/* 标题输入：可直接编辑 */}
        <div className="mb-6">
          <input
            className="w-full text-3xl font-bold outline-none placeholder:text-gray-300"
            placeholder="无标题"
            value={draft.title}
            onChange={handleTitleChange}
            autoFocus
          />
        </div>

        {/* 描述输入：可直接编辑 */}
        <div className="mb-6">
          <textarea
            className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300"
            rows={2}
            placeholder="添加描述..."
            value={draft.description}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* 内容输入：可直接编辑 */}
        <div>
          <textarea
            className="w-full min-h-[300px] outline-none placeholder:text-gray-300 font-mono text-sm"
            placeholder="输入内容...（后续可替换为富文本/模块化编辑器）"
            value={draft.content}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
