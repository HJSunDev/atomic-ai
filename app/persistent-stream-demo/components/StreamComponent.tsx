"use client";

import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { api } from "../../../convex/_generated/api";
import { TypingCursor } from "@/components/custom";

// 流式传输组件的属性接口定义
interface StreamComponentProps {
  // 持久化流式传输的唯一标识符，null 表示未创建流
  persistentStreamId: string | null;
  // 标识当前会话是否驱动流式传输（控制是否发起 HTTP 请求）
  isDriven: boolean;
  // 获取 Convex HTTP 接口基础 URL 的函数
  getConvexHttpUrl: () => string;
  // 光标配置选项
  cursorOptions?: {
    // 光标类型：竖线、下划线、方块、自定义文本
    type?: 'line' | 'underscore' | 'block' | 'custom';
    // 自定义光标文本（当type为custom时使用）
    customText?: string;
    // 闪烁速度：slow(1.5s), normal(1s), fast(0.5s)
    speed?: 'slow' | 'normal' | 'fast';
    // 光标颜色
    color?: string;
    // 是否显示光标（控制光标的显示/隐藏）
    show?: boolean;
  };
  // 渲染函数，接收流式传输的数据并返回 React 节点
  children: (data: {
    // 当前流式传输的文本内容，undefined 表示尚未开始传输
    persistentText: string | undefined;
    // 流式传输的状态：'streaming' | 'done' | 'error'
    persistentStatus: string;
    // 流式传输内容加光标的完整显示组件
    textWithCursor: React.ReactNode;
  }) => React.ReactNode;
}

export default function StreamComponent({
  persistentStreamId,
  isDriven,
  getConvexHttpUrl,
  cursorOptions = {},
  children,
}: StreamComponentProps) {
  // 使用 Persistent Text Streaming 的 useStream hook
  const streamUrl = persistentStreamId ? new URL(`${getConvexHttpUrl()}/persistent-stream`) : null;
  const { text: persistentText, status: persistentStatus } = useStream(
    api.persistent_stream_demo.queries.getStreamBody, // 查询函数
    streamUrl as any, // HTTP 端点
    isDriven, // 是否由当前会话驱动
    persistentStreamId as any // streamId
  );

  // 默认光标配置
  const defaultCursorOptions = {
    type: 'line' as const,
    speed: 'normal' as const,
    color: '#3b82f6',
    show: true,
    ...cursorOptions
  };

  // 创建带光标的文本内容
  const textWithCursor = (
    <>
      {persistentText}
      {persistentStatus === "streaming" && defaultCursorOptions.show && (
        <TypingCursor
          type={defaultCursorOptions.type}
          customText={defaultCursorOptions.customText}
          speed={defaultCursorOptions.speed}
          color={defaultCursorOptions.color}
          show={true}
        />
      )}
    </>
  );

  return <>{children({ persistentText, persistentStatus, textWithCursor })}</>;
} 