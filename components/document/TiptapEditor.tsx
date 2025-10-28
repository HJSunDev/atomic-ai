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

/**
 * 将 JSON 字符串解析为 Tiptap 编辑器可用的内容格式
 * 支持向后兼容：处理空字符串、HTML 字符串和 JSON 字符串
 */
const parseContentFromJSON = (contentString: string): string | object => {
  if (!contentString || contentString.trim() === '') {
    return '';
  }

  try {
    const parsed = JSON.parse(contentString);
    // 验证是否为有效的 Tiptap JSON 结构
    if (parsed && typeof parsed === 'object' && 'type' in parsed) {
      return parsed;
    }
    // 如果不是有效的 Tiptap JSON，返回空字符串
    return '';
  } catch {
    // JSON 解析失败，可能是旧的 HTML 格式或损坏的数据
    // Tiptap 可以直接处理 HTML 字符串，所以返回原字符串
    return contentString;
  }
};

export const TiptapEditor = ({ 
  content, 
  onContentChange, 
  placeholder
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
    content: parseContentFromJSON(content),
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
      const jsonContent = editor.getJSON();
      const jsonString = JSON.stringify(jsonContent);
      onContentChange(jsonString);
    },
  });

  // 当外部content变化时，更新编辑器内容
  useEffect(() => {
    if (!editor) return;

    const currentContentJSON = JSON.stringify(editor.getJSON());
    
    // 比较当前编辑器的 JSON 内容与外部传入的 content
    if (content !== currentContentJSON) {
      const parsedContent = parseContentFromJSON(content);
      editor.commands.setContent(parsedContent);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
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
