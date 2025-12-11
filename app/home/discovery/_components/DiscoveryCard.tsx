
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Heart, GitFork, FileText, AppWindow, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DiscoveryItem } from "@/convex/discovery/queries";

interface DiscoveryCardProps {
  item: DiscoveryItem;
}

export function DiscoveryCard({ item }: DiscoveryCardProps) {
  const router = useRouter();
  const isApp = item.type === 'app';
  const [isForking, setIsForking] = useState(false);

  // Mutations
  const toggleLike = useMutation(api.discovery.mutations.toggleLike);
  const viewItem = useMutation(api.discovery.mutations.viewItem);
  const forkDocument = useMutation(api.prompt.mutations.forkDocument);
  const forkApp = useMutation(api.factory.mutations.forkApp);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // 乐观更新由后端状态返回或重新获取处理
      // 由于此处没有乐观更新逻辑，我们依赖响应性
      await toggleLike({ targetId: item.id, targetType: item.type });
    } catch (error) {
      toast.error("Please login to like items");
    }
  };

  const handleFork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isForking) return;
    
    setIsForking(true);
    try {
      if (item.type === 'prompt') {
        const newId = await forkDocument({ documentId: item.id as any });
        toast.success("Document cloned successfully!");
        router.push(`/home/prompt/${newId}`);
      } else {
        const newId = await forkApp({ appId: item.id as any });
        toast.success("App cloned successfully!");
        router.push(`/home/ai-creation/${newId}`);
      }
    } catch (error) {
      toast.error("Failed to clone item");
      console.error(error);
    } finally {
      setIsForking(false);
    }
  };

  const handleClick = () => {
    // 增加浏览量 (无需等待返回)
    viewItem({ targetId: item.id, targetType: item.type });
    
    // 在新标签页打开分享页
    const url = item.type === 'prompt' 
      ? `/share/prompt-document/${item.id}` 
      : `/share/factory/${item.id}`;
      
    window.open(url, '_blank');
  };

  return (
    <div 
      onClick={handleClick}
      className="group flex flex-col h-full bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* 卡片头部 / 预览区域 */}
      <div className={cn(
        "relative w-full overflow-hidden border-b border-gray-100 dark:border-gray-800",
        isApp ? "aspect-[16/10]" : "aspect-[16/10] p-6 bg-gray-50/50 dark:bg-gray-900/50"
      )}>
        {isApp ? (
          // --- 应用视觉预览 (简化版 FactoryAppCard) ---
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 flex flex-col select-none">
             {/* 中心图标/预览 - 装饰性 */}
             <div className="w-full h-full bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col opacity-80 group-hover:scale-[1.02] transition-transform duration-500 ease-out">
                {/* 窗口头部 */}
                <div className="h-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center px-2 gap-1.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/20" />
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400/20" />
                </div>
                {/* 窗口主体 (抽象UI) */}
                <div className="flex-1 flex relative overflow-hidden">
                  <div className="w-[28%] border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 p-2 flex flex-col gap-1.5">
                    <div className="h-1.5 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-1 mt-1">
                      <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
                      <div className="h-1 w-3/4 rounded-full bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                  <div className="flex-1 p-2 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-primary/5 shrink-0" />
                      <div className="space-y-1 flex-1">
                         <div className="h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </div>
                    <div className="h-8 w-full rounded border border-gray-100 dark:border-gray-800 bg-gray-50/30" />
                    <div className="space-y-1">
                      <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800" />
                      <div className="h-1 w-2/3 rounded-full bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          // --- 提示词文本预览 ---
          <div className="flex flex-col h-full">
            <div className="mb-3">
               <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm text-gray-400">
                  <FileText className="w-4 h-4" />
               </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-mono leading-relaxed line-clamp-4 select-none">
              {item.description}
            </p>
            {/* 渐隐效果 */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 dark:from-[#131313] to-transparent" />
          </div>
        )}

        {/* 类型标签 (右上角) */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-sm border border-gray-100 dark:border-gray-800 text-[10px] font-medium text-gray-500 h-5 px-1.5">
            {isApp ? <AppWindow className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
            {isApp ? 'App' : 'Prompt'}
          </Badge>
        </div>
      </div>

      {/* 卡片主体 */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {item.title}
        </h3>
        
        {isApp && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-4 mt-auto pt-2">
          {item.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              #{tag}
            </span>
          ))}
        </div>

        {/* 底部: 作者与统计 */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 mt-auto">
          {/* 作者 */}
          <div className="flex items-center gap-2">
             <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                {item.author.avatar ? (
                    <img src={item.author.avatar} alt={item.author.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[9px] font-bold text-gray-600 dark:text-gray-300">
                        {item.author.name?.substring(0, 2).toUpperCase() || "??"}
                    </span>
                )}
             </div>
             <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                {item.author.name || "Anonymous"}
             </span>
          </div>

          {/* 统计数据 */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {item.stats.views !== undefined && (
              <div className="flex items-center gap-1 hover:text-gray-600 transition-colors cursor-default" title="Views">
                 <Eye className="w-3.5 h-3.5" />
                 <span>{formatNumber(item.stats.views)}</span>
              </div>
            )}
            <div 
                className={cn(
                    "flex items-center gap-1 transition-colors cursor-pointer",
                    item.isLikedByMe ? "text-red-500" : "hover:text-red-500"
                )}
                onClick={handleLike}
                title="Like"
            >
               <Heart className={cn("w-3.5 h-3.5", item.isLikedByMe && "fill-current")} />
               <span>{formatNumber(item.stats.likes || 0)}</span>
            </div>
            
            <div 
                className={cn(
                  "flex items-center gap-1 transition-colors cursor-pointer",
                  isForking ? "text-blue-500" : "hover:text-blue-500"
                )}
                onClick={handleFork}
                title="Fork / Clone"
            >
                {isForking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <GitFork className="w-3.5 h-3.5" />
                )}
               <span>{formatNumber(item.stats.clones || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
