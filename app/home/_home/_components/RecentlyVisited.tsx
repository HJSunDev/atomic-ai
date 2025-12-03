"use client";

import { 
  FileText, 
  Clock, 
  Users, 
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

// 最近访问的项目数据
const recentItems = [
  {
    id: 1,
    icon: <FileText className="w-5 h-5 text-gray-500" />,
    title: "7号-周日",
    subtitle: "H Sep 7"
  },
  {
    id: 2,
    icon: <span className="text-xl">💌</span>,
    title: "SocialContact",
    subtitle: "H Jun 27"
  },
  {
    id: 3,
    icon: <FileText className="w-5 h-5 text-gray-500" />,
    title: "时光日志",
    subtitle: "H 17h ago"
  },
  {
    id: 4,
    icon: (
      <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center border border-blue-100">
        <Users className="w-3 h-3 text-blue-600" />
      </div>
    ),
    title: "2025",
    subtitle: "H Aug 12"
  },
  {
    id: 5,
    icon: (
      <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
        <LayoutGrid className="w-3 h-3 text-gray-600" />
      </div>
    ),
    title: "模型仓库 (方法论)",
    subtitle: "H Aug 12"
  },
  {
    id: 6,
    icon: <FileText className="w-5 h-5 text-gray-500" />,
    title: "Cursor 使用教程",
    subtitle: "H 2h ago"
  }
];

export const RecentlyVisited = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // 监听轮播图状态变化
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    // 初始化状态
    handleSelect();

    // 监听滚动事件
    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  // 自定义滚动函数，每次滚动3个项目
  const scrollByThree = (direction: 'prev' | 'next') => {
    if (!api) return;
    
    const slidesToScroll = 3;
    if (direction === 'prev') {
      // 向前滚动3个
      for (let i = 0; i < slidesToScroll; i++) {
        api.scrollPrev();
      }
    } else {
      // 向后滚动3个
      for (let i = 0; i < slidesToScroll; i++) {
        api.scrollNext();
      }
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Recently visited
      </h2>
      
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
                <div className="group relative flex flex-col justify-between w-[160px] h-[110px] p-4 bg-white border border-gray-200 rounded-xl transition-colors duration-200 cursor-pointer hover:bg-[#F7F7F5]">
                  
                  {/* Icon Area */}
                  <div className="flex items-start justify-between">
                     <div className="relative z-10">
                        {item.icon}
                     </div>
                     {/* Optional: Subtle corner decoration or action trigger could go here */}
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
    </section>
  );
};
