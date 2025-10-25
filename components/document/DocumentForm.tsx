"use client";

import { TiptapEditor } from "./TiptapEditor";
import type React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// 文档表单属性（现在是受控组件）
interface DocumentFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  promptPrefix: string;
  setPromptPrefix: (prefix: string) => void;
  content: string;
  setContent: (content: string) => void;
}

// 文档表单：Notion 风格的可视化编辑器，现在作为受控组件
export const DocumentForm = ({
  title,
  setTitle,
  description,
  setDescription,
  promptPrefix,
  setPromptPrefix,
  content,
  setContent,
}: DocumentFormProps) => {
  // 记录用户是否手动点击了展开按钮（前置信息）
  const [isPrefixManuallyExpanded, setIsPrefixManuallyExpanded] = useState(false);

  // 派生状态：有内容时自动展开，或者用户手动点击了展开
  const shouldShowPrefixInput = promptPrefix.length > 0 || isPrefixManuallyExpanded;

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
    <article className="max-w-[42rem] mx-auto pt-4 ">
      {/* 标题输入：Notion风格的大标题 */}
      <section className="mb-[4px] ">
        <input
          className="w-full text-4xl font-bold outline-none placeholder:text-gray-300 leading-tight"
          placeholder="无标题"
          value={title}
          onChange={handleTitleChange}
          autoFocus
        />
      </section>

      {/* 描述输入：更加简洁的描述区域 */}
      <section className="mb-[8px]">
        <Textarea
          className="w-full resize-none border-0 shadow-none focus-visible:ring-0 px-0 py-0 !text-[12px] text-gray-400 placeholder:text-gray-300 leading-relaxed min-h-[2.8rem] max-h-[8.9rem] overflow-y-auto"
          placeholder="添加描述..."
          value={description}
          onChange={handleDescriptionChange}
        />
      </section>

      {/* 前置信息：可折叠的输入区域 */}
      <section className="mb-[28px]">
        {!shouldShowPrefixInput ? (
          <button
            onClick={handleExpandPrefix}
            className="flex items-center gap-1 py-1 px-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all duration-150 outline-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>添加前置信息</span>
          </button>
        ) : (
          <div>
            <Textarea
              className="w-full resize-none border-0 shadow-none focus-visible:ring-0 px-0 py-0 !text-[14px] text-gray-600 placeholder:text-gray-300 !leading-[1.4] min-h-[2.8rem] max-h-[8.9rem] overflow-y-auto"
              placeholder="前置信息..."
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
};
