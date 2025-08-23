"use client";

import { useEffect, useMemo, useState } from "react";
import { usePanelStore } from "@/store/ui/panelStore";

// 通用编辑面板：支持 create/edit/preview 模式
export const EditorPanel = () => {
  const { isOpen, type, mode, initialData, onSave, onCancel, close } = usePanelStore();

  const visible = isOpen && Boolean(type) && Boolean(mode);

  const isReadonly = useMemo(() => mode === "preview", [mode]);
  const heading = useMemo(() => {
    if (type === "module") {
      if (mode === "create") return "新建模块";
      if (mode === "edit") return "编辑模块";
      if (mode === "preview") return "预览模块";
    }
    if (type === "artifact") {
      if (mode === "create") return "新建 artifact";
      if (mode === "edit") return "编辑 artifact";
      if (mode === "preview") return "预览 artifact";
    }
    return "详情";
  }, [type, mode]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!visible) return;
    if (initialData && typeof initialData === "object") {
      const data = initialData as { title?: string; description?: string; content?: string };
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setContent(data.content ?? "");
    } else {
      setTitle("");
      setDescription("");
      setContent("");
    }
  }, [visible, initialData]);

  const handleSave = () => {
    if (isReadonly) return;
    const payload = { title, description, content };
    if (onSave) onSave(payload as unknown as never);
    close();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    close();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={handleCancel} />

      <div className="absolute right-0 top-0 h-full w-full sm:w-[720px] max-w-[90vw] bg-white shadow-xl border-l flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="text-sm text-gray-500">{heading}</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm rounded border" onClick={handleCancel}>关闭</button>
            {!isReadonly && (
              <button className="px-3 py-1.5 text-sm rounded bg-black text-white" onClick={handleSave}>保存</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mb-6">
            <input
              className="w-full text-3xl font-bold outline-none placeholder:text-gray-300 disabled:opacity-60"
              placeholder="无标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isReadonly}
            />
          </div>

          <div className="mb-6">
            <textarea
              className="w-full resize-none outline-none text-gray-600 placeholder:text-gray-300 disabled:opacity-60"
              rows={2}
              placeholder="添加描述..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadonly}
            />
          </div>

          <div>
            <textarea
              className="w-full min-h-[300px] outline-none placeholder:text-gray-300 disabled:opacity-60"
              placeholder="输入内容...（后续可替换为富文本/模块化编辑器）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isReadonly}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


