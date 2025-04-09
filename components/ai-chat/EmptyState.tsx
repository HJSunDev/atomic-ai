import React from "react";
import { Bot } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  promptCards?: Array<{
    title: string;
    description: string;
    promptText: string;
    onClick: (promptText: string) => void;
  }>;
}

export function EmptyState({ 
  title = "Atomic",
  description = "我是您的智能开发助手，随时为您提供编程相关问题的解答与支持",
  promptCards = []
}: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
        <Bot className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-[300px]">{description}</p>
      
      {promptCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {promptCards.map((card, index) => (
            <div 
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors group cursor-pointer"
              onClick={() => card.onClick(card.promptText)}
            >
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{card.title}</span>
              </div>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 