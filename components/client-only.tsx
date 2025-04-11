'use client';

import { ReactNode } from 'react';
import { useHasMounted } from '@/hooks/use-has-mounted';

interface ClientOnlyProps {
  /**
   * 要在客户端渲染的内容
   */
  children: ReactNode;
  
  /**
   * 在客户端挂载前显示的内容（可选）
   * @default null
   */
  fallback?: ReactNode;
}

/**
 * 确保内容仅在客户端渲染，解决水合不匹配问题
 * 此组件只在客户端挂载完成后渲染其子组件
 * 
 * 在服务端和初始客户端渲染时显示fallback（默认为null）
 * 确保服务端和客户端初始渲染结果一致，避免水合错误
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hasMounted = useHasMounted();
  
  return hasMounted ? <>{children}</> : <>{fallback}</>;
} 