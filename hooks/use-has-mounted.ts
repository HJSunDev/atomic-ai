'use client';

import { useState, useEffect } from 'react';

/**
 * 用于检测组件是否已在客户端挂载的hook
 * 
 * 在Next.js应用中解决服务端渲染与客户端渲染不一致导致的水合错误
 * 由于服务端渲染时没有执行useEffect，初始返回false
 * 在客户端hydration完成后，执行useEffect并更新状态为true
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const hasMounted = useHasMounted();
 *   
 *   // 仅在客户端渲染完成后才渲染此部分
 *   if (!hasMounted) return null;
 *   
 *   return <div>仅客户端内容</div>;
 * }
 * ```
 * 
 * @returns {boolean} 组件是否已在客户端挂载
 */
export function useHasMounted(): boolean {
  // 初始值设为false，确保服务端渲染与初始客户端渲染结果一致
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  
  // useEffect仅在客户端执行，服务端不会执行
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
} 