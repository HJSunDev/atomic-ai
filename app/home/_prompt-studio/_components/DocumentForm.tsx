"use client";

import { useDocumentStore } from "@/store/home/documentStore";

// 文档表单：纯表单组件，只关心数据输入与展示
export const DocumentForm = () => {
  const {
    draft,
    isReadonly,
    setDraft,
    handleSave,
    handleCancel,
  } = useDocumentStore();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft({ title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft({ description: e.target.value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft({ content: e.target.value });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {isReadonly ? '预览模式' : '编辑模式'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="px-3 py-1.5 text-sm rounded border hover:bg-gray-50" 
            onClick={handleCancel}
          >
            关闭
          </button>
          {!isReadonly && (
            <button 
              className="px-3 py-1.5 text-sm rounded bg-black text-white hover:bg-gray-800" 
              onClick={handleSave}
            >
              保存
            </button>
          )}
        </div>
      </div>

      {/* 表单内容区 */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-[50rem] mx-auto">
          {/* 标题输入 */}
          <div className="mb-6">
            <input
              className="w-full text-3xl font-bold outline-none placeholder:text-gray-300 disabled:opacity-60"
              placeholder="无标题"
              value={draft.title}
              onChange={handleTitleChange}
              disabled={isReadonly}
              autoFocus
            />
          </div>

          {/* 描述输入 */}
          <div className="mb-6">
            <textarea
              className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 disabled:opacity-60"
              rows={2}
              placeholder="添加描述..."
              value={draft.description}
              onChange={handleDescriptionChange}
              disabled={isReadonly}
            />
          </div>

          {/* 内容输入 */}
          <div>
            <textarea
              className="w-full min-h-[300px] outline-none placeholder:text-gray-300 disabled:opacity-60 font-mono text-sm"
              placeholder="输入内容...（后续可替换为富文本/模块化编辑器）"
              value={draft.content}
              onChange={handleContentChange}
              disabled={isReadonly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
