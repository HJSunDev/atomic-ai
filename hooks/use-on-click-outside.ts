import { RefObject, useEffect } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown',
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      
      // 如果点击了元素内部或者元素不存在，则不执行处理函数
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }

      handler(event);
    };

    // 监听鼠标事件
    document.addEventListener(mouseEvent, listener);
    // 监听触摸事件
    document.addEventListener('touchstart', listener);

    return () => {
      // 清理事件监听
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, mouseEvent]);
} 