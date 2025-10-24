"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebouncedValue } from "./use-debounced-value";

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
  const [content, setContent] = useState<string>("");

  // 保存状态
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  // 使用 ref 存储服务器数据，用于对比（ref 变化不触发重渲染）
  const serverDataRef = useRef<{
    title: string;
    description: string;
    content: string;
  } | null>(null);

  // 记录已为哪个文档完成过一次性初始化，避免后续 query 回流覆盖本地编辑
  const initializedForDocRef = useRef<string | null>(null);

  // 从服务器加载文档数据
  const documentData = useQuery(
    api.prompt.queries.getDocumentWithContent,
    documentId ? { documentId: documentId as Id<"documents"> } : "skip"
  );

  // Convex mutations
  const updateDocumentMutation = useMutation(api.prompt.mutations.updateDocument);
  const updateContentMutation = useMutation(api.prompt.mutations.updateDocumentContent);

  // 元信息防抖
  const debouncedMetadata = useDebouncedValue({ title, description }, 1200);

  // 内容防抖
  const debouncedContent = useDebouncedValue(content, 1000);

  // 初始化：在文档切换或首次数据到达时，用服务器数据覆盖本地状态
  useEffect(() => {
    if (!documentData) {
      return;
    }

    // 已初始化过当前文档则跳过，避免覆盖本地编辑
    if (initializedForDocRef.current === documentId) {
      return;
    }

    const { document, contentBlock } = documentData;
    const serverTitle = document.title || "";
    const serverDescription = document.description || "";
    const serverContent = contentBlock.content || "";

    // 将服务器数据存入 ref
    serverDataRef.current = {
      title: serverTitle,
      description: serverDescription,
      content: serverContent,
    };

    // 用服务器数据初始化本地状态
    setTitle(serverTitle);
    setDescription(serverDescription);
    setContent(serverContent);

    // 标记当前文档已完成初始化
    initializedForDocRef.current = documentId;

  // 依赖 documentId 与 documentData，确保数据到达后能完成一次初始化
  }, [documentId, documentData]);

  // 当 query 数据更新时，同步更新 ref（但不覆盖本地状态）
  useEffect(() => {
    if (documentData) {
      const { document, contentBlock } = documentData;
      serverDataRef.current = {
        title: document.title || "",
        description: document.description || "",
        content: contentBlock.content || "",
      };
    }
  }, [documentData]);

  // 自动保存元信息
  useEffect(() => {
    // 如果 documentId 不存在，或服务器数据还未加载，则不执行
    if (!documentId || !serverDataRef.current) {
      return;
    }

    const { title: serverTitle, description: serverDescription } = serverDataRef.current;

    const titleChanged = debouncedMetadata.title !== serverTitle;
    const descriptionChanged = debouncedMetadata.description !== serverDescription;

    if (!titleChanged && !descriptionChanged) {
      return;
    }

    const saveMetadata = async () => {
      setSavingMetadata(true);
      try {
        await updateDocumentMutation({
          id: documentId as Id<"documents">,
          title: debouncedMetadata.title,
          description: debouncedMetadata.description,
        });
        // 保存成功后立即更新 ref，避免在 useQuery 回流前重复保存
        if (serverDataRef.current) {
          serverDataRef.current.title = debouncedMetadata.title;
          serverDataRef.current.description = debouncedMetadata.description;
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

  // 自动保存内容
  useEffect(() => {
    if (!documentId || !serverDataRef.current) {
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
    content,
    setContent,

    // 加载和保存状态
    isLoading: documentData === undefined && documentId !== null,
    isSaving: savingMetadata || savingContent,
    savingMetadata,
    savingContent,
  };
};

