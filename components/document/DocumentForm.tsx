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
  // 追踪用户是否正在编辑前置信息，用于显示/隐藏和动态调整高度
  const [isEditingPrefix, setIsEditingPrefix] = useState(false);

  // 派生状态：有内容或正在编辑时，显示输入框
  const shouldShowPrefixInput = promptPrefix.length > 0 || isEditingPrefix;

  // 根据是否正在编辑以及内容行数，动态计算输入框的高度 class
  // - 编辑时，或内容超过1行时，最小高度为2行
  // - 非编辑状态且内容为1行时，最小高度为1行
  const hasSingleLine = !promptPrefix.includes('\n');
  const prefixHeightClass = (isEditingPrefix || !hasSingleLine)
    ? 'min-h-[2.8rem]'
    : 'min-h-[1.2rem]';

  // 编辑状态下的视觉样式：增加一个轻微的背景和内边距，使其与周围区分开
  const prefixEditingClass = isEditingPrefix ? 'bg-gray-50 rounded-md p-2' : 'px-0';

  // 追踪用户是否正在编辑描述，用于显示/隐藏和动态调整高度
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // 派生状态：根据描述内容的行数和编辑状态，动态计算其样式
  const descriptionHasLessThanTwoLines = description.length === 0 || !description.includes('\n');
  const descriptionHeightClass = (isEditingDescription || !descriptionHasLessThanTwoLines) ? 'min-h-[2.8rem]' : 'min-h-[1.2rem]';
  const descriptionEditingClass = isEditingDescription ? 'bg-gray-50 rounded-md p-2' : 'px-0';

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
          className={`w-full resize-none border-0 shadow-none focus-visible:ring-0 py-0 !text-[12px] text-gray-400 placeholder:text-gray-300 leading-relaxed max-h-[8.9rem] overflow-y-auto ${descriptionHeightClass} ${descriptionEditingClass}`}
          placeholder="添加描述..."
          value={description}
          onChange={handleDescriptionChange}
          onFocus={() => setIsEditingDescription(true)}
          onBlur={() => setIsEditingDescription(false)}
        />
      </section>

      {/* 前置信息：可折叠的输入区域 */}
      <section className="mb-[16px]">
        {!shouldShowPrefixInput ? (
          <button
            onClick={() => setIsEditingPrefix(true)}
            className="flex items-center gap-1 py-1 px-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all duration-150 outline-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>添加前置信息</span>
          </button>
        ) : (
          <div>
            <Textarea
              className={`w-full resize-none border-0 shadow-none focus-visible:ring-0 py-0 !text-[14px] text-gray-600 placeholder:text-gray-300 !leading-[1.4] max-h-[8.9rem] overflow-y-auto ${prefixHeightClass} ${prefixEditingClass}`}
              placeholder="前置信息..."
              value={promptPrefix}
              onChange={handlePromptPrefixChange}
              onFocus={() => setIsEditingPrefix(true)}
              onBlur={() => setIsEditingPrefix(false)}
              autoFocus={isEditingPrefix}
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
