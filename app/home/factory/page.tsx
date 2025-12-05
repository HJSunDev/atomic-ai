"use client";

import { Button } from "@/components/ui/button";
import { Plus, GitCommitHorizontal, MoreHorizontal, Search, Box, Calendar } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
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
  const isLoading = apps === undefined;
  const isEmpty = Array.isArray(apps) && apps.length === 0;

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
    <div className="h-full overflow-y-auto bg-background font-sans selection:bg-primary/10">
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        
        {/* Header Section */}
        <header className="mb-12 relative">
           {/* Decor */}
           <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
           
           <div className="relative z-10">
             <div className="mb-6 inline-flex items-center justify-center w-16 h-16">
                <FaceIcon className="w-16 h-16 text-foreground/80" />
             </div>
             
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
                <div className="space-y-2 max-w-2xl">
                   <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                      AI 微应用工坊
                   </h1>
                   <p className="text-lg text-muted-foreground/80 font-light leading-relaxed">
                      这里是你的创意孵化基地。无需复杂编程，将瞬间的灵感转化为可交互、可分享的微应用。
                   </p>
                </div>
                
                <div className="flex items-center gap-2.5 shrink-0">
                   <div className="relative w-full md:w-64 hidden md:block group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary/70 transition-colors" />
                      <Input 
                        placeholder="搜索应用..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/5 focus-visible:border-primary/20 hover:bg-muted/50 transition-all rounded-full h-9 text-sm shadow-none"
                      />
                   </div>
                   {!isEmpty && (
                     <Button 
                        onClick={handleCreateNew} 
                        size="sm" 
                        className="h-9 px-4 rounded-full shadow-sm hover:shadow-md transition-all duration-200 bg-primary text-primary-foreground border border-primary/10 text-sm font-medium cursor-pointer"
                     >
                        <Plus className="w-4 h-4 mr-1.5" />
                        新建项目
                     </Button>
                   )}
                </div>
             </div>
           </div>
        </header>

        {/* Content Section */}
        <section>
          {isLoading ? (
            // Loading State - Skeleton cards
            <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3 p-2 -m-2">
                     <div className="relative aspect-[16/10] rounded-xl bg-muted/30 border border-border/40 overflow-hidden animate-pulse" />
                     <div className="space-y-2 px-1">
                        <div className="h-3 w-2/3 rounded-full bg-muted/40" />
                        <div className="h-2.5 w-1/2 rounded-full bg-muted/30" />
                     </div>
                  </div>
               ))}
            </article>
          ) : apps.length === 0 ? (
            // Empty State - Notion Style (Clean, Text-Only)
            <div className="flex flex-col items-center justify-center min-h-[32vh] text-center">
               <p className="text-sm text-foreground/80 font-medium tracking-tight mb-1">
                  这里还没有应用
               </p>
               <p className="text-[12px] text-muted-foreground/50 mb-5">
                  用一个简短的提示创建你的第一个作品。
               </p>
               <Button 
                  onClick={handleCreateNew} 
                  variant="ghost"
                  className="h-8 px-3 text-xs font-normal text-muted-foreground hover:text-primary hover:bg-primary/5 border border-dashed border-border hover:border-primary/30 transition-all rounded-md"
               >
                  <Plus className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                  新建项目
               </Button>
            </div>
          ) : (
            // Grid List - 优化 Grid 布局，增加 xl 断点
            <article className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
               {filteredApps?.map((app) => (
                  <Link href={`/home/factory/${app._id}`} key={app._id} className="group outline-none">
                     <section className="flex flex-col gap-3 p-2 -m-2 rounded-2xl hover:bg-muted/40 dark:hover:bg-muted/10 transition-all duration-200 cursor-pointer group-focus-visible:ring-2 ring-primary/20">
                        {/* Preview Card - 保持网站结构模拟 */}
                        <div className="relative aspect-[16/10] rounded-xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/40 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                           {/* Center Icon/Preview */}
                           <div className="absolute inset-0 p-4 flex flex-col select-none pointer-events-none overflow-hidden">
                              {/* 模拟一个精致的应用窗口骨架 */}
                              <div className="w-full h-full bg-background shadow-sm rounded-lg border border-border/60 flex flex-col opacity-60 group-hover:opacity-90 group-hover:translate-y-[-4px] group-hover:scale-[1.02] group-hover:shadow-md transition-all duration-500 ease-out">
                                 {/* Window Header */}
                                 <div className="h-4 md:h-5 border-b border-border/40 bg-muted/30 flex items-center px-2 md:px-3 gap-1.5 shrink-0">
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-400/20" />
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-yellow-400/20" />
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400/20" />
                                 </div>
                                 {/* App Body */}
                                 <div className="flex-1 flex bg-background/40 relative overflow-hidden">
                                    {/* Sidebar Skeleton */}
                                    <div className="w-[28%] border-r border-border/40 bg-muted/5 p-2 flex flex-col gap-1.5">
                                       <div className="h-1.5 w-8 rounded-full bg-muted-foreground/10" />
                                       <div className="space-y-1 mt-1">
                                          <div className="h-1 w-full rounded-full bg-muted-foreground/5" />
                                          <div className="h-1 w-3/4 rounded-full bg-muted-foreground/5" />
                                          <div className="h-1 w-5/6 rounded-full bg-muted-foreground/5" />
                                       </div>
                                    </div>
                                    {/* Content Skeleton */}
                                    <div className="flex-1 p-2 space-y-2">
                                       <div className="flex items-center gap-1.5">
                                          <div className="w-4 h-4 rounded bg-primary/5 shrink-0" />
                                          <div className="space-y-1 flex-1">
                                             <div className="h-1.5 w-12 rounded-full bg-muted-foreground/10" />
                                          </div>
                                       </div>
                                       <div className="h-12 w-full rounded border border-border/20 bg-muted/5" />
                                       <div className="space-y-1">
                                          <div className="h-1 w-full rounded-full bg-muted-foreground/5" />
                                          <div className="h-1 w-2/3 rounded-full bg-muted-foreground/5" />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Top Right Actions (Visible on Hover) */}
                           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md bg-background/80 backdrop-blur shadow-sm hover:bg-background border border-border/20">
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
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
                        <div className="px-1 space-y-1.5">
                           <div className="flex items-start justify-between gap-4">
                              <h3 className="font-medium text-base text-foreground/90 group-hover:text-primary transition-colors line-clamp-1">
                                 {app.name}
                              </h3>
                              {app.isPublished && (
                                 <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 h-4.5 font-normal bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-transparent">
                                    Public
                                 </Badge>
                              )}
                           </div>
                           
                           <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60 font-medium">
                              <div className="flex items-center gap-1">
                                 <GitCommitHorizontal className="w-3 h-3" />
                                 <span>v{app.v}</span>
                              </div>
                              <div className="w-0.5 h-0.5 rounded-full bg-current" />
                              <div className="flex items-center gap-1">
                                 <Calendar className="w-3 h-3" />
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

