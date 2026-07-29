import React from 'react';

import { cn } from '@/src/lib/utils';

interface AppWindowContentProps {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  details: string;
  previewImage: string;
  isMobile?: boolean;
}

export const AppWindowContent = ({ icon, title, subtitle, description, details, previewImage, isMobile }: AppWindowContentProps) => {
  return (
    <div className={cn(
      "flex flex-col min-h-full bg-transparent text-white p-4 md:p-6 text-[13px] md:text-sm"
    )}>
      {/* Header */}
      <div className="flex gap-4 items-center mb-4 md:mb-6 pb-4 md:pb-6 border-b border-white/10 shrink-0">
        <img src={icon} alt={title} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover drop-shadow-md" />
        <div>
          <h2 className="font-bold text-lg md:text-xl">{title}</h2>
          <p className="text-white/50 text-sm md:text-base">{subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 text-white/80 leading-relaxed shrink-0 text-sm md:text-base">
        {description}
      </div>

      {/* Details */}
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-1 text-white/50 mb-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          <span className="font-semibold uppercase tracking-wider text-[10px]">Details</span>
        </div>
        <div className="pl-4 font-medium text-white/90">
          {details}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1 text-white/50 mb-2 shrink-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          <span className="font-semibold uppercase tracking-wider text-[10px]">Preview</span>
        </div>
        <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center p-4">
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};
