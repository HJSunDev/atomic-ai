import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * 消息内容的结构化片段定义（支持渐进式扩展）。
 * 阶段一：仅实现 markdown（md）渲染。
 * 未来可扩展：'code'、'tool_call'、'image' 等类型。
 */
export type MessagePart =
  | { type: "md"; content: string }
  | { type: "code"; language?: string; content: string; complete?: boolean }
  | { type: "tool_call"; name: string; input: unknown };

export interface MessageRendererProps {
  parts: MessagePart[];
  /**
   * 可选容器样式类名，建议传入排版类（如：`prose prose-sm dark:prose-invert`）。
   */
  className?: string;
}

/**
 * Markdown 渲染：支持围栏代码块的语法高亮；行内代码使用原生 <code>。
 */
function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // 安全性：默认不启用原始 HTML（不使用 rehypeRaw）
      components={{
        // 临时容错：将段落从 <p> 改为 <div>，避免在段落内渲染块级 <div>（由高亮器生成）导致的嵌套错误
        p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
        // TypeScript 说明：react-markdown 传入了自定义 inline 属性，
        // DOM 属性类型中未显式声明，这里使用 any 处理。
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match?.[1];
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <SyntaxHighlighter
              language={language}
              PreTag="div"
              style={oneDark}
              customStyle={{ margin: 0 }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/**
 * MessageRenderer：按片段类型渲染消息内容。
 * 当前仅支持 markdown 片段；其他类型暂不渲染（返回 null）。
 */
export const MessageRenderer = memo(function MessageRenderer({
  parts,
  className,
}: MessageRendererProps) {
  return (
    <div className={className}>
      {parts.map((part, index) => {
        switch (part.type) {
          case "md":
            return <MarkdownRenderer key={index} content={part.content} />;
          // 为后续阶段预留
          case "code":
          case "tool_call":
          default:
            return null;
        }
      })}
    </div>
  );
});

export default MessageRenderer;


