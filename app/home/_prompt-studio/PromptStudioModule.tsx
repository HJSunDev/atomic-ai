"use client";

import { TestBlock } from "./_components/TestBlock";
import { AtomicBlock } from "./_components/AtomicBlock";

export const PromptStudioModule = () => {
  return (
    <div className="w-full h-full bg-muted/20 overflow-y-auto flex justify-center bg-red-100">
      <div className="max-w-[70rem] w-full bg-blue-100">
        <TestBlock />
        <AtomicBlock />
      </div>
    </div>
  );
}; 