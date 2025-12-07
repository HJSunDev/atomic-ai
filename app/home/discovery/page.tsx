"use client";

import { useEffect, useMemo, useState } from "react";
import { useSidebarMenuStore } from "@/store/home";
import { useManageAiContext } from "@/hooks/useAiContext";
import { MOCK_DISCOVERY_ITEMS, DiscoveryItemType } from "./data";
import { DiscoveryCard } from "./_components/DiscoveryCard";
import { Search, Sparkles, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISCOVERY_CONTEXT = {
  id: "discovery-module",
  type: "discovery",
  showCatalyst: false,
  catalystPlacement: "global",
} as const;

export default function DiscoveryPage() {
  const setActiveMenu = useSidebarMenuStore((state) => state.setActiveMenu);

  // AI Context
  const context = useMemo(() => DISCOVERY_CONTEXT, []);
  useManageAiContext(context);

  // Sync Sidebar
  useEffect(() => {
    setActiveMenu("discovery");
  }, [setActiveMenu]);

  // State
  const [activeTab, setActiveTab] = useState<'all' | 'prompt' | 'app'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Logic
  const filteredItems = useMemo(() => {
    return MOCK_DISCOVERY_ITEMS.filter(item => {
      const matchesTab = activeTab === 'all' || item.type === activeTab;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="h-full w-full overflow-y-auto bg-white dark:bg-[#161616]">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-16">
        
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex flex-col gap-6">
            
            {/* Title & Description */}
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

            {/* Controls Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6 mt-4">
              
              {/* Tabs */}
              <div className="flex items-center p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg w-fit">
                {(['all', 'prompt', 'app'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 capitalize",
                      activeTab === tab 
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    )}
                  >
                    {tab === 'all' ? 'All Items' : tab + 's'}
                  </button>
                ))}
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search topics, tags..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                    />
                 </div>
                 {/* Optional: Filter Button */}
                 <Button variant="outline" size="icon" className="h-9 w-9 border-gray-200 dark:border-gray-800 text-gray-500">
                    <Filter className="w-4 h-4" />
                 </Button>
              </div>

            </div>
          </div>
        </header>

        {/* Content Grid */}
        <main className="min-h-[400px]">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <DiscoveryCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No items found
              </h3>
              <p className="text-sm text-gray-400 max-w-sm">
                We couldn't find anything matching "{searchQuery}". Try adjusting your filters or search terms.
              </p>
              <Button 
                variant="link" 
                onClick={() => { setSearchQuery(""); setActiveTab("all"); }}
                className="mt-2 text-primary"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
