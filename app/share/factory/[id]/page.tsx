"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, Ghost, Sparkles, Command } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateMicroAppHtml, HTML_EMPTY_TEMPLATE } from "@/app/home/factory/[id]/_components/html/templates-html";

export default function ShareFactoryPage() {
  const params = useParams();
  const appId = params.id as Id<"apps">;
  
  // 复用已有的查询，它会自动处理公开访问权限
  const app = useQuery(api.factory.queries.getApp, { appId });

  if (app === undefined) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  // 这里的逻辑处理了两种情况：
  // 1. app === null: 用户无权访问（不是作者且未发布）
  // 2. app 存在但 !isPublished: 用户是作者（后端允许访问），但应用处于未发布状态
  //    为了回应用户的“取消发布”操作，我们在分享页强制显示“不可用”，以模拟外部用户视角
  const isUnpublishedAuthorView = app && !app.isPublished;

  if (app === null || isUnpublishedAuthorView) {
    return (
        <div className="min-h-screen w-full flex flex-col bg-[#F7F7F5] dark:bg-[#191919] font-sans">
            {/* 顶部品牌栏 - 极简 Notion 风格 */}
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
            <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-14">
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
            </div>
        </div>
    );
  }

  // 生成完整的 HTML 文档
  // 直接使用 latestCode；分享页展示的是当前保存/发布的快照
  // 说明：generateMicroAppHtml 内部会同时处理原生 HTML 和 React/Babel 场景
  const fullHtml = generateMicroAppHtml({ 
    title: app.name, 
    code: app.latestCode || HTML_EMPTY_TEMPLATE, 
    theme: 'light' 
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
        <iframe
            srcDoc={fullHtml}
            className="w-full h-full border-none block"
            title={app.name}
            // 安全沙箱：禁止同源，避免访问主站 Cookie/Storage，但允许必需的能力运行应用
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-downloads allow-presentation"
            allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; web-share"
        />
    </div>
  );
}
