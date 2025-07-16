import React, { useState, useMemo } from "react";
import { ChevronDown, Pin, Plus } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

  // 新建聊天点击事件处理
  const handleNewChat = () => {
    console.log("创建新的聊天");
    // TODO: 实现创建新聊天的逻辑
    // 1. 可能需要调用一个mutation来创建新的会话
    // 2. 清空当前聊天界面的状态
    // 3. 将selectedConversationId设置为新创建的会话ID
    setSelectedModelId(""); // 示例：取消模型选择
  };


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
      <section className="pt-2">
        {/* 模型项骨架屏 */}
        <div className="space-y-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center p-[7px] mx-2">
              {/* 圆形头像骨架屏 */}
              <Skeleton className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 mr-2" />
              {/* 模型名称骨架屏 */}
              <Skeleton className="h-3 flex-1 bg-gray-300 dark:bg-gray-600" style={{ width: `${60 + i * 10}%` }} />
              {/* Pin 图标骨架屏 */}
              <Skeleton className="w-3 h-3 ml-2 bg-gray-300 dark:bg-gray-600" />
            </div>
          ))}
        </div>
        
        {/* 更多按钮骨架屏 */}
        <div className="flex items-center p-3">
          <Skeleton className="h-3 w-8 bg-gray-300 dark:bg-gray-600" />
          <Skeleton className="w-4 h-4 ml-1 bg-gray-300 dark:bg-gray-600" />
        </div>
        
        {/* 分隔线骨架屏 */}
        <div className="mx-2 my-2">
          <Skeleton className="h-px w-full bg-gray-300 dark:bg-gray-600" />
        </div>
      </section>
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
      {/* 新建聊天按钮 */}
      <div className="px-2 pb-3">
        <button
          onClick={handleNewChat}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all duration-200",
            "bg-gray-50 dark:bg-gray-800/50",
            "hover:bg-[#947CF1]/10 dark:hover:bg-[#947CF1]/15",
            "text-gray-600 dark:text-gray-400 hover:text-[#947CF1] dark:hover:text-[#947CF1]",
            "cursor-pointer group"
          )}
        >
          <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="text-xs font-medium">新建聊天</span>
        </button>
      </div>
      
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