import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/store/home/useChatStore";

// 行内 API Key 编辑/展示组件：独立、可移除
export function ApiKeyInlineEditor() {
  // 1. 读取全局状态
  const { userApiKey, setUserApiKey } = useChatStore();

  // 2. 组件内部状态
  const [isEditing, setIsEditing] = useState(false);
  const [showPlain, setShowPlain] = useState(false);
  // 临时输入值，用于避免高频更新全局 store 和 localStorage
  const [inputValue, setInputValue] = useState(userApiKey || "");

  // 当进入编辑模式时，同步一次外部状态到内部
  useEffect(() => {
    if (isEditing) {
      setInputValue(userApiKey || "");
    }
  }, [isEditing, userApiKey]);

  // 掩码文本（避免泄露真实长度）
  const masked = useMemo(() => "••••••••••", []);

  // 提交并退出编辑模式
  const handleCommit = () => {
    setUserApiKey(inputValue.trim() || null);
    setIsEditing(false);
  };
  
  // 无 Key：显示钥匙图标，点击进入编辑态
  if (!userApiKey && !isEditing) {
    return (
      <div className="flex-1 min-w-0 flex items-center justify-end">
        <button
          className="w-5 h-5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer transition-colors"
          title="设置 API Key"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <KeyRound className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    );
  }

  // 编辑态：行内输入框
  if (isEditing) {
    return (
      <div className="flex-1 min-w-0 flex items-center justify-end">
        <Input
          autoFocus
          type={showPlain ? "text" : "password"}
          placeholder="请输入您的 API Key"
          className="h-6 text-xs max-w-full border-transparent focus-visible:border-transparent focus-visible:ring-0 bg-transparent hover:bg-gray-100/60 dark:hover:bg-gray-800/60 focus-visible:bg-gray-100 dark:focus-visible:bg-gray-800 rounded-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommit();
            if (e.key === "Escape") setIsEditing(false);
          }}
          aria-label="API Key"
        />
        {/* 显示/隐藏切换 */}
        <button
          className="w-5 h-5 ml-[1px] rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center cursor-pointer"
          onClick={() => setShowPlain((v) => !v)}
          title={showPlain ? "隐藏" : "显示"}
        >
          {showPlain ? (
            <EyeOff className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
    );
  }

  // 展示态（已有 Key）：掩码 + 显示/隐藏按钮；点击掩码进入编辑
  return (
    <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
      <button
        className="max-w-full min-w-0 text-[11px] text-gray-600 dark:text-gray-400 truncate text-left"
        onClick={() => setIsEditing(true)}
        title="点击修改 API Key"
      >
        {showPlain ? userApiKey : masked}
      </button>
      <button
        className="w-5 h-5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
        onClick={() => setShowPlain((v) => !v)}
        title={showPlain ? "隐藏" : "显示"}
      >
        {showPlain ? (
          <EyeOff className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        ) : (
          <Eye className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
    </div>
  );
}
