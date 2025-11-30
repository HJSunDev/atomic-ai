import { CodeEditor } from "../../common/CodeEditor";

interface HTMLCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * HTMLCodeEditor - HTML 代码编辑器组件
 * 
 * 职责：
 * - 封装底层的 Monaco Editor 配置
 * - 提供特定的 HTML 编辑体验
 */
export const HTMLCodeEditor = ({ code, onChange, className }: HTMLCodeEditorProps) => {
  return (
    <div className={`h-full overflow-hidden bg-background border-l dark:border-slate-800 ${className}`}>
      <CodeEditor 
        value={code} 
        onChange={(val) => onChange(val || "")}
        language="html"
        showLineNumbers={true}
      />
    </div>
  );
};

