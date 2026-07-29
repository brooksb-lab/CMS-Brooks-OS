import React, { useState, useRef } from 'react';

export const PhotoshopView = () => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(s => Math.min(Math.max(0.1, s * zoomFactor), 5));
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#282828] text-[#d4d4d4] font-sans overflow-hidden select-none" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Tabs Bar */}
      <div className="h-[34px] w-full flex items-end shrink-0 bg-[#2d2d2d] border-b border-[#1a1a1a]">
        <div className="flex ml-1 h-full items-end pb-[1px]">
          <div className="flex items-center gap-3 h-full bg-[#282828] px-3 pt-2 text-[#d4d4d4] relative z-10 shadow-[0_-1px_0_rgba(255,255,255,0.05)_inset,0_1px_0_#282828_inset] border-t border-[#1a1a1a]">
            <span className="text-[12px] hover:text-white cursor-pointer ml-1">×</span>
            <span className="text-[13px] truncate pr-4 font-medium">Untitled-1 @ 100% (RGB/8)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative bg-[#282828]">
        {/* Top Ruler */}
        <div className="h-[20px] w-full shrink-0 border-b border-[#1a1a1a] bg-[#383838] flex items-end overflow-hidden relative font-base">
          <div className="absolute left-[20px] right-0 bottom-0 h-full">
            {Array.from({length: 60}).map((_, i) => (
              <div key={i} className="absolute bottom-0 h-[6px] border-l border-[#888]" style={{ left: `${i * 100}px` }}>
                <span className="absolute bottom-[2px] left-[2px] text-[9px] text-[#888]">{i * 100}</span>
                {Array.from({length: 9}).map((_, j) => (
                  <div key={j} className="absolute bottom-0 h-[3px] border-l border-[#888]" style={{ left: `${(j + 1) * 10}px` }} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Ruler */}
          <div className="w-[20px] h-full shrink-0 border-r border-[#1a1a1a] bg-[#383838] overflow-hidden relative">
            <div className="absolute top-0 bottom-0 right-0 w-full">
              {Array.from({length: 60}).map((_, i) => (
                <div key={i} className="absolute right-0 w-[6px] border-t border-[#888]" style={{ top: `${i * 100}px` }}>
                  <span className="absolute top-[2px] right-[2px] text-[9px] text-[#888] rotate-[-90deg] origin-right mr-1">{i * 100}</span>
                  {Array.from({length: 9}).map((_, j) => (
                    <div key={j} className="absolute right-0 w-[3px] border-t border-[#888]" style={{ top: `${(j + 1) * 10}px` }} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Viewport */}
          <div 
            ref={containerRef}
            onWheel={handleWheel}
            className="flex-1 overflow-auto relative custom-scrollbar flex items-center justify-center p-8 bg-[#282828]"
          >
            <div 
              className="w-[1000px] h-[800px] bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] flex shrink-0"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-[26px] w-full flex items-center shrink-0 bg-[#323232] border-t border-[#1a1a1a] px-3 text-[12px] text-[#b0b0b0]">
        <div className="flex items-center gap-4">
          <span className="font-medium text-[#d4d4d4] w-[45px]">{Math.round(scale * 100)}%</span>
          <span>2000 px x 2000 px (300 ppi)</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-white"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  );
};

