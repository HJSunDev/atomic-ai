"use client";

import { useDocumentStore } from "@/store/home/documentStore";
import { TiptapEditor } from "./TiptapEditor";
import type React from "react";
import { useEffect, useState } from "react";
import { fetchDocumentById } from "@/lib/document-api";

// 文档表单属性：目前无需外部关闭回调
interface DocumentFormProps {}

// 文档表单：默认可编辑，像 Notion 一样可视即编辑；不包含保存逻辑
export const DocumentForm = ({}: DocumentFormProps) => {
  
  const documentId = useDocumentStore((s) => s.documentId);

  // 本地文档状态，仅在组件内维护，不与全局Store同步
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // 当 documentId 变化时，按需获取占位数据
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!documentId) {
        setTitle("");
        setDescription("");
        setContent("");
        return;
      }
      const doc = await fetchDocumentById(documentId);
      if (cancelled) return;
      setTitle(doc.title || "");
      setDescription(doc.description || "");
      setContent(doc.content || "");
    };
    load();
    return () => { cancelled = true; };
  }, [documentId]);

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
