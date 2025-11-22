"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { CheckSquare2, Users, BarChart3 } from "lucide-react";
import { mockGenerateCode } from "./mock-ai-generator";

interface EditorChatPanelProps {
  appId: Id<"apps">;
  onCodeGenerated?: (code: string) => void;
}

const TEMPLATES = [
  {
    id: "task",
    name: "任务管理看板",
    description: "任务添加、状态切换、优先级管理",
    icon: CheckSquare2,
    prompt: "任务管理",
  },
  {
    id: "stats",
    name: "数据统计面板",
    description: "关键指标、趋势分析、实时活动",
    icon: BarChart3,
    prompt: "数据统计",
  },
  {
    id: "users",
    name: "用户管理后台",
    description: "用户列表、搜索过滤、角色管理",
    icon: Users,
    prompt: "用户管理",
  },
];

export const EditorChatPanel = ({ appId, onCodeGenerated }: EditorChatPanelProps) => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
    setActiveTemplate(template.id);
    const result = mockGenerateCode(template.prompt);
    if (onCodeGenerated && result.code) {
      onCodeGenerated(result.code);
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="h-10 flex items-center px-4 border-b font-medium text-sm text-muted-foreground shrink-0">
        模板选择
      </div>

      {/* Templates List */}
      <div className="flex-1 p-4 overflow-auto space-y-3">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          const isActive = activeTemplate === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

