"use client";

import { TiptapEditor } from "./TiptapEditor";
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { markdownToTiptapJSON } from '@/lib/markdown';

// 文档表单属性（现在是受控组件）
interface DocumentFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  promptPrefix: string;
  setPromptPrefix: (prefix: string) => void;
  content: string;
  setContent: (content: string) => void;
  streamingMarkdown: string;
  isStreaming: boolean;
  documentId?: string;
  disabled?: boolean;
}

// 文档表单：Notion 风格的可视化编辑器，现在作为受控组件
export const DocumentForm = ({
  title,
  setTitle,
  description,
  setDescription,
  promptPrefix,
  setPromptPrefix,
  content,
  setContent,
  streamingMarkdown,
  isStreaming,
  documentId,
  disabled = false,
}: DocumentFormProps) => {
  // 追踪用户是否正在编辑前置信息，用于显示/隐藏和动态调整高度
  const [isEditingPrefix, setIsEditingPrefix] = useState(false);

  // 保存流式完成后的转换结果
  const finalizeStreamingContent = useMutation(api.prompt.mutations.finalizeStreamingContent);
  
  // 维护上一次的 isStreaming 值（用于检测状态变化）
  const prevIsStreamingRef = useRef(isStreaming);
  // 防止重复转换的标记（异步转换过程中避免再次触发）
  const isFinalizingRef = useRef(false);
  // 本地状态标记，追踪是否正在转换（用于延迟视图切换，避免闪烁）
  const [isFinalizing, setIsFinalizing] = useState(false);

  // 核心逻辑：检测 AI 流式完成时刻，自动将 Markdown 转换为 JSON 并保存
  useEffect(() => {
    // 流式完成的判断条件：isStreaming 从 true 变为 false，且有内容
    const shouldFinalize = 
      prevIsStreamingRef.current &&              // 之前：正在流式生成
      !isStreaming &&                            // 现在：流式已结束
      streamingMarkdown.trim().length > 0 &&     // 且：有生成的内容
      !isFinalizingRef.current &&                // 且：未在转换中
      documentId;                                // 且：有文档ID
    
    if (shouldFinalize) {
      isFinalizingRef.current = true;
      setIsFinalizing(true);
      
      // 【转换流程】Markdown → HTML → JSON（封装在工具函数中，复用统一扩展配置）
      const jsonContent = markdownToTiptapJSON(streamingMarkdown);
      
      if (jsonContent) {
        const jsonString = JSON.stringify(jsonContent);
        
        // 【关键设计】立即更新本地状态，避免切换到编辑器时出现闪烁
        // 注意：这会触发 useAutoSaveDocument 的防抖保存，但有双重保护机制：
        // 1. 如果网络快（< 700ms）：finalizeStreamingContent 会先完成，
        //    useQuery 回流后更新 serverDataRef，防抖触发时检测到内容相同，跳过保存
        // 2. 如果网络慢（> 700ms）：防抖会先触发 updateContentMutation，
        //    但 finalizeStreamingContent 执行时会被 updateDocumentContent 的内容检测拦截
        // 结果：无论网络快慢，都不会产生重复的数据库写入
        setContent(jsonString);
        
        // 【必需】调用 finalizeStreamingContent 保存到数据库
        // 作用：1) 持久化 content；2) 设置 isStreaming=false（updateContentMutation 做不到）
        // 与 setContent 的关系：setContent 更新本地状态消除闪烁，此处确保数据持久化
        finalizeStreamingContent({
          documentId: documentId as Id<"documents">,
          jsonContent: jsonString,
        })
          .then(() => {
            console.log('AI 生成内容已成功转换并保存');
          })
          .catch((error) => {
            console.error('保存转换后的内容失败:', error);
          })
          .finally(() => {
            isFinalizingRef.current = false;
            setIsFinalizing(false);
          });
      } else {
        console.warn('MD 转 JSON 失败，无法保存');
        isFinalizingRef.current = false;
        setIsFinalizing(false);
      }
    }
    
    // 每次 effect 执行后，更新 prevIsStreamingRef，为下次检测状态变化做准备
    prevIsStreamingRef.current = isStreaming;
    
  }, [isStreaming, streamingMarkdown, documentId, finalizeStreamingContent, setContent]);

  // 派生状态：有内容或正在编辑时，显示输入框
  const shouldShowPrefixInput = promptPrefix.length > 0 || isEditingPrefix;

  // 根据是否正在编辑以及内容行数，动态计算输入框的高度 class
  // - 编辑时，或内容超过1行时，最小高度为2行
  // - 非编辑状态且内容为1行时，最小高度为1行
  const hasSingleLine = !promptPrefix.includes('\n');
  const prefixHeightClass = (isEditingPrefix || !hasSingleLine)
    ? 'min-h-[2.8rem]'
    : 'min-h-[1.2rem]';

  // 编辑状态下的视觉样式：增加一个轻微的背景和内边距，使其与周围区分开
  const prefixEditingClass = isEditingPrefix ? 'bg-gray-50 rounded-md p-2' : 'px-0';

  // 追踪用户是否正在编辑描述，用于显示/隐藏和动态调整高度
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // 派生状态：根据描述内容的行数和编辑状态，动态计算其样式
  const descriptionHasLessThanTwoLines = description.length === 0 || !description.includes('\n');
  const descriptionHeightClass = (isEditingDescription || !descriptionHasLessThanTwoLines) ? 'min-h-[2.8rem]' : 'min-h-[1.2rem]';
  const descriptionEditingClass = isEditingDescription ? 'bg-gray-50 rounded-md p-2' : 'px-0';

  // 标题变更
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // 描述变更
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  // 富文本内容变更
  const handleContentChange = (nextContent: string) => {
    setContent(nextContent);
  };

  // 前置信息变更
  const handlePromptPrefixChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptPrefix(e.target.value);
  };

  return (
    <article className="max-w-[42rem] mx-auto pt-4 ">
      {/* 标题输入：Notion风格的大标题 */}
      <section className="mb-[4px] ">
        <input
          className="w-full text-4xl font-bold outline-none placeholder:text-[#E1E1E0] leading-tight disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="无标题"
          value={title}
          onChange={handleTitleChange}
          autoFocus
          disabled={disabled}
        />
      </section>

      {/* 描述输入：更加简洁的描述区域 */}
      <section className="mb-[8px]">
        <Textarea
          className={`w-full resize-none border-0 shadow-none focus-visible:ring-0 py-0 !text-[13px] text-gray-400 placeholder:text-[#a8a49c] leading-relaxed max-h-[8.9rem] overflow-y-auto ${descriptionHeightClass} ${descriptionEditingClass}`}
          placeholder="添加描述..."
          value={description}
          onChange={handleDescriptionChange}
          onFocus={() => setIsEditingDescription(true)}
          onBlur={() => setIsEditingDescription(false)}
          disabled={disabled}
        />
      </section>

      {/* 前置信息：可折叠的输入区域 */}
      <section className="mb-[24px]">
        {!shouldShowPrefixInput ? (
          <button
            onClick={() => setIsEditingPrefix(true)}
            className="flex items-center py-1 px-[4px] -m-[6px] text-[13px] text-[#a8a49c] hover:text-gray-600 hover:bg-gray-50 rounded transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            <Plus className="h-3 w-3" />
            <span>添加前置信息</span>
          </button>
        ) : (
          <div>
            <Textarea
              className={`w-full resize-none border-0 shadow-none focus-visible:ring-0 py-0 !text-[14px] text-gray-600 placeholder:text-gray-300 !leading-[1.4] max-h-[8.9rem] overflow-y-auto ${prefixHeightClass} ${prefixEditingClass}`}
              placeholder="前置信息..."
              value={promptPrefix}
              onChange={handlePromptPrefixChange}
              onFocus={() => setIsEditingPrefix(true)}
              onBlur={() => setIsEditingPrefix(false)}
              autoFocus={isEditingPrefix}
              disabled={disabled}
            />
          </div>
        )}
      </section>

      {/* 富文本编辑器/Markdown 预览区：根据流式状态切换显示 */}
      <section>
        {(isStreaming || isFinalizing) ? (
          // AI 流式生成中或转换中：显示 Markdown 实时渲染
          <div className="min-h-[400px] w-full markdown-content py-4">
            {streamingMarkdown ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {streamingMarkdown}
              </ReactMarkdown>
            ) : (
              <span className="text-gray-400 italic">AI 正在生成中...</span>
            )}
          </div>
        ) : (
          // 正常编辑模式：显示 Tiptap 富文本编辑器
          <TiptapEditor
            content={content}
            onContentChange={handleContentChange}
            placeholder={`输入"/"打开菜单`}
            editable={!disabled}
          />
        )}
      </section>
    </article>
  );
};
