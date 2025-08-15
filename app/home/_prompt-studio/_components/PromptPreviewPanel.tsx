"use client";

import { useState, useEffect } from 'react';
import type { GridItem } from './types';

interface PromptPreviewPanelProps {
  item: GridItem;
  onClose: () => void;
}

export function PromptPreviewPanel({ item, onClose }: PromptPreviewPanelProps) {
  const [fullPrompt, setFullPrompt] = useState('');

  // 根据模块及其子模块生成完整提示词文本
  useEffect(() => {
    const generateFullPrompt = (item: GridItem): string => {
      let result = item.content.trim();
      
      // 如果有子模块，添加子模块内容
      if (item.children && item.children.length > 0) {
        const childrenText = item.children
          .map(child => generateFullPrompt(child))
          .join('\n\n');
        
        if (result && childrenText) {
          result += '\n\n' + childrenText;
        } else if (childrenText) {
          result = childrenText;
        }
      }
      
      return result;
    };
    
    setFullPrompt(generateFullPrompt(item));
  }, [item]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-8 overflow-hidden">
      <div className="bg-white rounded-lg shadow-2xl w-4/5 max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{item.title}</h2>
            <p className="text-gray-500 mt-1">
              包含 {item.children.length} 个子模块的完整提示词
            </p>
          </div>
          <button
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            onClick={onClose}
            aria-label="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-lg max-w-none">
            <h3 className="text-xl font-semibold border-b pb-2 mb-4">提示词内容预览</h3>
            <pre className="whitespace-pre-wrap text-base font-mono bg-gray-50 p-6 rounded border border-gray-200 shadow-inner overflow-auto">
              {fullPrompt}
            </pre>
          </div>
          
          {/* 模块结构可视化 */}
          {item.children.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">模块结构</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-gray-600 text-sm">{item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}</p>
                </div>
                
                {item.children.length > 0 && (
                  <div className="ml-8 mt-4 space-y-3">
                    {item.children.map(child => (
                      <div key={child.id} className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="font-bold">{child.title}</p>
                        <p className="text-gray-600 text-sm">{child.content.substring(0, 80)}{child.content.length > 80 ? '...' : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* 底部 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-medium"
            onClick={onClose}
          >
            关闭预览
          </button>
        </div>
      </div>
    </div>
  );
} 