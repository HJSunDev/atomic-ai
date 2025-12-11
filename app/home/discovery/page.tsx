"use client";

import { useEffect, useMemo, useState } from "react";
import { useSidebarMenuStore } from "@/store/home";
import { useManageAiContext } from "@/hooks/useAiContext";
import { DiscoveryCard } from "./_components/DiscoveryCard";
import { Search, Sparkles, Filter, Telescope, FolderOpen, ArrowUpAZ, ArrowDownAZ, SortAsc, SortDesc, SlidersHorizontal, Check, Eye, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DISCOVERY_CONTEXT = {
  id: "discovery-module",
  type: "discovery",
  showCatalyst: false,
  catalystPlacement: "global",
} as const;

type SortOption = 'latest' | 'popular' | 'likes';

export default function DiscoveryPage() {
  const setActiveMenu = useSidebarMenuStore((state) => state.setActiveMenu);

  // AI Context
  const context = useMemo(() => DISCOVERY_CONTEXT, []);
  useManageAiContext(context);

  useEffect(() => {
    setActiveMenu("discovery");
  }, [setActiveMenu]);

  // State
  const [activeTab, setActiveTab] = useState<'all' | 'prompt' | 'app'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Data Fetching
  const items = useQuery(api.discovery.queries.listDiscoveryItems, { 
    filter: activeTab,
    searchQuery: debouncedSearchQuery,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    sortBy,
  });

  const isLoading = items === undefined;

  // 从已加载的项目中推导唯一标签（用于过滤选项）
  // 在实际应用中，这可能来自单独的查询或静态列表
  const availableTags = useMemo(() => {
    if (!items) return [];
    const tags = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [items]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setSortBy("latest");
    setSelectedTags([]);
  };

  const hasActiveFilters = activeTab !== 'all' || searchQuery || selectedTags.length > 0 || sortBy !== 'latest';

  return (
    <div className="h-full w-full overflow-y-auto bg-white dark:bg-[#161616]">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 min-h-full flex flex-col">
        
        {/* 头部区域 */}
        <header className="mb-8 flex-none">
          <div className="flex flex-col gap-6">
            
            {/* 标题与描述 */}
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary/80" />
                Discovery
              </h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-base leading-relaxed">
                Explore a curated collection of community-shared prompts and micro-apps. 
                Find inspiration, clone workflows, and accelerate your creation.
              </p>
            </div>

            {/* 控制工具栏 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mt-4">
              
              {/* 类型标签 (左侧) */}
              <div className="flex items-center p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg w-fit">
                {(['all', 'prompt', 'app'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 capitalize cursor-pointer",
                      activeTab === tab 
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    )}
                  >
                    {tab === 'all' ? 'All Items' : tab + 's'}
                  </button>
                ))}
              </div>

              {/* 搜索与筛选 (右侧) */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search topics..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400 dark:focus-visible:border-gray-600"
                    />
                 </div>
                 
                 {/* 筛选菜单 */}
                 <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={cn(
                          "h-9 border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 hover:text-gray-900 cursor-pointer",
                          (selectedTags.length > 0 || sortBy !== 'latest') && "border-solid border-primary/50 text-primary bg-primary/5"
                        )}
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filter & Sort
                        {(selectedTags.length > 0) && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-gray-200 dark:bg-gray-700">
                            {selectedTags.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0" align="end">
                      <Command>
                        <CommandList>
                          <CommandGroup heading="Sort By">
                            <CommandItem onSelect={() => setSortBy('latest')} className="justify-between">
                              <div className="flex items-center">
                                <SortDesc className="mr-2 h-4 w-4" />
                                Newest
                              </div>
                              {sortBy === 'latest' && <Check className="h-4 w-4" />}
                            </CommandItem>
                            <CommandItem onSelect={() => setSortBy('popular')} className="justify-between">
                              <div className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Most Viewed
                              </div>
                              {sortBy === 'popular' && <Check className="h-4 w-4" />}
                            </CommandItem>
                            <CommandItem onSelect={() => setSortBy('likes')} className="justify-between">
                              <div className="flex items-center">
                                <Heart className="mr-2 h-4 w-4" />
                                Most Liked
                              </div>
                              {sortBy === 'likes' && <Check className="h-4 w-4" />}
                            </CommandItem>
                          </CommandGroup>
                          
                          <CommandSeparator />
                          
                          <CommandGroup heading="Tags">
                            {availableTags.length > 0 ? (
                              availableTags.map(tag => (
                                <CommandItem key={tag} onSelect={() => toggleTag(tag)} className="justify-between">
                                  <span>{tag}</span>
                                  {selectedTags.includes(tag) && <Check className="h-4 w-4" />}
                                </CommandItem>
                              ))
                            ) : (
                              <CommandItem disabled>No tags available</CommandItem>
                            )}
                          </CommandGroup>

                          {(selectedTags.length > 0 || sortBy !== 'latest') && (
                            <>
                              <CommandSeparator />
                              <CommandGroup>
                                <CommandItem 
                                  onSelect={() => {
                                    setSelectedTags([]);
                                    setSortBy('latest');
                                  }}
                                  className="justify-center text-center text-muted-foreground"
                                >
                                  Clear all filters
                                </CommandItem>
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                 </Popover>
              </div>

            </div>
            
            {/* 已选筛选条件展示 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center -mt-2">
                <span className="text-xs text-muted-foreground">Active tags:</span>
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                    <span className="ml-1 text-muted-foreground">×</span>
                  </Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedTags([])}
                  className="h-5 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Clear tags
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* 内容网格 */}
        <main className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[320px] bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : items && items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <DiscoveryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            // 空状态
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 min-h-[200px]">
              {hasActiveFilters ? (
                 // 搜索/筛选无结果
                <>
                  <FolderOpen className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-4 stroke-[1.5]" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    No results found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-center mb-6 leading-relaxed">
                    No items match your current filter. Try adjusting your search keywords or removing filters.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="h-8 px-3 text-xs border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Clear all filters
                  </Button>
                </>
              ) : (
                // 初始空状态
                <>
                  <Telescope className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-4 stroke-[1.5]" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200">
                    No items yet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs text-center leading-relaxed">
                    The collection is currently empty. Be the first to discover new prompts and apps.
                  </p>
                </>
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
