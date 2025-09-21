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
    <div className={`flex flex-col items-center justify-center ${className} bg-red-100`}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-blue-100">
        <AiAssistantAvatar />
      </div>
      
      {promptCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md bg-purple-100">
          {promptCards.map((card, index) => (
            <div 
              key={index}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors group cursor-pointer"
              onClick={() => card.onClick(card.promptText)}
            >
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600">{card.title}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 