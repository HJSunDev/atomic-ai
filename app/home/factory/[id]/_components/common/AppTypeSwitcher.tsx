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

