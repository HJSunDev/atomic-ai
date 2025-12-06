"use client";

import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FaceIcon } from "@/components/ai-assistant/FaceIcon";
import { toast } from "sonner";
import { FactoryAppCard } from "./_components/FactoryAppCard";
import { Id } from "@/convex/_generated/dataModel";

// 工坊主页-列表页
export default function FactoryListPage() {
  const router = useRouter();
  const createApp = useMutation(api.factory.mutations.createApp);
  const deleteApp = useMutation(api.factory.mutations.deleteApp);
  const renameApp = useMutation(api.factory.mutations.renameApp);
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

  const handleRename = async (appId: Id<"apps">, newName: string) => {
    await renameApp({ appId, name: newName });
  };

  const handleDelete = async (appId: Id<"apps">) => {
    await deleteApp({ appId });
  };

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
                  <FactoryAppCard 
                    key={app._id} 
                    app={app} 
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
               ))}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}
