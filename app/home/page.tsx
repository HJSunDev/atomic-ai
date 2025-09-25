"use client";

import { useSidebarMenuStore, MenuItemId } from "@/store";
import { ReactNode, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChatModule} from "./_chat/ChatModule";
import { PromptStudioModule } from "./_prompt-studio/PromptStudioModule";
import { HomeModule } from "./_home/HomeModule";
import { useManageAiContext } from "@/hooks/use-manage-ai-context";
import { AiContext } from "@/store/home/use-ai-context-store";

// 菜单占位内容组件
interface PlaceholderProps {
  title: string;
  description: string;
}

const MenuPlaceholder = ({ title, description }: PlaceholderProps) => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

// 定义菜单模块到AI上下文的映射关系
const MENU_TO_AI_CONTEXT: Record<string, AiContext | null> = {
  "home": { id: "home-module", type: "home", showAiAssistant: true, catalystPlacement: 'global' },
  "prompt-studio": { id: "prompt-studio-module", type: "prompt-studio", showAiAssistant: false, catalystPlacement: 'global' },
  "chat": { id: "chat-module", type: "chat", showAiAssistant: false, catalystPlacement: 'global' },
  "discovery": { id: "discovery-module", type: "discovery", showAiAssistant: false, catalystPlacement: 'global' },
  "documents": { id: "documents-module", type: "documents", showAiAssistant: false, catalystPlacement: 'global' },
  "knowledge-base": { id: "knowledge-base-module", type: "knowledge-base", showAiAssistant: false, catalystPlacement: 'global' },
  "feedback": { id: "feedback-module", type: "feedback", showAiAssistant: false, catalystPlacement: 'global' },
  "settings": { id: "settings-module", type: "settings", showAiAssistant: false, catalystPlacement: 'global' },
  "profile": { id: "profile-module", type: "profile", showAiAssistant: false, catalystPlacement: 'global' },
};

// 负责管理AI上下文生命周期的包装组件
function ModuleContextManager({ menuId, children }: { menuId: string, children: React.ReactNode }) {
  // 使用 useMemo 确保上下文对象在 menuId 不变时是稳定的
  const context = useMemo(() => MENU_TO_AI_CONTEXT[menuId] ?? null, [menuId]);
  
  // 将上下文管理委托给 Hook
  useManageAiContext(context);
  
  return <>{children}</>;
}


export default function DashboardPage() {
  const router = useRouter();
  // 获取当前活动的菜单ID
  const { activeMenuId } = useSidebarMenuStore();

  // 预加载常用页面，提升整体用户体验
  useEffect(() => {
    router.prefetch('/home/prompt-document');
  }, [router]);

  // 菜单内容映射表 - 将菜单ID映射到对应的内容组件
  const menuContentMap: Record<string, ReactNode> = {
    // 主页模块
    "home": <HomeModule />,
    // 智创模块使用独立组件
    "prompt-studio": <PromptStudioModule />,
    // 聊天模块使用独立组件
    "chat": <ChatModule />,
    // 发现模块
    "discovery": <MenuPlaceholder title="发现" description="探索和发现更多有趣的内容和创意。" />,
    // 其他菜单项使用占位内容
    "documents": <MenuPlaceholder title="文档中心" description="查看和编辑您的文档。" />,
    "knowledge-base": <MenuPlaceholder title="知识库" description="探索和学习知识资源。" />,
    "feedback": <MenuPlaceholder title="反馈中心" description="提供您的意见和建议。" />,
    "settings": <MenuPlaceholder title="系统设置" description="调整系统的各项设置和配置。" />,
    "profile": <MenuPlaceholder title="个人资料" description="管理您的个人信息和账户设置。" />,
  };

  // 确定要渲染的模块和对应的菜单ID (处理 fallback 情况)
  const effectiveMenuId = activeMenuId in menuContentMap ? activeMenuId : "home";
  // 获取当前要渲染的模块内容
  const currentContent = menuContentMap[effectiveMenuId];

  return (
    // 使用 ModuleContextManager 并将 activeMenuId 作为 key
    // 当 activeMenuId 变化时，React会销毁旧的ModuleContextManager并创建一个新的
    // 触发了 useManageAiContext 的挂载和卸载逻辑
    <ModuleContextManager key={effectiveMenuId} menuId={effectiveMenuId}>
      {currentContent}
    </ModuleContextManager>
  );
} 