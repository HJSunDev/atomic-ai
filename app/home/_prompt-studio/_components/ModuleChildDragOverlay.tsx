"use client";

import type { GridItem } from './types';

interface ModuleChildDragOverlayProps {
  child: GridItem;
}

export function ModuleChildDragOverlay({ child }: ModuleChildDragOverlayProps) {
  return (
    <div
      className="group relative flex items-center justify-between bg-white border border-neutral-200 rounded-lg px-2 py-1.5 shadow-lg text-sm cursor-grabbing"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[13px] text-foreground/90 leading-tight truncate">{child.title}</div>
      </div>
    </div>
  );
}


