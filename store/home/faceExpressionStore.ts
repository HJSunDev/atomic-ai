"use client";

// 通过集中管理计时器，避免在多个组件中分散处理导致状态竞争或内存泄漏
import { create } from "zustand";
import { type ExpressionName } from "@/lib/expressions";

// 在模块作用域维护唯一计时器，确保全局表情恢复逻辑互斥
let expressionTimeoutId: ReturnType<typeof setTimeout> | null = null;

interface FaceExpressionState {
  // 当前生效的表情。保持在 store 内，便于任何组件订阅与驱动 UI
  expression: ExpressionName;
  // 设置持久表情：适用于任务中的长期状态，不受定时恢复影响
  setExpression: (expression: ExpressionName) => void;
  // 播放临时表情：用于即时反馈；到时后自动恢复到 neutral
  playExpression: (expression: ExpressionName, duration?: number) => void;
}

export const useFaceExpressionStore = create<FaceExpressionState>((set) => ({
  expression: "neutral",

  setExpression: (expression) => {
    // 持久设定优先：清除任何待恢复的临时状态，避免在任务中被意外覆盖
    if (expressionTimeoutId) {
      clearTimeout(expressionTimeoutId);
      expressionTimeoutId = null;
    }
    set({ expression });
  },

  playExpression: (expression, duration = 1500) => {
    // 确保同一时间只有一个恢复任务，避免快速多次触发时的竞态
    if (expressionTimeoutId) {
      clearTimeout(expressionTimeoutId);
    }

    // 立即更新以触发表情动画
    set({ expression });

    // 在指定时长后自动回到基线表情
    expressionTimeoutId = setTimeout(() => {
      set({ expression: "neutral" });
      expressionTimeoutId = null;
    }, duration);
  },
}));
