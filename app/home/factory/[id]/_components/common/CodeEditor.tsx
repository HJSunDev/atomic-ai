"use client";

import { Editor, OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { emmetHTML } from "emmet-monaco-es";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  className?: string;
  readOnly?: boolean;
  // 配置选项
  showLineNumbers?: boolean; // 是否显示行号
  theme?: 'light' | 'dark' | 'system'; // 强制指定主题，默认为 'system' 跟随系统
}

export const CodeEditor = ({ 
  value, 
  onChange,
  language = "html",
  className,
  readOnly = false,
  showLineNumbers = true,
  theme: forcedTheme = 'dark'
}: CodeEditorProps) => {

  const { theme: systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 全局标记，避免重复配置 TypeScript/JavaScript 语言服务
  const emmetDisposableRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    
    return () => {
      if (emmetDisposableRef.current) {
        emmetDisposableRef.current();
      }
    };
  }, []);

  // 确定最终主题：如果 forcedTheme 是 system，则使用 next-themes 的值，否则使用强制值
  const currentThemeMode = forcedTheme === 'system' ? systemTheme : forcedTheme;
  const editorTheme = currentThemeMode === "dark" ? "vs-dark" : "light";

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // 可以在这里进行额外的编辑器配置
    // 例如注册快捷键等
    
    // 启用 Emmet 支持 (仅针对 HTML)
    if (language === 'html') {
      // 避免重复注册
      if (!emmetDisposableRef.current) {
        emmetDisposableRef.current = emmetHTML(monaco, ['html']);
      }
    }
  };

  if (!mounted) {
    return (
      <div className={`h-full w-full bg-muted/10 animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-sm text-muted-foreground">加载编辑器...</span>
      </div>
    );
  }

  return (
    <div className={`h-full w-full ${className}`}>
      <Editor
        height="100%"
        language={language}
        value={value}
        theme={editorTheme}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          minimap: { enabled: false }, // 保持界面简洁，关闭缩略图
          fontSize: 14,
          lineNumbers: showLineNumbers ? "on" : "off", // 动态配置行号显示
          scrollBeyondLastLine: false,
          automaticLayout: true,    // 自动响应容器大小变化
          wordWrap: "on",           // 自动换行
          padding: { top: 16, bottom: 16 },
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          renderLineHighlight: "all",
          scrollbar: {
            vertical: "visible",
            horizontal: "auto",
            useShadows: false,
            verticalScrollbarSize: 10,
          },
          tabSize: 2,
        }}
        loading={
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            加载编辑器资源...
          </div>
        }
      />
    </div>
  );
};

