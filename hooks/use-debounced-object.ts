import { useEffect, useState } from 'react';

/**
 * 对象/数组防抖 Hook
 * 
 * 通过对值的JSON序列化字符串进行比较，仅当值的"深层内容"停止变化指定时间后，才更新并返回新的值。
 * 返回值的引用在内容不变时保持稳定，可安全地用于useEffect的依赖数组。
 * 
 * @param value 需要防抖的对象或数组。注意：该对象必须是可被JSON序列化的。
 * @param delay 延迟时间（毫秒）。
 * @returns 防抖后的值。
 */
export function useDebouncedObject<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：在下一次 effect 执行前或组件卸载时清除定时器
    return () => {
      clearTimeout(timer);
    };
    // 关键依赖：将对象序列化为字符串。只有当对象内容实际改变时，
    // 字符串才会变化，从而重新触发effect，重置定时器。
  }, [JSON.stringify(value), delay]);

  return debouncedValue;
}

