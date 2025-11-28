import { Code2, FileCode, Construction } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppType } from "./types";

interface AppTypeSwitcherProps {
  value: AppType;
  onChange: (type: AppType) => void;
  className?: string;
}

export const AppTypeSwitcher = ({ value, onChange, className }: AppTypeSwitcherProps) => {
  return (
    <div className={cn("flex items-center gap-2 bg-muted/30 p-1 rounded-lg", className)}>
      <button
        onClick={() => onChange("html")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
          value === "html"
            ? "bg-white dark:bg-slate-800 shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <FileCode className="w-3.5 h-3.5" />
        <span>HTML 应用</span>
      </button>

      <button
        onClick={() => onChange("react")}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
          value === "react"
            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-200 dark:ring-amber-800"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {value === "react" ? (
          <>
            <Construction className="w-3.5 h-3.5" />
            <span>React 维护中</span>
          </>
        ) : (
          <>
            <Code2 className="w-3.5 h-3.5" />
            <span>React 应用</span>
          </>
        )}
      </button>
    </div>
  );
};

interface AppTypeInfoBadgeProps {
  type: AppType;
  className?: string;
}

export const AppTypeInfoBadge = ({ type, className }: AppTypeInfoBadgeProps) => {
  const config: Record<AppType, {
    icon: typeof Code2;
    label: string;
    color: string;
  }> = {
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

