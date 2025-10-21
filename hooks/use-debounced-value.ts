import { useEffect, useState } from 'react';

/**
 * 防抖 Hook - 延迟更新值直到指定时间内没有新的更改
 * 
 * 值防抖：将一个快速变化的响应式数据（state），转换成一个延迟更新的、新的响应式数据（另一个 state）
 * 
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器延迟更新防抖值
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：在下次 effect 执行前或组件卸载时清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // 只有当 value 或 delay 变化时才重新执行

  return debouncedValue;
}