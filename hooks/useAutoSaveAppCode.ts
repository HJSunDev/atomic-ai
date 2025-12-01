"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useDebouncedValue } from "./use-debounced-value";

/**
 * 自定义 Hook：工坊应用代码自动保存 和 自动同步本地状态
 */
export const useAutoSaveAppCode = (appId: string | null) => {
  // 本地编辑状态
  const [code, setCode] = useState<string>("");

  // 代码保存状态
  const [isSaving, setIsSaving] = useState(false);

  // 使用 ref 存储服务端代码镜像
  const serverCodeRef = useRef<string>("");

  // 引用-应用初始化状态
  const initializedForAppRef = useRef<string | null>(null);
  
  // 引用-标记初始化是否已完成
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
  const debouncedCode = useDebouncedValue(code, 1000);

  // 数据初始化与状态维护
  useEffect(() => {

    if (!appData) return;

    const serverCode = appData.latestCode || "";
    const isNewApp = initializedForAppRef.current !== appId;
    const hasRemoteChange = serverCodeRef.current !== serverCode;

    // 如果有新应用或远程变更
    // 这一步只负责：更新数据 + 将状态置为“未完成”
    if (isNewApp || hasRemoteChange) {
      serverCodeRef.current = serverCode;
      setCode(serverCode);
      
      if (isNewApp) {
        initializedForAppRef.current = appId;
      }

      // 关键：只要数据变了触发setCode，就标记为“未完成”（锁住保存功能）
      initializationCompleteRef.current = false;
    }

    // 确保定时器存活
    // 逻辑：只要 initializationCompleteRef 是 false，就必须确保有一个定时器在跑。
    // 解释：这解决了 React Strict Mode 问题。即使第一次挂载的定时器被 cleanup 杀掉了，
    // 第二次挂载时，虽然 isNewApp 为 false（跳过上面的 if），但这里 !initializationCompleteRef.current 依然为 true，
    // 所以定时器会在这里“重生”。
    if (!initializationCompleteRef.current) {
      // 如果已经有定时器在跑，先清除它（重置倒计时）
      if (initCompletionTimerRef.current) {
        clearTimeout(initCompletionTimerRef.current);
      }
      
      // 启动/重启定时器
      initCompletionTimerRef.current = setTimeout(() => {
        initializationCompleteRef.current = true;
        initCompletionTimerRef.current = null; // 跑完后清理引用
      }, 1100);
    }

    // 清理函数
    return () => {
      if (initCompletionTimerRef.current) {
        clearTimeout(initCompletionTimerRef.current);
        // 这里置空很重要，防止下次 render 误判
        initCompletionTimerRef.current = null; 
      }
    };
  }, [appId, appData]);


  // 依赖于 debouncedCode 变化，用于保存本地状态变更

  useEffect(() => {
    // 基础拦截
    if (!appId || serverCodeRef.current === null) return;

    // 【安全拦截】这是由服务端变更导致的本地更新，不需要保存
    if (!initializationCompleteRef.current) return;

    // 检查是否有实质性变更
    const codeChanged = debouncedCode !== serverCodeRef.current;
    if (!codeChanged) return;

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
    code,
    debouncedCode,
    setCode,
    setCodeWithoutSave,
    isLoading: appData === undefined && appId !== null,
    isSaving,
  };
};

