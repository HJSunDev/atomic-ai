"use client";

import { Editor } from '@tiptap/react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote 
} from 'lucide-react';

interface FloatingMenuBarProps {
  editor: Editor | null;
}

/**
 * FloatingMenuBar
 * 
 * 当用户在空段落处创建新行时显示，提供快速插入不同类型内容块的选项
 */
export const FloatingMenuBar = ({ editor }: FloatingMenuBarProps) => {
  if (!editor) {
    return null;
  }

  // 菜单项配置：图标、标签、命令
  const menuItems = [
    {
      icon: Heading1,
      label: '一级标题',
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      icon: Heading2,
      label: '二级标题',
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3,
      label: '三级标题',
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: List,
      label: '无序列表',
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: '有序列表',
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: Quote,
      label: '引用块',
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg p-0.5">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:bg-gray-50 active:bg-gray-100 cursor-pointer"
            aria-label={item.label}
            title={item.label}
          >
            <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />
          </button>
        );
      })}
    </div>
  );
};

