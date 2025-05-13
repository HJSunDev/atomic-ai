import StreamingChat from "@/app/streaming-chat/_components/StreamingChat";

export default function StreamingChatPage() {
  return (
    <div className="w-full p-8">
      <h1 className="text-3xl font-bold text-center">AI流式聊天示例</h1>
      <StreamingChat />
    </div>
  );
} 