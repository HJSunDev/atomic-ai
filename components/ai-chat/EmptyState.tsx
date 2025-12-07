import React from "react";
import { AiAssistantAvatar } from "@/components/ai-assistant/AiAssistantAvatar";

interface EmptyStateProps {
  promptCards?: Array<{
    title: string;
    description: string;
    promptText: string;
    onClick: (promptText: string) => void;
  }>;
  // className prop用于自定义容器样式
  className?: string;
}

export function EmptyState({
  promptCards = [],
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className} `}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6">
        <AiAssistantAvatar />
      </div>
      
      {promptCards.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl px-4">
          {promptCards.map((card, index) => (
            <button 
              key={index}
              className="
                flex flex-col text-left
                w-full sm:w-64 p-4
                rounded-xl border border-gray-200 dark:border-gray-800
                bg-white dark:bg-[#1a1a1a]
                hover:bg-gray-50 dark:hover:bg-[#262626]
                transition-colors cursor-pointer outline-none
              "
              onClick={() => card.onClick(card.promptText)}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-1.5 block">
                {card.title}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {card.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
