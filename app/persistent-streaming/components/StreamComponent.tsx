"use client";

import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { api } from "../../../convex/_generated/api";

interface StreamComponentProps {
  persistentStreamId: string | null;
  isDriven: boolean;
  getConvexHttpUrl: () => string;
  children: (data: {
    persistentText: string | undefined;
    persistentStatus: string;
  }) => React.ReactNode;
}

export default function StreamComponent({
  persistentStreamId,
  isDriven,
  getConvexHttpUrl,
  children,
}: StreamComponentProps) {
  // 使用 Persistent Text Streaming 的 useStream hook
  const streamUrl = persistentStreamId ? new URL(`${getConvexHttpUrl()}/persistent-stream`) : null;
  const { text: persistentText, status: persistentStatus } = useStream(
    api.streaming.getStreamBody, // 查询函数
    streamUrl as any, // HTTP 端点
    isDriven, // 是否由当前会话驱动
    persistentStreamId as any // streamId
  );

  return <>{children({ persistentText, persistentStatus })}</>;
} 