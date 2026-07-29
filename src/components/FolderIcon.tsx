import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface FolderIconProps {
  appIds: string[];
  windows: any;
  isTouchUI?: boolean;
}

export const FolderIcon = ({ appIds, windows, isTouchUI }: FolderIconProps) => {
  const displayApps = appIds.slice(0, 9);
  return (
    <div 
      className={cn(
        "w-full h-full bg-black/20 backdrop-blur-md border border-white/10 p-2 grid gap-1 overflow-hidden",
        "grid-cols-3 grid-rows-3 drop-shadow-xl",
        isTouchUI ? "rounded-[16px] xl:rounded-[20px]" : "rounded-xl",
        "squircle"
      )}
    >
      {displayApps.map((id: string) => {
        const app = windows[id];
        if (!app) return <div key={id} />;
        return (
          <div key={id} className="w-full h-full rounded-sm overflow-hidden bg-white/5">
            <img src={app.icon} alt={app.title} className="w-full h-full object-cover" />
          </div>
        );
      })}
    </div>
  );
};
