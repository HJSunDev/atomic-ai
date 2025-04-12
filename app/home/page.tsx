"use client";

import { DashboardPageWrapper } from "./_components/DashboardPageWrapper";
import { useSidebarMenuStore } from "@/store";
import { ReactNode } from "react";
import { ChatModule} from "./_chat/ChatModule";
import { PromptStudioModule } from "./_prompt-studio/PromptStudioModule";

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

export default function DashboardPage() {
  // 获取当前活动的菜单ID
  const { activeMenuId } = useSidebarMenuStore();

  // 菜单内容映射表 - 将菜单ID映射到对应的内容组件
  const menuContentMap: Record<string, ReactNode> = {
    // 智创模块使用独立组件
    "prompt-studio": <PromptStudioModule />,
    // 聊天模块使用独立组件
    "chat": <ChatModule />,
    // 其他菜单项使用占位内容
    "favorites": <MenuPlaceholder title="收藏夹" description="这里展示您收藏的内容。" />,
    "resource-library": <MenuPlaceholder title="资源库" description="浏览和管理您的资源。" />,
    "documents": <MenuPlaceholder title="文档中心" description="查看和编辑您的文档。" />,
    "knowledge-base": <MenuPlaceholder title="知识库" description="探索和学习知识资源。" />,
    "history": <MenuPlaceholder title="历史记录" description="查看您的操作历史。" />,
    "feedback": <MenuPlaceholder title="反馈中心" description="提供您的意见和建议。" />,
    "settings": <MenuPlaceholder title="系统设置" description="调整系统的各项设置和配置。" />,
    "profile": <MenuPlaceholder title="个人资料" description="管理您的个人信息和账户设置。" />,
  };

  // 获取当前菜单内容，如果没有对应内容则显示智创模块
  const currentContent = menuContentMap[activeMenuId] || menuContentMap["prompt-studio"];

  return (
    <DashboardPageWrapper>
      {currentContent}
    </DashboardPageWrapper>
  );
} 