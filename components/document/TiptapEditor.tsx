"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import './tiptap-editor.css';

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
}

export const TiptapEditor = ({ 
  content, 
  onContentChange, 
  placeholder = "开始写作..." 
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 配置基础功能
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      // Placeholder扩展：按照官方文档的简单配置
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    // 修复SSR水合错误：在Next.js SSR环境中禁用立即渲染，避免服务端和客户端渲染不匹配
    immediatelyRender: false,
    // 确保编辑器是可编辑的
    editable: true,
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none',
        'spellcheck': 'false',
      },
    },
    onUpdate: ({ editor }) => {
      // 获取编辑器内容并传递给父组件
      const htmlContent = editor.getHTML();
      onContentChange(htmlContent);
    },
  });

  // 当外部content变化时，更新编辑器内容
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // 如果content为空字符串，设置为空以确保placeholder显示
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative bg-red-100">
      {/* Notion风格的编辑器容器 */}
      <div className="min-h-[400px] w-full">
        <EditorContent 
          editor={editor}
          className="w-full min-h-[400px] tiptap-editor"
        />
      </div>

      {/* 悬浮工具栏 - Notion风格的简洁工具栏 */}
      {editor && (
        <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* 这里可以添加格式化工具栏，目前保持简洁 */}
        </div>
      )}
    </div>
  );
};
