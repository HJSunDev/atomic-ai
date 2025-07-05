import React, { useState, useMemo } from "react";
import { Loader2, ChevronDown, Pin } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

// AI模型列表组件
export function AiModelList() {
  // 仅需一个查询即可获取所有模型及其置顶状态
  const allModels = useQuery(api.userModelPreferences.queries.getAvailableModelsForUser);
  
  // 定义置顶和取消置顶的mutation
  const pinModel = useMutation(api.userModelPreferences.mutations.pinModel);
  const unpinModel = useMutation(api.userModelPreferences.mutations.unpinModel);

  // 控制"更多"列表的显示状态
  const [isMoreVisible, setIsMoreVisible] = useState(false);
  // 当前选中的模型 (这里暂时用一个假数据，后续可以接入全局状态)
  const [selectedModelId, setSelectedModelId] = useState("claude-3.5-sonnet");

  // 在前端对模型列表进行排序：置顶的在前，未置顶的在后
  const sortedModels = useMemo(() => {
    if (!allModels) return [];
    
    return [...allModels].sort((a, b) => {
      // 规则1: 置顶的模型排在前面
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 规则2: 如果都是置顶模型，按 'order' 字段升序排列
      if (a.isPinned && b.isPinned) {
        return (a.order || 999) - (b.order || 999);
      }

      // 规则3: 如果都是未置顶模型，保持原有顺序
      return 0;
    });
  }, [allModels]);

  // 根据展开/收起状态，决定要显示的列表
  const modelsToShow = isMoreVisible ? sortedModels : sortedModels.slice(0, 4);
  // 判断是否有更多模型可以展开
  const hasMoreModels = sortedModels.length > 4;

  // 处理星标点击事件
  const handleTogglePin = (modelId: string, isPinned: boolean) => {
    if (isPinned) {
      unpinModel({ modelId });
    } else {
      pinModel({ modelId });
    }
  };

  // 数据加载中状态
  if (allModels === undefined) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">加载模型...</span>
      </div>
    );
  }

  // 渲染单个模型项的函数
  const renderModelItem = (model: {
    modelId: string,
    isPinned: boolean
  }) => {
    const isSelected = model.modelId === selectedModelId;
    return (
      <div
        key={model.modelId}
        className={cn(
          "group flex items-center p-[7px] mx-2 my-0.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-[#27272A]",
          isSelected && "bg-gray-100 dark:bg-[#27272A]"
        )}
        onClick={() => setSelectedModelId(model.modelId)}
      >
        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 mr-2"></div>
        <span className="text-xs font-medium flex-1 truncate">
          {model.modelId}
        </span>
        <div
          className={cn(
            "ml-auto p-[7px] rounded-md transition-all",
            "hover:bg-gray-200 dark:hover:bg-gray-700",
            model.isPinned
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation(); // 防止触发外层div的onClick
            handleTogglePin(model.modelId, model.isPinned);
          }}
        >
          <Pin
            className={cn(
              "w-3 h-3 -rotate-45",
              model.isPinned
                ? "text-indigo-500 fill-indigo-500"
                : "text-gray-400"
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="pt-2">
      {/* 渲染要显示的模型项 */}
      {modelsToShow.map(model => renderModelItem(model))}

      {/* 更多/收起按钮 (仅当模型总数大于4时显示) */}
      {hasMoreModels && (
         <div 
          className="flex items-center p-3 cursor-pointer"
          onClick={() => setIsMoreVisible(!isMoreVisible)}
        >
          <span className="text-xs text-gray-500 pl-1">{isMoreVisible ? "收起" : "更多"}</span>
          <ChevronDown className={cn("w-4 h-4 ml-1 text-gray-500 transition-transform", isMoreVisible && "rotate-180")} />
        </div>
      )}
      
      {/* 分隔线 */}
      <div className="mx-2 my-2 border-b border-gray-200 dark:border-gray-800"></div>
    </section>
  );
} 