"use client";

import { useEffect } from "react";
import { useSidebarMenuStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Plus, AppWindow } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

export default function FactoryListPage() {
  const { setActiveMenu } = useSidebarMenuStore();
  const router = useRouter();
  const createApp = useMutation(api.app_generation.mutations.createApp);
  
  // 同步侧边栏状态
  useEffect(() => {
    setActiveMenu("factory"); 
  }, [setActiveMenu]);

  // 获取应用列表
  const apps = useQuery(api.app_generation.queries.listApps);

  const handleCreateNew = async () => {
    // 临时：直接创建一个空的，实际应该弹窗输入Prompt
    // 这一步通常由 ai-creation 模块负责，这里仅作快速入口
    const newAppId = await createApp({ 
        prompt: "新空白应用",
        name: "新应用 " + new Date().toLocaleTimeString()
    });
    router.push(`/home/factory/${newAppId}`);
  };

  return (
    <div className="flex flex-col h-full p-8 bg-muted/10 overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">AI 微应用工坊</h1>
            <p className="text-muted-foreground mt-1">管理和浏览你生成的微应用。</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus size={16} /> 新建项目
        </Button>
      </div>

      {/* 列表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {apps === undefined ? (
            // Loading 骨架屏
            Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl border" />
            ))
        ) : apps.length === 0 ? (
            // 空状态
            <div className="col-span-full flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
                <AppWindow size={48} className="mb-4 opacity-20" />
                <p>还没有任何项目，去创建一个吧</p>
            </div>
        ) : (
            // 列表内容
            apps.map((app) => (
                <Link href={`/home/factory/${app._id}`} key={app._id} className="group block">
                    <div className="border rounded-xl p-6 h-48 bg-card hover:shadow-md transition-all flex flex-col justify-between group-hover:border-primary/50">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-primary/10 rounded-md text-primary">
                                    <AppWindow size={20} />
                                </div>
                                <span className="font-semibold truncate flex-1">{app.name}</span>
                                {app.isPublished && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200">
                                        公开
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                {app.prompt}
                            </p>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between items-center border-t pt-4 mt-2">
                            <span className="font-mono bg-muted px-1.5 rounded">v{app.v}</span>
                            <span>{new Date(app.creationTime).toLocaleDateString()}</span>
                        </div>
                    </div>
                </Link>
            ))
        )}
      </div>
    </div>
  );
}

