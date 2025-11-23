import { useState } from "react";
import { Code2, FileCode, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppType } from "../types";

interface AppTypeSwitcherProps {
  value: AppType;
  onChange: (type: AppType) => void;
  className?: string;
}

export const AppTypeSwitcher = ({ value, onChange, className }: AppTypeSwitcherProps) => {
  return (
    <div className={cn("flex items-center gap-2 bg-muted/30 p-1 rounded-lg", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onChange("html")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              value === "html"
                ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>HTML 应用</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">纯 HTML/CSS/JS</p>
            <p className="text-xs text-muted-foreground">
              适合简单页面、营销落地页<br/>
              单文件，双击即可运行，一键下载
            </p>
          </div>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onChange("react")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              value === "react"
                ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>React 应用</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">React + TypeScript</p>
            <p className="text-xs text-muted-foreground">
              适合复杂交互、组件化开发<br/>
              支持状态管理、Hooks、现代化组件库
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

interface AppTypeInfoBadgeProps {
  type: AppType;
  className?: string;
}

export const AppTypeInfoBadge = ({ type, className }: AppTypeInfoBadgeProps) => {
  const config = {
    react: {
      icon: Code2,
      label: "React",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
    html: {
      icon: FileCode,
      label: "HTML",
      color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    },
  };

  const { icon: Icon, label, color } = config[type];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium", color, className)}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
};

