import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AtSign, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// 添加上下文组件
export function ContextAdder() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // 占位数据 - 后续替换为真实数据
  const contextItems = [
    { id: 1, title: "场景驱动的 AI 上下文技术 (Scene-Driven AI)", type: "时光日志" },
    { id: 2, title: "模型仓库 (方法论)", type: "2025" },
    { id: 3, title: "时光日志", type: "时光日志" },
    { id: 4, title: "Zustand Store 反冲命令规则", type: "2025 - ../New database" },
    { id: 5, title: "提示词仓库", type: "提示词仓库" },
  ];

  const filteredItems = contextItems.filter(item =>
    item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.type.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center h-7 px-2 rounded-full border border-gray-200 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors bg-white"
        >
          <AtSign className="mr-0.5 h-3.5 w-3.5 opacity-70" />
          Add context
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.type}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
