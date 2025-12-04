"use client";

import { 
  FileText, 
  Clock, 
  Users, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/home/documentStore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// 格式化相对时间
const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

export const RecentlyVisited = () => {
  const router = useRouter();
  const { displayMode, openDocument } = useDocumentStore();
  const [apiCarousel, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const recentDocs = useQuery(api.prompt.queries.getRecentlyVisited, { limit: 14 });

  // 统一的文档打开处理函数
  const handleDocumentClick = useCallback((documentId: string) => {
    if (displayMode === 'fullscreen') {
      // 全屏模式：直接路由跳转
      router.push(`/home/prompt-document/${documentId}`);
    } else {
      // drawer/modal 模式：通过 Store 打开
      openDocument({ documentId });
    }
  }, [displayMode, openDocument, router]);

  // 监听轮播图状态变化
  useEffect(() => {
    if (!apiCarousel) return;

    const handleSelect = () => {
      setCanScrollPrev(apiCarousel.canScrollPrev());
      setCanScrollNext(apiCarousel.canScrollNext());
    };

    // 初始化状态
    handleSelect();

    // 监听滚动事件
    apiCarousel.on("select", handleSelect);

    return () => {
      apiCarousel.off("select", handleSelect);
    };
  }, [apiCarousel]);

  // 自定义滚动函数，每次滚动3个项目
  const scrollByThree = (direction: 'prev' | 'next') => {
    if (!apiCarousel) return;
    
    const slidesToScroll = 3;
    if (direction === 'prev') {
      // 向前滚动3个
      for (let i = 0; i < slidesToScroll; i++) {
        apiCarousel.scrollPrev();
      }
    } else {
      // 向后滚动3个
      for (let i = 0; i < slidesToScroll; i++) {
        apiCarousel.scrollNext();
      }
    }
  };

  // Loading State with Skeleton
  if (recentDocs === undefined) {
    return (
      <section className="mb-12">
        <div className="flex items-center mb-4">
          <Skeleton className="w-4 h-4 mr-2 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="w-[160px] h-[110px] rounded-xl shrink-0 bg-gray-100" />
          ))}
        </div>
      </section>
    );
  }

  const recentItems = recentDocs?.map(doc => ({
    id: doc._id,
    icon: <FileText className="w-5 h-5 text-gray-500" />,
    title: doc.title || "Untitled",
    subtitle: formatRelativeTime(doc.lastOpenedAt ?? doc._creationTime)
  })) || [];

  return (
    <section className="mb-12">
      <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Recently visited
      </h2>
      
      {recentItems.length > 0 ? (
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Carousel
            opts={{
              align: "start",
              skipSnaps: false,
            }}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent className="-ml-4">
              {recentItems.map((item) => (
                <CarouselItem key={item.id} className="pl-4 basis-auto">
                  <div 
                    className="group relative flex flex-col justify-between w-[160px] h-[110px] p-4 bg-white border border-gray-200 rounded-xl transition-colors duration-200 cursor-pointer hover:bg-[#F7F7F5]"
                    onClick={() => handleDocumentClick(item.id)}
                  >
                    
                    {/* Icon Area */}
                    <div className="flex items-start justify-between">
                       <div className="relative z-10">
                          {item.icon}
                       </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="mt-auto">
                       <h3 className="font-medium text-[13px] text-gray-900 leading-tight truncate mb-1 group-hover:text-gray-900">
                          {item.title}
                       </h3>
                       <p className="text-[11px] text-gray-400 font-normal truncate flex items-center group-hover:text-gray-500">
                          {item.subtitle}
                       </p>
                    </div>
                    
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* 左侧导航按钮 - 只有当可以向左滚动且鼠标悬停时才显示 */}
            {canScrollPrev && (
              <button
                onClick={() => scrollByThree('prev')}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 left-2 z-20",
                  "w-8 h-8 rounded-full bg-white shadow-md border border-gray-200",
                  "flex items-center justify-center transition-all duration-200 cursor-pointer",
                  "hover:bg-gray-50 hover:shadow-lg",
                  isHovering ? "opacity-100" : "opacity-0"
                )}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            
            {/* 右侧导航按钮 - 只有当可以向右滚动且鼠标悬停时才显示 */}
            {canScrollNext && (
              <button
                onClick={() => scrollByThree('next')}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 right-2 z-20",
                  "w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 cursor-pointer",
                  "flex items-center justify-center transition-all duration-200",
                  "hover:bg-gray-50 hover:shadow-lg",
                  isHovering ? "opacity-100" : "opacity-0"
                )}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </Carousel>
          
          {/* 左侧模糊渐变遮罩 */}
          <div 
            className={cn(
              "absolute top-0 left-0 h-full w-16 pointer-events-none z-10",
              "bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity duration-200",
              canScrollPrev ? "opacity-100" : "opacity-0"
            )}
          />
          
          {/* 右侧模糊渐变遮罩 */}
          <div 
            className={cn(
              "absolute top-0 right-0 h-full w-16 pointer-events-none z-10",
              "bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity duration-200",
              canScrollNext ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      ) : (
        // 极简空状态 - Notion风格 Ver.2
        <div className="w-full h-[120px] flex flex-col items-center justify-center rounded-xl">
          <Clock className="w-5 h-5 text-gray-200 mb-2" strokeWidth={1.5} />
          <p className="text-xs text-gray-400 font-medium">
            No pages visited yet
          </p>
        </div>
      )}
    </section>
  );
};
