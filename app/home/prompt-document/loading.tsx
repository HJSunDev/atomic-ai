import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 顶部导航栏骨架 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-40" />
      </div>

      {/* 文档内容骨架 */}
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* 表单头部骨架 */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-10" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </div>

          {/* 编辑区域骨架 */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-[50rem] mx-auto">
              {/* 标题骨架 */}
              <div className="mb-6">
                <Skeleton className="h-10 w-3/4" />
              </div>

              {/* 描述骨架 */}
              <div className="mb-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* 内容骨架（多行） */}
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
