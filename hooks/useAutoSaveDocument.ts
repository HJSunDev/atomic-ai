"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebouncedValue } from "./use-debounced-value";
import { useDebouncedObject } from "./use-debounced-object";

/**
 * 自定义 Hook：文档自动保存
 * 
 * 核心功能：
 * 1. 加载文档数据并初始化本地状态
 * 2. 监听本地状态变化，自动防抖保存到服务器
 * 3. 元信息和内容分离更新，优化性能
 * 
 * 数据流设计：
 * - 使用 serverDataRef 存储服务器数据（不触发重渲染）
 * - 初始化只在文档切换时执行（避免保存后的数据回流触发覆盖）
 * - 保存逻辑与 useQuery 解耦（避免闭环）
 * 
 * 性能优化：
 * - 元信息（title, description）防抖 800ms
 * - 内容（富文本）防抖 500ms
 * - 前端对比值，避免无变化的请求
 * - 保存成功后立即更新 ref，避免重复保存
 */
export const useAutoSaveDocument = (documentId: string | null) => {
  // 本地编辑状态
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [promptPrefix, setPromptPrefix] = useState<string>("");
  const [promptSuffix, setPromptSuffix] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // 文档元信息保存状态，是否在更新中
  const [savingMetadata, setSavingMetadata] = useState(false);
  // 文档内容保存状态，是否在更新中
  const [savingContent, setSavingContent] = useState(false);

  // 使用 ref 存储服务器数据，用于对比（ref 变化不触发重渲染）
  const serverDataRef = useRef<{
    title: string;
    description: string;
    promptPrefix: string;
    promptSuffix: string;
    content: string;
  } | null>(null);


  // 引用-文档初始化状态，值为null，数据初始化后为已初始化文档id
  const initializedForDocRef = useRef<string | null>(null);
  // 引用-标记初始化是否已完成（防抖值已稳定），防止初始化阶段 执行更新接口
  const initializationCompleteRef = useRef<boolean>(false);
  // 引用-初始化完成计时器
  const initCompletionTimerRef = useRef<NodeJS.Timeout | null>(null);


  // 从服务器加载文档数据
  const documentData = useQuery(
    api.prompt.queries.getDocumentWithContent,
    documentId ? { documentId: documentId as Id<"documents"> } : "skip"
  );

  // 接口：更新文档元信息
  const updateDocumentMutation = useMutation(api.prompt.mutations.updateDocument);
  // 接口：更新文档内容
  const updateContentMutation = useMutation(api.prompt.mutations.updateDocumentContent);

  
  // 对象防抖：文档元信息（使用 useDebouncedObject 处理对象类型，保证引用稳定）
  const debouncedMetadata = useDebouncedObject({ title, description, promptPrefix, promptSuffix }, 800);
  // 值防抖：文档内容（字符串类型使用 useDebouncedValue）
  const debouncedContent = useDebouncedValue(content, 700);
  

  // 数据初始化与远程同步（AI 流式）统一入口
  useEffect(() => {
    // 如果服务端数据还未到达，不需要执行后续数据同步操作
    if (!documentData) {
      return;
    }
    const { document, contentBlock } = documentData;
    const serverTitle = document.title || "";
    const serverDescription = document.description || "";
    const serverPromptPrefix = document.promptPrefix || "";
    const serverPromptSuffix = document.promptSuffix || "";
    const serverContent = contentBlock.content || "";
    // 是否切换了新文档
    const isNewDocument = initializedForDocRef.current !== documentId;
    // 是否存在来自服务端的变更（例如 AI 流式更新）
    const hasRemoteChange =
      !serverDataRef.current ||
      serverDataRef.current.title !== serverTitle ||
      serverDataRef.current.description !== serverDescription ||
      serverDataRef.current.promptPrefix !== serverPromptPrefix ||
      serverDataRef.current.promptSuffix !== serverPromptSuffix ||
      serverDataRef.current.content !== serverContent;
    // 仅在切换文档或检测到远程变更时同步
    if (isNewDocument || hasRemoteChange) {
      // 先同步服务器镜像，作为比较基准
      serverDataRef.current = {
        title: serverTitle,
        description: serverDescription,
        promptPrefix: serverPromptPrefix,
        promptSuffix: serverPromptSuffix,
        content: serverContent,
      };
      // 再更新本地 UI 状态（会触发防抖，但比较基准已同步，不会触发保存）
      setTitle(serverTitle);
      setDescription(serverDescription);
      setPromptPrefix(serverPromptPrefix);
      setPromptSuffix(serverPromptSuffix);
      setContent(serverContent);


      // 记录已初始化的文档 id
      if (isNewDocument) {
        initializedForDocRef.current = documentId;
      }

      // 重置并延后开启“允许保存”的开关，避免将远程同步误判为用户输入
      initializationCompleteRef.current = false;
      if (initCompletionTimerRef.current) {
        clearTimeout(initCompletionTimerRef.current);
      }
      // 设置一个计时器，在所有防抖延迟（最长800ms）结束后，标记初始化完成
      initCompletionTimerRef.current = setTimeout(() => {
        initializationCompleteRef.current = true;
      }, 900);
    }
    // 返回一个清理函数。
    // 在组件卸载，或 documentId/documentData 变化导致 effect 重新执行之前，
    // 清除上一个 effect 设置的计时器，防止内存泄漏或意外的状态更新。
    return () => {
      if (initCompletionTimerRef.current) {
        clearTimeout(initCompletionTimerRef.current);
      }
    };
  }, [documentId, documentData]);

  

  // 当 文档元信息防抖值 变化后，执行 文档元信息保存 的副作用
  useEffect(() => {
    // 如果 documentId 不存在，或服务器数据还未加载，则不执行
    if (!documentId || !serverDataRef.current) {
      return;
    }
    // 防止初始化阶段的状态变化触发误保存：只有初始化完成后才允许保存
    if (!initializationCompleteRef.current) {
      return;
    }

    const { 
      title: serverTitle, 
      description: serverDescription, 
      promptPrefix: serverPromptPrefix,
      promptSuffix: serverPromptSuffix
    } = serverDataRef.current;

    const titleChanged = debouncedMetadata.title !== serverTitle;
    const descriptionChanged = debouncedMetadata.description !== serverDescription;
    const promptPrefixChanged = debouncedMetadata.promptPrefix !== serverPromptPrefix;
    const promptSuffixChanged = debouncedMetadata.promptSuffix !== serverPromptSuffix;

    if (!titleChanged && !descriptionChanged && !promptPrefixChanged && !promptSuffixChanged) {
      return;
    }

    const saveMetadata = async () => {
      setSavingMetadata(true);
      try {
        await updateDocumentMutation({
          id: documentId as Id<"documents">,
          title: debouncedMetadata.title,
          description: debouncedMetadata.description,
          promptPrefix: debouncedMetadata.promptPrefix,
          promptSuffix: debouncedMetadata.promptSuffix,
        });
        // 保存成功后立即更新 ref，避免在 useQuery 回流前重复保存
        if (serverDataRef.current) {
          serverDataRef.current.title = debouncedMetadata.title;
          serverDataRef.current.description = debouncedMetadata.description;
          serverDataRef.current.promptPrefix = debouncedMetadata.promptPrefix;
          serverDataRef.current.promptSuffix = debouncedMetadata.promptSuffix;
        }
      } catch (error) {
        console.error("保存文档元信息失败:", error);
      } finally {
        setSavingMetadata(false);
      }
    };

    saveMetadata();
  // 关键：不依赖 documentData，避免闭环
  }, [debouncedMetadata, documentId, updateDocumentMutation]);

  // 当 文档内容防抖值 变化后，执行 文档内容保存 的副作用
  useEffect(() => {
    if (!documentId || !serverDataRef.current) {
      return;
    }

    // 防止初始化阶段的状态变化触发误保存：只有初始化完成后才允许保存
    if (!initializationCompleteRef.current) {
      return;
    }

    const { content: serverContent } = serverDataRef.current;
    const contentChanged = debouncedContent !== serverContent;

    if (!contentChanged) {
      return;
    }

    const saveContent = async () => {
      setSavingContent(true);
      try {
        await updateContentMutation({
          documentId: documentId as Id<"documents">,
          content: debouncedContent,
        });
        // 保存成功后立即更新 ref
        if (serverDataRef.current) {
          serverDataRef.current.content = debouncedContent;
        }
      } catch (error) {
        console.error("保存文档内容失败:", error);
      } finally {
        setSavingContent(false);
      }
    };

    saveContent();
  // 关键：不依赖 documentData，避免闭环
  }, [debouncedContent, documentId, updateContentMutation]);

  return {
    // 本地编辑状态
    title,
    setTitle,
    description,
    setDescription,
    promptPrefix,
    setPromptPrefix,
    promptSuffix,
    setPromptSuffix,
    content,
    setContent,

    // AI 流式生成状态
    streamingMarkdown: documentData?.contentBlock.streamingMarkdown ?? "",
    isStreaming: documentData?.contentBlock.isStreaming ?? false,

    // 加载和保存状态
    isLoading: documentData === undefined && documentId !== null,
    isSaving: savingMetadata || savingContent,
    savingMetadata,
    savingContent,
  };
};

