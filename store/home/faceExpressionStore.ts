"use client";

import { create } from "zustand";
import { type ExpressionName } from "@/lib/expressions";

// 分离计时器职责：playTimeoutId 处理临时表情恢复，autoCycleIntervalId 处理自动循环
// 这样可以避免两种不同类型的定时任务相互干扰
let playTimeoutId: ReturnType<typeof setTimeout> | null = null;
let autoCycleIntervalId: ReturnType<typeof setInterval> | null = null;

// 引用计数，用于管理自动循环的生命周期
// 当第一个订阅者出现时启动循环，最后一个订阅者离开时停止
let subscriberCount = 0;

interface FaceExpressionState {
  // --- 状态 ---
  // 当前生效的表情
  expression: ExpressionName;
  // 当前运行模式
  isAutoCycling: boolean;
  // 自动模式配置，便于从手动模式恢复时使用相同参数
  autoCycleConfig: {
    expressions: ExpressionName[];
    interval: number;
    duration: number; // 自动表情的持续时间
  };

  // --- 动作 ---

  /**
   * 订阅自动循环。
   * 内部使用引用计数，当第一个组件订阅时启动循环。
   * @param expressions 要循环的表情数组
   * @param options.interval 触发间隔（毫秒）
   * @param options.duration 每个表情的持续时长（毫秒）
   */
  subscribeAutoCycle: (expressions: ExpressionName[], options?: { interval?: number; duration?: number }) => void;

  /**
   * 取消订阅自动循环。
   * 内部使用引用计数，当最后一个组件取消订阅时停止循环。
   */
  unsubscribeAutoCycle: () => void;

  /**
   * 设置持久表情并切换到手动模式
   * 适用于需要长期保持某种表情状态的场景
   */
  setExpression: (expression: ExpressionName) => void;

  /**
   * 播放临时表情并切换到手动模式
   * 适用于即时反馈场景，表情播放完毕后回到 neutral 但保持手动模式
   */
  playExpression: (expression: ExpressionName, duration?: number) => void;

  /**
   * 启动自动表情循环模式
   * 系统会按 interval 间隔，随机播放一个列表中的表情，每个表情持续 duration 时长
   * @param expressions 要循环的表情数组
   * @param options.interval 触发间隔（毫秒），默认 4000ms
   * @param options.duration 每个表情的持续时长（毫秒），默认 1200ms
   */
  startAutoCycle: (expressions: ExpressionName[], options?: { interval?: number; duration?: number }) => void;

  /**
   * 停止自动循环并回到 neutral 状态
   * 为手动操作腾出控制权
   */
  stopAutoCycle: () => void;
  
  /**
   * 恢复之前保存的自动循环配置
   * 用于从手动模式回到自动模式，无需重新传入参数
   */
  resumeAutoCycle: () => void;
}

export const useFaceExpressionStore = create<FaceExpressionState>((set, get) => ({
  // --- 初始状态 ---
  expression: "neutral",
  isAutoCycling: false,
  autoCycleConfig: { expressions: [], interval: 4000, duration: 1200 },

  // --- 动作实现 ---

  // 订阅自动循环
  subscribeAutoCycle: (expressions, options) => {
    subscriberCount++;
    // 仅当第一个订阅者加入时启动
    if (subscriberCount === 1) {
      get().startAutoCycle(expressions, options);
    }
  },

  // 取消订阅自动循环
  unsubscribeAutoCycle: () => {
    subscriberCount = Math.max(0, subscriberCount - 1);
    // 仅当最后一个订阅者离开时停止
    if (subscriberCount === 0) {
      get().stopAutoCycle();
    }
  },

  // 设置持久表情
  setExpression: (expression) => {
    // 手动设置表情时必须停止自动模式，避免被自动循环覆盖
    get().stopAutoCycle();
    set({ expression, isAutoCycling: false });
  },

  // 设置临时表情
  playExpression: (expression, duration = 1500) => {
    const { stopAutoCycle } = get();
    // 临时表情优先级高于自动循环，需要暂停自动模式
    stopAutoCycle();
    set({ expression, isAutoCycling: false });

    // 清除上一个临时表情的恢复任务，避免多次调用时的时序混乱
    if (playTimeoutId) clearTimeout(playTimeoutId);

    playTimeoutId = setTimeout(() => {
      set({ expression: "neutral" });
    }, duration);
  },

  // 启动自动循环模式
  startAutoCycle: (expressions, options) => {
    const { interval = 4000, duration = 1200 } = options || {};
    const { stopAutoCycle } = get();
    // 确保旧的循环完全清理，避免多个定时器同时运行
    stopAutoCycle();

    // 空表情列表意味着不需要循环，直接保持静态状态
    if (!expressions || expressions.length === 0) {
      set({ autoCycleConfig: { expressions: [], interval, duration } });
      return;
    }

    set({ 
      isAutoCycling: true,
      autoCycleConfig: { expressions, interval, duration },
    });

    //"播放-持续-恢复"逻辑
    autoCycleIntervalId = setInterval(() => {
      const { autoCycleConfig, isAutoCycling } = get();

      // 双重保险，如果状态变为非自动，则停止循环
      if (!isAutoCycling || autoCycleConfig.expressions.length === 0) {
        stopAutoCycle();
        return;
      }
      
      const currentExpressions = autoCycleConfig.expressions;
      const randomIndex = Math.floor(Math.random() * currentExpressions.length);
      const expressionToPlay = currentExpressions[randomIndex];

      // 像手动触发一样"播放"表情
      if (playTimeoutId) clearTimeout(playTimeoutId);

      set({ expression: expressionToPlay });
      
      playTimeoutId = setTimeout(() => {
        set({ expression: "neutral" });
      }, autoCycleConfig.duration);

    }, interval);
  },
  
  // 停止自动循环模式
  stopAutoCycle: () => {
    if (autoCycleIntervalId) {
      clearInterval(autoCycleIntervalId);
      autoCycleIntervalId = null;
    }
    // 停止时，也应该清除可能正在播放的临时表情
    if (playTimeoutId) {
      clearTimeout(playTimeoutId);
      playTimeoutId = null;
    }
    // 停止自动循环时恢复到基线状态
    set({ expression: 'neutral', isAutoCycling: false });
  },

  // 恢复自动循环模式
  resumeAutoCycle: () => {
    const { autoCycleConfig } = get();
    // 重用已保存的配置参数，保持用户之前的偏好设置
    get().startAutoCycle(autoCycleConfig.expressions, {
      interval: autoCycleConfig.interval,
      duration: autoCycleConfig.duration,
    });
  }
}));
