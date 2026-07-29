import React, { useState } from 'react';
import { useWindowManager } from '../hooks/useWindowManager';

export const MacintoshHDView = () => {
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = React.useRef({ x: 0, width: 0 });
  const { windows, toggleWindow } = useWindowManager();

  const handleDragStart = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, width: sidebarWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDrag = (e: React.PointerEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.x;
      const newWidth = Math.min(Math.max(150, dragStartRef.current.width + dx), 400);
      setSidebarWidth(newWidth);
    }
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const projectKeys = Object.keys(windows).filter(key => key !== 'macintosh_hd' && !windows[key].title?.includes('Contact'));
  
  return (
    <div className="flex h-full w-full bg-[#1e1e1e] text-white select-none">
      {/* Sidebar */}
      <div 
        className="flex flex-col bg-[#282828] border-r border-black/30 pt-4 px-2 overflow-y-auto"
        style={{ width: sidebarWidth }}
      >
        <div className="px-2 mb-2 text-[11px] font-bold text-white/50 tracking-wider">Favorites</div>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center px-2 py-1.5 rounded-md hover:bg-white/10 cursor-pointer mb-4">
            <span className="mr-2 opacity-80 text-lg">💻</span>
            <span className="text-[13px] font-medium text-white/90">Archive</span>
          </div>

          <div className="px-2 mb-2 text-[11px] font-bold text-white/50 tracking-wider">Projects</div>
          {projectKeys.map(key => {
            const proj = windows[key];
            return (
              <div 
                key={key} 
                onClick={() => toggleWindow(key)}
                className="flex items-center px-2 py-1.5 rounded-md hover:bg-white/10 cursor-pointer"
              >
                {proj.icon ? (
                  <img src={proj.icon} alt="" className="w-4 h-4 mr-2 object-contain filter drop-shadow-sm opacity-80" />
                ) : (
                  <span className="mr-2 opacity-80 text-[14px]">📁</span>
                )}
                <span className="text-[13px] font-medium text-white/90 truncate">{proj.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resizer */}
      <div 
        className="w-1.5 -ml-[0.75px] cursor-col-resize hover:bg-blue-500/50 active:bg-blue-500 z-10 transition-colors"
        onPointerDown={handleDragStart}
        onPointerMove={handleDrag}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      />

      {/* Main Content */}
      <div className="flex-1 bg-[#1e1e1e] p-6 overflow-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 justify-items-center relative">
          {projectKeys.map(key => {
            const proj = windows[key];
            return (
              <div 
                key={key} 
                onDoubleClick={() => toggleWindow(key)}
                className="flex flex-col items-center w-[84px] cursor-pointer group"
              >
                <div className="w-[72px] h-[72px] flex items-center justify-center mb-1 relative">
                  {proj.icon ? (
                    <img src={proj.icon} alt="" className="w-14 h-14 object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-5xl drop-shadow-md group-hover:scale-105 transition-transform">📁</span>
                  )}
                </div>
                <span className="text-[11px] text-center font-medium text-white/90 group-hover:bg-blue-600/90 rounded px-1.5 py-0.5 leading-snug line-clamp-2">
                  {proj.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
