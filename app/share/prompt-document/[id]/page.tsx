"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, Ghost, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/document/TiptapEditor";

export default function SharePromptDocumentPage() {
  const params = useParams();
  const documentId = params.id as Id<"documents">;
  
  // 使用 getPublicDocument 获取公开数据
  const data = useQuery(api.prompt.queries.getPublicDocument, { documentId });

  // 加载中
  if (data === undefined) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  // 模拟未发布/不可见状态 (复用 Factory 分享页的设计)
  // 如果 data === null (没权限/不存在) 或者 (虽然有数据但是未发布且是作者自己看)
  const isUnpublishedAuthorView = data?.document && !data.document.isPublished;

  if (data === null || isUnpublishedAuthorView) {
    return (
        <div className="min-h-screen w-full flex flex-col bg-[#F7F7F5] dark:bg-[#191919] font-sans">
            <nav className="h-14 px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span>Atomic AI</span>
                </div>
                
                <Link href="/" target="_blank">
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-normal cursor-pointer">
                        什么是 Atomic AI?
                    </Button>
                </Link>
            </nav>
    
            {/* 居中内容 */}
            <section className="flex-1 flex flex-col items-center justify-center p-6 -mt-14">
                <div className="max-w-md w-full text-center space-y-8">
                    
                    {/* 图标/Emoji */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full blur-xl"></div>
                            <Ghost className="w-20 h-20 text-slate-300 dark:text-slate-600 relative z-10" strokeWidth={1} />
                            {/* 装饰性元素 */}
                            <div className="absolute top-0 right-0 text-slate-400 dark:text-slate-500 text-2xl animate-bounce" style={{ animationDuration: '3s' }}>?</div>
                        </div>
                    </div>
    
                    {/* 文字内容 */}
                    <div className="space-y-3">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                            页面无法访问
                        </h1>
                        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                            这个链接似乎已经失效了。<br/>
                            可能是发布者取消了分享，或者链接地址不正确。
                        </p>
                        
                        {/* 作者提示 - 仅作者可见 */}
                        {isUnpublishedAuthorView && (
                            <div className="mt-4 mx-auto inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded-md border border-amber-100 dark:border-amber-900/50">
                                <span>🔒 您是作者：应用已取消发布，外部访客将看到此页面</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
  }

  const { document, contentBlock } = data;

  return (
    <div className="min-h-screen bg-white dark:bg-[#191919] font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">
        {/* 顶部导航 */}
        <nav className="h-12 border-b border-gray-100 dark:border-gray-800 px-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-md z-10">
             <div className="flex items-center gap-2 text-sm text-gray-500">
                 <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{document.title || "无标题文档"}</span>
             </div>
             <div className="flex items-center gap-3">
                 <Link href="/" target="_blank" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                    <span className="font-medium">Atomic AI</span>
                 </Link>
             </div>
        </nav>

        {/* 文档内容主体 */}
        <main className="max-w-[46rem] mx-auto px-12 py-12 md:py-16">
            <article>
                {/* 标题区 */}
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6 leading-tight break-words">
                    {document.title || "无标题"}
                </h1>
                
                {/* 描述区 */}
                {document.description && (
                    <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        {document.description}
                    </p>
                )}

                {/* 正文内容 (只读模式的 Editor) */}
                <div className="prose-content">
                    <TiptapEditor 
                        content={contentBlock?.content || ""}
                        editable={false} // 只读模式
                        documentId={documentId}
                        // 隐藏 Toolbar
                        hideToolbar={true}
                    />
                </div>
            </article>
        </main>
    </div>
  );
}

