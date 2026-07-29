import React, { useState, useRef, useEffect } from 'react';
import { Box, User, Maximize, Shirt, Orbit, Pointer, Undo, Plus, MousePointer2, ArrowLeftRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Hat3DViewer } from './Hat3DViewer';

export const CloAppView = () => {
  const [showNotes, setShowNotes] = useState(false);
  
  // Pan and Zoom state for 2D workspace
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const workspaceRef = useRef<HTMLDivElement>(null);
  const viewport3DRef = useRef<HTMLDivElement>(null);

  const [splitRatio, setSplitRatio] = useState(50);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingSplit = useRef(false);

  useEffect(() => {
    const handleGlobalMove = (e: PointerEvent) => {
      if (isDraggingSplit.current && splitContainerRef.current) {
        const bounds = splitContainerRef.current.getBoundingClientRect();
        const newRatio = ((e.clientX - bounds.left) / bounds.width) * 100;
        setSplitRatio(Math.max(10, Math.min(newRatio, 90)));
      }
    };
    const handleGlobalUp = () => {
      if (isDraggingSplit.current) {
        isDraggingSplit.current = false;
        document.body.style.cursor = '';
      }
    };

    document.addEventListener('pointermove', handleGlobalMove);
    document.addEventListener('pointerup', handleGlobalUp);
    return () => {
      document.removeEventListener('pointermove', handleGlobalMove);
      document.removeEventListener('pointerup', handleGlobalUp);
    };
  }, []);

  const handleSplitDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDraggingSplit.current = true;
    document.body.style.cursor = 'col-resize';
  };

  type ContextMenuState = {
    visible: boolean;
    x: number;
    y: number;
    type: '3d' | '2d' | null;
  };
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, type: null });

  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        setScale(s => {
          const newScale = s - e.deltaY * 0.01;
          return Math.max(0.1, Math.min(newScale, 5));
        });
      } else {
        setPosition(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY
        }));
      }
    };

    workspace.addEventListener('wheel', handleWheel, { passive: false });

    // Handle 3D Viewport pinch zoom isolation
    const handleWheel3D = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    const handleGesture3D = (e: Event) => {
      e.preventDefault();
    };

    const vp3d = viewport3DRef.current;
    if (vp3d) {
      vp3d.addEventListener('wheel', handleWheel3D, { passive: false });
      (vp3d as any).addEventListener('gesturestart', handleGesture3D, { passive: false });
      (vp3d as any).addEventListener('gesturechange', handleGesture3D, { passive: false });
    }

    return () => {
      workspace.removeEventListener('wheel', handleWheel);
      if (vp3d) {
        vp3d.removeEventListener('wheel', handleWheel3D);
        (vp3d as any).removeEventListener('gesturestart', handleGesture3D);
        (vp3d as any).removeEventListener('gesturechange', handleGesture3D);
      }
    };
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, type: '3d' | '2d') => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    if (workspaceRef.current) {
      workspaceRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    if (workspaceRef.current) {
      workspaceRef.current.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#1e1e1e] text-white font-sans overflow-hidden rounded-b-[10px]">
      
      {/* Main Split Layout */}
      <div 
        className="flex-1 flex overflow-hidden"
        ref={splitContainerRef}
      >
        
        {/* 3D Viewport (Left Panel) */}
        <div 
          className="flex flex-col relative z-0"
          style={{ width: `${splitRatio}%` }}
        >
          {/* Top Bar */}
          <div className="h-[28px] shrink-0 bg-[#282828] flex items-center justify-center px-4 relative border-b border-black" style={{ WebkitAppRegion: 'drag' } as any}>
            <div className="text-[12px] text-[#ccc] font-medium pointer-events-none">Untitled.zprj</div>
            <div className="absolute right-2 top-1.5 flex gap-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
              <div className="w-3 h-3 text-[#999] hover:text-white cursor-pointer"><Maximize size={12} /></div>
            </div>
          </div>

          {/* 3D Content Area */}
          <div 
            ref={viewport3DRef}
            className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#b8bcbf] to-[#f4f5f6] touch-none"
          >
            <Hat3DViewer onContextMenu={(e) => handleContextMenu(e, '3d')} />
          </div>
        </div>

        {/* Divider */}
        <div 
          className="w-1.5 shrink-0 bg-[#111] hover:bg-[#444] cursor-col-resize z-50 relative group transition-colors flex items-center justify-center touch-none"
          onPointerDown={handleSplitDown}
        >
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-[#444] text-white rounded shadow-md border border-[#222] pointer-events-none">
            <ArrowLeftRight size={12} strokeWidth={2} />
          </div>
        </div>

        {/* 2D Workspace (Right Panel) */}
        <div className="flex-1 flex flex-col relative z-0">
          {/* Top Bar */}
          <div className="h-[28px] shrink-0 bg-[#282828] flex items-center justify-center px-4 border-b border-black" style={{ WebkitAppRegion: 'drag' } as any}>
            <div className="text-[12px] text-[#ccc] font-medium pointer-events-none">2D Pattern Window</div>
          </div>

          {/* 2D Canvas */}
          <div 
            ref={workspaceRef}
            className="flex-1 relative overflow-hidden bg-[#c3c5c5] cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onContextMenu={(e) => handleContextMenu(e, '2d')}
          >
             <div 
               className="absolute top-0 left-0 w-full h-full origin-center pointer-events-none"
               style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
             >
               {/* Pattern Pieces SVG */}
               <svg width="100%" height="100%" className="absolute inset-0 overflow-visible">
                 <defs>
                   <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                     <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100,100,100,0.15)" strokeWidth="1" />
                   </pattern>
                 </defs>
                 
                 {/* Infinite grid background */}
                 <rect x="-10000" y="-10000" width="20000" height="20000" fill="url(#grid)" />

                 {/* Center axes */}
                 <line x1="0" y1="-10000" x2="0" y2="10000" stroke="#777" strokeWidth="1" />
                 <line x1="-10000" y1="0" x2="10000" y2="0" stroke="#777" strokeWidth="1" />

                 {/* Bodice Front */}
                 <g transform="translate(150, 100)">
                   <path 
                     d="M 50 0 L 150 20 Q 200 100 180 250 L 170 400 L 0 420 L -10 250 Q -30 100 50 0 Z" 
                     fill="#e3e5e6" 
                     stroke="#222" 
                     strokeWidth="1.5" 
                     className="pointer-events-auto hover:fill-[#f0f2f3] transition-colors shadow-sm"
                     style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                   />
                   <line x1="80" y1="20" x2="80" y2="400" stroke="#ff3366" strokeWidth="1.5" strokeDasharray="5,5" />
                   <text x="85" y="200" fill="#ff3366" fontSize="12" fontFamily="monospace" transform="rotate(-90 85 200)">GRAINLINE</text>
                   
                   {/* Callout anchor 1 */}
                   <circle cx="150" cy="20" r="4" fill="#000" />
                   <line x1="150" y1="20" x2="250" y2="-40" stroke="#444" strokeWidth="1" />
                 </g>

                 {/* Bodice Back */}
                 <g transform="translate(500, 120)">
                   <path 
                     d="M 30 0 L 140 10 Q 180 120 160 260 L 150 390 L 0 400 L -5 260 Q -10 120 30 0 Z" 
                     fill="#e3e5e6" 
                     stroke="#222" 
                     strokeWidth="1.5" 
                     className="pointer-events-auto hover:fill-[#f0f2f3] transition-colors"
                     style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                   />
                   <line x1="70" y1="10" x2="70" y2="390" stroke="#ff3366" strokeWidth="1.5" strokeDasharray="5,5" />
                   
                   {/* Callout anchor 2 */}
                   <circle cx="140" cy="10" r="4" fill="#000" />
                   <line x1="140" y1="10" x2="250" y2="-20" stroke="#444" strokeWidth="1" />
                 </g>
               </svg>

               {/* UI Callouts (HTML overlaid on SVG) */}
               <div className="absolute top-[60px] left-[400px] bg-[#1c1c1e] text-white border border-[#333] rounded p-2 shadow-xl pointer-events-auto max-w-[150px]">
                 <div className="text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">Shoulder Seam</div>
                 <div className="text-[12px] text-white/90 leading-snug">1cm allowance, topstitch flat.</div>
               </div>

               <div className="absolute top-[100px] left-[750px] bg-[#1c1c1e] text-white border border-[#333] rounded p-2 shadow-xl pointer-events-auto max-w-[150px]">
                 <div className="text-[10px] text-white/50 font-bold mb-1 uppercase tracking-wider">Back Neckline</div>
                 <div className="text-[12px] text-white/90 leading-snug">Ease in excess fabric here.</div>
               </div>
             </div>
            
            {/* Notes Toggle Button */}
            <div className="absolute top-4 right-4 z-10">
               <button 
                 onClick={() => setShowNotes(!showNotes)} 
                 className={cn("bg-[#444]/90 rounded-md p-2 shadow-sm border border-black/20 text-[#ccc] hover:text-white transition-colors flex items-center gap-2", showNotes && "bg-blue-600 text-white")}
               >
                 <Plus size={14} strokeWidth={2} />
                 <span className="text-[12px] font-medium">Specs</span>
               </button>
            </div>
          </div>
        </div>

        {/* Project Notes Panel */}
        {showNotes && (
          <div className="w-[300px] shrink-0 bg-[#1c1c1e] border-l border-[#111] flex flex-col z-10">
            <div className="h-[28px] shrink-0 bg-[#282828] border-b border-black flex items-center px-4" style={{ WebkitAppRegion: 'drag' } as any}>
              <div className="text-[12px] text-[#ccc] font-medium tracking-wide pointer-events-none">Project Specs</div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              <div className="font-mono text-[12px] text-[#ccc] space-y-6">
                <div>
                  <div className="text-[#666] mb-1 font-bold">PROJECT</div>
                  <div className="text-white">AW26 Core Block - Experimental</div>
                </div>
                
                <div>
                  <div className="text-[#666] mb-1 font-bold">FABRIC</div>
                  <div>Heavyweight Cotton French Terry</div>
                  <div className="text-[#888] mt-1 space-y-0.5 text-[11px]">
                    <div>Weight: 450gsm</div>
                    <div>Shrinkage: 3% warp, 2% weft</div>
                  </div>
                </div>

                <div>
                  <div className="text-[#666] mb-1 font-bold">NOTES</div>
                  <p className="leading-relaxed">
                    Adjusted armhole depth for extended mobility. Ensure grainline alignment is strict on front bodice to prevent twisting post-wash.
                  </p>
                </div>

                <div>
                  <div className="text-[#666] mb-1 font-bold">TECHNIQUE</div>
                  <p className="leading-relaxed text-[#999]">
                    Overlock all internal seams (4-thread). Coverstitch hems 2.5cm total turn up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Status Bar */}
      <div className="h-[24px] shrink-0 bg-[#1a1a1a] flex items-center px-4">
        <div className="text-[11px] text-[#888] font-mono">Version: 2026.0.238 (r56171)</div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-50 bg-[#2b2b2b] border border-[#111] rounded shadow-2xl py-1 min-w-[180px] text-[12px] text-[#ddd]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {contextMenu.type === '3d' ? (
            <>
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Add Avatar...</button>
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Change Pose</button>
              <div className="h-px bg-[#444] my-1 mx-2" />
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Reset View</button>
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Simulation Properties</button>
              <div className="h-px bg-[#444] my-1 mx-2" />
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Wireframe on Surface</button>
            </>
          ) : (
            <>
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Add Pattern Piece</button>
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Edit Curvature</button>
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Split Line</button>
              <div className="h-px bg-[#444] my-1 mx-2" />
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Trace</button>
              <button className="w-full text-left px-4 py-1 hover:bg-[#0a84ff] hover:text-white transition-colors">Sync to 3D</button>
            </>
          )}
        </div>
      )}

    </div>
  );
};

