"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import type { EditorState } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { FloatingMenuBar } from './FloatingMenuBar';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import './tiptap-editor.css';

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
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
  placeholder,
  editable = true
}: TiptapEditorProps) => {

  // 浮动菜单的key,用更新key的方式来强制刷新 菜单的显示,用来处理中文输入 shouldShow 不执行的问题
  const [floatingMenuKey, setFloatingMenuKey] = useState(0);

  
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
      // Placeholder扩展
      Placeholder.configure({
        placeholder,
      }),
      // 表格支持
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: parseContentFromJSON(content),
    // 修复SSR水合错误：在Next.js SSR环境中禁用立即渲染，避免服务端和客户端渲染不匹配
    immediatelyRender: false,
    // 根据 prop 控制编辑器可编辑状态
    editable,
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none',
        'spellcheck': 'false',
      },
      // 监听 DOM 事件
      handleDOMEvents: {
        // 当合成开始时,强制刷新浮动菜单
        compositionstart: (view, event) => {

          setFloatingMenuKey(prevKey => prevKey + 1);
          return false;
        },
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

  // 当 editable 状态变化时，更新编辑器
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

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

      {/* FloatingMenu：输入斜杠 `/` 时显示 */}
      {editor && (
        <FloatingMenu
          editor={editor}
          key={floatingMenuKey}
          shouldShow={({ state, view }: { state: EditorState; view: EditorView }) => {
            const { selection } = state;
            const { $from, empty } = selection;

            // 如果有内容，不需要显示，直接结束
            if (!empty) {
              return false;
            }

            // 检查编辑器是否处于聚焦状态
            if (!view.hasFocus()) {
              return false;
            }

            // 获取光标前的文本内容
            const textBefore = $from.nodeBefore?.text || '';
            
            // 检查光标前是否有 `/` 字符
            // 只有当输入 `/` 且后面没有其他字符时才显示菜单
            if (textBefore.endsWith('/')) {
              return true;
            }

            return false;
          }}
        >
          <FloatingMenuBar editor={editor} />
        </FloatingMenu>
      )}
    </div>
  );
};
