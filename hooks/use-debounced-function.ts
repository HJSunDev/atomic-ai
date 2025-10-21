import { useRef, useEffect, useCallback } from 'react';

type AnyFunction = (...args: any[]) => any;

/**
 * 函数防抖 Hook
 *
 * 通过 useRef 实时同步最新的函数逻辑，并使用 useCallback 确保返回的函数引用稳定，
 * 从而解决了因函数引用变化和陈旧闭包导致的防抖失效问题。
 *
 * @template F - 任意函数类型。
 * @param {F} func - 需要进行防抖处理的函数。
 * @param {number} delay - 延迟时间（毫秒）。
 * @returns {F} - 返回一个引用稳定且逻辑最新的防抖函数。
 */
export function useDebouncedFunction<F extends AnyFunction>(
  func: F,
  delay: number
): F {
  // 使用 useRef 来存储函数逻辑
  const funcRef = useRef(func);

  // 每次渲染时，都用最新的函数更新 ref
  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  // 使用 useRef 存储定时器 ID
  const timer = useRef<NodeJS.Timeout | null>(null);

  // 组件卸载时，清除定时器
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  // 使用 useCallback 创建一个引用绝对稳定的函数
  // 依赖数组只包含 delay，因为只有 delay 变化才需要重建 debounce 逻辑
  const debouncedFunction = useCallback(
    (...args: Parameters<F>) => {
      // 清除上一个定时器
      if (timer.current) {
        clearTimeout(timer.current);
      }

      // 设置一个新的定时器
      timer.current = setTimeout(() => {
        // 执行时，总是调用 ref 中最新的那个函数
        funcRef.current(...args);
      }, delay);
    },
    [delay] 
  );

  return debouncedFunction as F;
}
