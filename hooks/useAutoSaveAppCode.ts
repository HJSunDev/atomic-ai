"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebouncedValue } from "./use-debounced-value";

/**
 * 自定义 Hook：工坊应用代码自动保存
 * 
 * 核心功能：
 * 1. 加载应用数据并初始化本地代码状态
 * 2. 监听本地代码变化，自动防抖保存到服务器
 * 3. 区分 AI 流式更新和用户手动编辑
 * 
 * 数据流设计：
 * - 使用 serverCodeRef 存储服务器代码镜像（不触发重渲染）
 * - 初始化只在应用切换或服务端代码变化时执行
 * - 保存逻辑与 useQuery 解耦（避免闭环）
 * 
 * 性能优化：
 * - 代码变化防抖 700ms
 * - 前端对比值，避免无变化的请求
 * - 保存成功后立即更新 ref，避免重复保存
 */
export const useAutoSaveAppCode = (appId: string | null) => {
  // 本地编辑状态
  const [code, setCode] = useState<string>("");

  // 代码保存状态
  const [isSaving, setIsSaving] = useState(false);

  // 使用 ref 存储服务器代码镜像，用于对比（ref 变化不触发重渲染）
  const serverCodeRef = useRef<string>("");

  // 引用-应用初始化状态，值为null表示未初始化，数据初始化后为已初始化应用id
  const initializedForAppRef = useRef<string | null>(null);
  
  // 引用-标记初始化是否已完成（防抖值已稳定），防止初始化阶段执行更新接口
  const initializationCompleteRef = useRef<boolean>(false);
  
  // 引用-初始化完成计时器
  const initCompletionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 从服务器加载应用数据
  const appData = useQuery(
    api.factory.queries.getApp,
    appId ? { appId: appId as Id<"apps"> } : "skip"
  );

  // 接口：更新应用代码
  const saveAppCodeMutation = useMutation(api.factory.mutations.saveAppCode);

  // 值防抖：代码内容
  // 统一使用 1000ms，既用于自动保存，也用于 iframe 预览渲染，减少重绘
  const debouncedCode = useDebouncedValue(code, 1000);

  // 数据初始化与 AI 流式同步统一入口
  useEffect(() => {
    // 服务端数据还未到达，不执行后续操作
    if (!appData) {
      return;
    }

    const serverCode = appData.latestCode || "";
    
    // 是否切换了新应用
    const isNewApp = initializedForAppRef.current !== appId;
    
    // 是否存在来自服务端的变更（例如 AI 流式更新）
    const hasRemoteChange = serverCodeRef.current !== serverCode;

    // 仅在切换应用或检测到远程变更时同步
    if (isNewApp || hasRemoteChange) {
      // 先同步服务器镜像，作为比较基准
      serverCodeRef.current = serverCode;
      
      // 再更新本地 UI 状态（会触发防抖，但比较基准已同步，不会触发保存）
      setCode(serverCode);

      // 记录已初始化的应用 id
      if (isNewApp) {
        initializedForAppRef.current = appId;
      }

      // 重置并延后开启"允许保存"的开关，避免将远程同步误判为用户输入
      initializationCompleteRef.current = false;
      if (initCompletionTimerRef.current) {
        clearTimeout(initCompletionTimerRef.current);
      }
      
      // 设置一个计时器，在防抖延迟（1000ms）结束后，标记初始化完成
      initCompletionTimerRef.current = setTimeout(() => {
        initializationCompleteRef.current = true;
      }, 1100);
    }

    return () => {
      if (initCompletionTimerRef.current) {
        clearTimeout(initCompletionTimerRef.current);
      }
    };
  }, [appId, appData]);

  // 当代码防抖值变化后，执行代码保存的副作用
  useEffect(() => {
    // appId 不存在，或服务器数据还未加载，则不执行
    if (!appId || serverCodeRef.current === null) {
      return;
    }

    // 防止初始化阶段的状态变化触发误保存：只有初始化完成后才允许保存
    if (!initializationCompleteRef.current) {
      return;
    }

    const codeChanged = debouncedCode !== serverCodeRef.current;

    if (!codeChanged) {
      return;
    }

    const saveCode = async () => {
      setIsSaving(true);
      try {
        await saveAppCodeMutation({
          appId: appId as Id<"apps">,
          code: debouncedCode,
        });
        
        // 保存成功后立即更新 ref，避免在 useQuery 回流前重复保存
        serverCodeRef.current = debouncedCode;
      } catch (error) {
        console.error("保存应用代码失败:", error);
      } finally {
        setIsSaving(false);
      }
    };

    saveCode();
  }, [debouncedCode, appId, saveAppCodeMutation]);

  // 提供一个方法，允许外部更新代码而不触发保存（用于 AI 生成完成时的同步）
  const setCodeWithoutSave = (newCode: string) => {
    setCode(newCode);
    serverCodeRef.current = newCode;
  };

  return {
    // 本地实时编辑状态（用于绑定编辑器）
    code,
    // 防抖后的稳定状态（用于 iframe 预览）
    debouncedCode,
    
    setCode,
    setCodeWithoutSave, // 用于 AI 生成完成时的同步，避免触发不必要的保存

    // 加载和保存状态
    isLoading: appData === undefined && appId !== null,
    isSaving,
  };
};

