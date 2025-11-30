"use client";

import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Calendar, GitCommitHorizontal, MoreHorizontal, Search, Box } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FaceIcon } from "@/components/ai-assistant/FaceIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// 工坊主页-列表页
export default function FactoryListPage() {
  const router = useRouter();
  const createApp = useMutation(api.factory.mutations.createApp);
  const apps = useQuery(api.factory.queries.listApps);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateNew = async () => {
    const newAppId = await createApp({ 
        prompt: "新空白应用",
        name: "未命名应用"
    });
    router.push(`/home/factory/${newAppId}`);
  };

  // 过滤逻辑
  const filteredApps = apps?.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-background font-sans selection:bg-primary/10">
      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
        
        {/* Header Section */}
        <header className="mb-16 relative">
           {/* Decor */}
           <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
           
           <div className="relative z-10">
             <div className="mb-6 inline-flex items-center justify-center w-16 h-16">
                <FaceIcon className="w-16 h-16 text-foreground/80" />
             </div>
             
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
                <div className="space-y-2 max-w-2xl">
                   <h1 className="text-4xl font-bold tracking-tight text-foreground">
                      AI 微应用工坊
                   </h1>
                   <p className="text-lg text-muted-foreground/80 font-light leading-relaxed">
                      这里是你的创意孵化基地。无需复杂编程，将瞬间的灵感转化为可交互、可分享的微应用。
                   </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                   <div className="relative w-full md:w-64 hidden md:block group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary/70 transition-colors" />
                      <Input 
                        placeholder="搜索应用..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/5 focus-visible:border-primary/20 hover:bg-muted/50 transition-all rounded-full h-9 text-sm shadow-none"
                      />
                   </div>
                   <Button 
                      onClick={handleCreateNew} 
                      size="lg" 
                      className="rounded-md px-4 shadow-sm hover:shadow transition-all duration-200 bg-primary text-primary-foreground border border-primary/10 h-9 text-sm font-medium"
                   >
                      <Plus className="w-4 h-4 mr-2" />
                      新建项目
                   </Button>
                </div>
             </div>
           </div>
        </header>

        {/* Content Section */}
        <section>
          {apps === undefined ? (
            // Loading State
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-muted/20 animate-pulse border border-transparent" />
               ))}
            </div>
          ) : apps.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 border border-dashed border-border/50 rounded-3xl bg-muted/5">
               <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
                  <Box className="w-10 h-10 text-muted-foreground/40" />
               </div>
               <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">暂无项目</h3>
                  <p className="text-muted-foreground">你还没有创建任何应用。点击“新建项目”开始你的创造之旅吧。</p>
               </div>
               <Button variant="outline" onClick={handleCreateNew} className="rounded-full">
                  立即创建
               </Button>
            </div>
          ) : (
            // Grid List
            <article className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
               {filteredApps?.map((app) => (
                  <Link href={`/home/factory/${app._id}`} key={app._id} className="group outline-none">
                     <section className="flex flex-col gap-3 p-2 -m-2 rounded-2xl hover:bg-muted/40 dark:hover:bg-muted/10 transition-all duration-200 cursor-pointer group-focus-visible:ring-2 ring-primary/20">
                        {/* Preview Card */}
                        <div className="relative aspect-[16/10] rounded-xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/40 overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-border/80 transition-all">
                           {/* Placeholder Pattern */}
                           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} 
                           />
                           
                           {/* Center Icon/Preview */}
                           <div className="absolute inset-0 p-5 flex flex-col select-none pointer-events-none overflow-hidden">
                              {/* 模拟一个精致的应用窗口骨架 */}
                              <div className="w-full h-full bg-background shadow-sm rounded-lg border border-border/60 flex flex-col opacity-50 group-hover:opacity-80 group-hover:translate-y-[-4px] group-hover:shadow-md transition-all duration-500">
                                 {/* Window Header */}
                                 <div className="h-5 border-b border-border/40 bg-muted/30 flex items-center px-3 gap-1.5 shrink-0">
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                                    <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                                 </div>
                                 {/* App Body */}
                                 <div className="flex-1 flex bg-background/40 relative">
                                    {/* Sidebar Skeleton */}
                                    <div className="w-[30%] border-r border-border/40 bg-muted/5 p-2.5 flex flex-col gap-2">
                                       <div className="h-2 w-10 rounded-full bg-muted-foreground/10" />
                                       <div className="space-y-1.5 mt-1">
                                          <div className="h-1.5 w-full rounded-full bg-muted-foreground/5" />
                                          <div className="h-1.5 w-3/4 rounded-full bg-muted-foreground/5" />
                                          <div className="h-1.5 w-5/6 rounded-full bg-muted-foreground/5" />
                                       </div>
                                    </div>
                                    {/* Content Skeleton */}
                                    <div className="flex-1 p-3 space-y-3">
                                       <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-md bg-primary/5 shrink-0" />
                                          <div className="space-y-1 flex-1">
                                             <div className="h-2 w-16 rounded-full bg-muted-foreground/10" />
                                             <div className="h-1.5 w-24 rounded-full bg-muted-foreground/5" />
                                          </div>
                                       </div>
                                       <div className="h-16 w-full rounded border border-border/20 bg-muted/5" />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Top Right Actions (Visible on Hover) */}
                           <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur shadow-sm hover:bg-background">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); /* TODO: rename */ }}>重命名</DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); /* TODO: delete */ }} className="text-red-600 focus:text-red-600">删除</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                           </div>
                        </div>

                        {/* Meta Info */}
                        <div className="px-1 space-y-1">
                           <div className="flex items-start justify-between gap-4">
                              <h3 className="font-semibold text-lg text-foreground/90 group-hover:text-primary transition-colors line-clamp-1">
                                 {app.name}
                              </h3>
                              {app.isPublished && (
                                 <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 h-5 font-normal bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-transparent">
                                    Public
                                 </Badge>
                              )}
                           </div>
                           
                           <div className="flex items-center gap-3 text-xs text-muted-foreground/60 font-medium">
                              <div className="flex items-center gap-1">
                                 <GitCommitHorizontal className="w-3.5 h-3.5" />
                                 <span>v{app.v}</span>
                              </div>
                              <div className="w-0.5 h-0.5 rounded-full bg-current" />
                              <div className="flex items-center gap-1">
                                 <Calendar className="w-3.5 h-3.5" />
                                 <span>{new Date(app.creationTime).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>
                     </section>
                  </Link>
               ))}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
