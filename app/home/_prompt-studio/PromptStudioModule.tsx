"use client";

import { AtomicBlock } from "./_components/AtomicBlock";
import { TestBlock } from "./_components/TestBlock";
import { HopeBlock } from "./_components/HopeBlock";
import { NewBlock } from "./_components/NewBlock";

export const PromptStudioModule = () => {
  return (
    <div className="w-full h-full bg-muted/20 overflow-y-auto flex justify-center bg-red-100">
      <div className="max-w-[70rem] w-full bg-blue-100">
        <AtomicBlock />
        <NewBlock />
        <HopeBlock />
        <TestBlock />

      </div>
    </div>
  );
}; 