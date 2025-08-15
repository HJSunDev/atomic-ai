"use client";

import { useState } from 'react';
import type { GridItem } from './types';

interface PromptDetailPanelProps {
  item: GridItem;
  onClose: () => void;
  onSave: (item: GridItem) => void;
}

export function PromptDetailPanel({ item, onClose, onSave }: PromptDetailPanelProps) {
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  // 编辑表单数据
  const [formData, setFormData] = useState<GridItem>(item);

  // 处理表单数据变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理保存
  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 头部 */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">提示词模块详情</h3>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      setFormData(item);
                      setIsEditing(false);
                    }}
                  >
                    取消
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={handleSave}
                  >
                    保存
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  编辑
                </button>
              )}
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={onClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="space-y-6">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-lg font-medium">{item.title}</p>
              )}
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
              {isEditing ? (
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-600">{item.content}</p>
              )}
            </div>

            {/* 子模块列表 */}
            {item.children && item.children.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3">子模块</h4>
                <div className="space-y-2">
                  {item.children.map(child => (
                    <div
                      key={child.id}
                      className="p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <p className="font-medium">{child.title}</p>
                      <p className="text-sm text-gray-600">{child.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 