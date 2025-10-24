"use client";

import { useDocumentStore } from "@/store/home/documentStore";
import { TiptapEditor } from "./TiptapEditor";
import type React from "react";
import { useEffect, useState } from "react";
import { useAutoSaveDocument } from "@/hooks/useAutoSaveDocument";
import { Plus } from "lucide-react";

// 文档表单属性
interface DocumentFormProps {
  // 文档ID：全屏模式通过 prop 传入，drawer/modal 从 Store 读取
  documentId?: string;
  // 保存状态回调：用于通知父级保存状态信息
  onSavingChange?: (isSaving: boolean) => void;
}

// 文档表单：Notion 风格的可视化编辑器，支持自动保存
export const DocumentForm = ({ documentId: propDocumentId, onSavingChange }: DocumentFormProps) => {
  
  const storeDocumentId = useDocumentStore((s) => s.documentId);
  
  // 优先使用 prop documentId（全屏模式），否则从 Store 读取（drawer/modal）
  const documentId = propDocumentId ?? storeDocumentId;

  // 使用自动保存 Hook，处理数据加载、本地状态管理和防抖保存
  const {
    title,
    setTitle,
    description,
    setDescription,
    promptPrefix,
    setPromptPrefix,
    content,
    setContent,
    isLoading,
    isSaving,
  } = useAutoSaveDocument(documentId ?? null);

  // 记录用户是否手动点击了展开按钮（前置信息）
  const [isPrefixManuallyExpanded, setIsPrefixManuallyExpanded] = useState(false);

  // 派生状态：有内容时自动展开，或者用户手动点击了展开
  const shouldShowPrefixInput = promptPrefix.length > 0 || isPrefixManuallyExpanded;


  // 通知父级保存状态变化
  useEffect(() => {
    onSavingChange?.(isSaving);
  }, [isSaving, onSavingChange]);

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

  // 前置信息变更
  const handlePromptPrefixChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptPrefix(e.target.value);
  };

  // 用户点击 新增前置信息 按钮
  const handleExpandPrefix = () => {
    setIsPrefixManuallyExpanded(true);
  };

  return (
    <article className="max-w-[42rem] mx-auto pt-4 bg-blue-100">
      {/* 标题输入：Notion风格的大标题 */}
      <section className="bg-green-50">
        <input
          className="w-full text-4xl font-bold outline-none placeholder:text-gray-300 leading-tight"
          placeholder="无标题"
          value={title}
          onChange={handleTitleChange}
          autoFocus
        />
      </section>

      {/* 描述输入：更加简洁的描述区域 */}
      <section className="bg-yellow-50">
        <textarea
          className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 leading-relaxed"
          rows={2}
          placeholder="添加描述..."
          value={description}
          onChange={handleDescriptionChange}
        />
      </section>

      {/* 前置信息：可折叠的输入区域 */}
      <section className="bg-purple-50">
        {!shouldShowPrefixInput ? (
          <button
            onClick={handleExpandPrefix}
            className="flex items-center gap-1.5 py-1 px-0 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all duration-150 outline-none"
          >
            <Plus className="h-4 w-4" />
            <span>添加前置信息</span>
          </button>
        ) : (
          <div>
            <textarea
              className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 leading-relaxed text-sm"
              rows={3}
              placeholder="添加前置信息（例如：角色设定、背景信息等）..."
              value={promptPrefix}
              onChange={handlePromptPrefixChange}
            />
          </div>
        )}
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
