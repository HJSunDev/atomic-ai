"use client";

import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code,
  Zap
} from 'lucide-react';

interface BubbleMenuBarProps {
  editor: Editor | null;
}

/**
 * BubbleMenuBar
 * 
 * 当用户选中文本时显示，提供文本格式化选项和自定义功能
 * 
 */
export const BubbleMenuBar = ({ editor }: BubbleMenuBarProps) => {
  if (!editor) {
    return null;
  }

  // 基础格式化按钮
  const formatItems = [
    {
      icon: Bold,
      label: '加粗',
      isActive: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: '斜体',
      isActive: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Strikethrough,
      label: '删除线',
      isActive: editor.isActive('strike'),
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: Code,
      label: '代码',
      isActive: editor.isActive('code'),
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
  ];

  // AI 功能按钮
  const aiItems = [
    {
      icon: Zap, 
      label: 'AI',
      isActive: false,
      onClick: () => {
        const { from, to, empty } = editor.state.selection;
        if (empty) return;
        
        // 获取选中的文本
        const text = editor.state.doc.textBetween(from, to, ' ');
        console.log('Selected text for AI:', text);
      },
    },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-1 py-1">
      
      {/* AI 功能按钮组 */}
      
       {aiItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={`ai-${index}`}
            onClick={item.onClick}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors duration-150 focus:outline-none cursor-pointer
              text-gray-600 hover:bg-gray-100 hover:text-gray-900
            `}
            aria-label={item.label}
            title={item.label}
            type="button"
          >
            <Icon className="h-3.5 w-3.5" /> 
            <span className="text-xs font-medium">AI</span>
          </button>
        );
      })}

      {/* 分隔线 */}
      <div className="w-px h-4 bg-gray-200 mx-1" />

      {/* 格式化按钮组 */}
      {formatItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={`fmt-${index}`}
            onClick={item.onClick}
            className={`
              p-1 rounded-md text-sm transition-colors duration-150 focus:outline-none cursor-pointer
              ${item.isActive 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
            `}
            aria-label={item.label}
            title={item.label}
            type="button"
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};
